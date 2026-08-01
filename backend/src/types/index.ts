export type Role = 'admin' | 'teacher' | 'nurse' | 'student';

export interface Profile {
  id: string;
  school_id: string | null;
  role: Role;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string | undefined;
        profile: Profile | null;
      };
    }
  }
}
