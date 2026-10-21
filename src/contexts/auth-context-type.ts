import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'moderator' | 'teacher' | 'student';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: UserRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isModeratorOrAbove: boolean;
  isTeacherOrAbove: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user: User | null; roles: UserRole[] }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}
