import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['admin', 'teacher', 'nurse', 'student']),
  school_id: z.string().uuid().nullable().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/signup — creates the auth.users row + matching profile row.
export async function signup(req: Request, res: Response) {
  const body = signupSchema.parse(req.body);

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    throw new ApiError(400, createError?.message ?? 'Could not create user');
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: created.user.id,
    school_id: body.school_id ?? null,
    role: body.role,
    first_name: body.first_name,
    last_name: body.last_name,
  });
  if (profileError) {
    // Roll back the orphaned auth user so signup stays retryable.
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    throw new ApiError(400, profileError.message);
  }

  res.status(201).json({ id: created.user.id, email: created.user.email });
}

// POST /api/auth/login — exchanges email/password for a Supabase session (JWT + refresh token).
export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (error || !data.session) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: { id: data.user?.id, email: data.user?.email },
  });
}

// POST /api/auth/logout — revokes the given refresh token's session server-side.
export async function logout(req: Request, res: Response) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    await supabaseAdmin.auth.admin.signOut(token);
  }
  res.status(204).send();
}

// GET /api/auth/me — returns the caller's user + profile (requireAuth already resolved it).
export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }
  res.json({ id: req.user.id, email: req.user.email, profile: req.user.profile });
}
