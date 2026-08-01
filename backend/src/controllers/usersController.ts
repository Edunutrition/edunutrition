import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/users — everyone in the caller's own school.
export async function listUsers(req: Request, res: Response) {
  const schoolId = req.user!.profile?.school_id;
  if (!schoolId) throw new ApiError(400, 'Ton compte n’est rattaché à aucune école');

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, role, first_name, last_name, created_at')
    .eq('school_id', schoolId)
    .order('role', { ascending: true });
  if (error) throw new ApiError(500, error.message);

  res.json(data);
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'nurse', 'student']),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
});

// POST /api/users/invite — sends a Supabase invite email and pre-creates the profile.
export async function inviteUser(req: Request, res: Response) {
  const schoolId = req.user!.profile?.school_id;
  if (!schoolId) throw new ApiError(400, 'Ton compte n’est rattaché à aucune école');

  const body = inviteSchema.parse(req.body);

  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(body.email, {
    redirectTo: `${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login`,
  });
  if (inviteError || !invited.user) {
    throw new ApiError(400, inviteError?.message ?? 'Impossible d’envoyer l’invitation');
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: invited.user.id,
    school_id: schoolId,
    role: body.role,
    first_name: body.first_name,
    last_name: body.last_name,
  });
  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    throw new ApiError(400, profileError.message);
  }

  res.status(201).json({ id: invited.user.id, email: invited.user.email, role: body.role });
}

const updateUserSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: z.enum(['admin', 'teacher', 'nurse', 'student']).optional(),
});

// PUT /api/users/:id — self can edit name; admin can edit anyone in their school (incl. role).
export async function updateUser(req: Request, res: Response) {
  const caller = req.user!;
  const isSelf = caller.id === req.params.id;
  const isAdmin = caller.profile?.role === 'admin';
  if (!isSelf && !isAdmin) {
    throw new ApiError(403, 'Tu ne peux modifier que ton propre profil');
  }

  const body = updateUserSchema.parse(req.body);
  if (body.role && !isAdmin) {
    throw new ApiError(403, 'Seul un·e administrateur·rice peut changer un rôle');
  }

  let query = supabaseAdmin.from('profiles').update(body).eq('id', req.params.id);
  if (!isSelf) {
    // Admin editing someone else — keep it scoped to their own school.
    query = query.eq('school_id', caller.profile!.school_id as string);
  }

  const { data, error } = await query.select().maybeSingle();
  if (error) throw new ApiError(400, error.message);
  if (!data) throw new ApiError(404, 'Utilisateur·rice introuvable');

  res.json(data);
}
