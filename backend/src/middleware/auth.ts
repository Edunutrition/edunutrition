import type { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabaseClient.js';
import { asyncHandler } from './asyncHandler.js';
import type { Profile, Role } from '../types/index.js';

/**
 * Verifies the Supabase-issued JWT sent as `Authorization: Bearer <token>`,
 * loads the matching profile row, and attaches both to req.user. Wrapped in
 * asyncHandler so an unexpected rejection (network error from Supabase, etc.)
 * reaches errorHandler instead of crashing the process.
 */
async function requireAuthImpl(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profileError) {
    return res.status(500).json({ error: 'Failed to load profile' });
  }

  req.user = {
    id: userData.user.id,
    email: userData.user.email,
    profile: profile as Profile | null,
  };

  next();
}

export const requireAuth = asyncHandler(requireAuthImpl);

/** Restricts a route to one or more roles. Must run after requireAuth. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.profile?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
