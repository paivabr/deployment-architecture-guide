import { useEffect, useState, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserRole, Profile } from './auth-context-type';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileAndRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    if (!supabase) return [];

    // Fetch profile and roles in parallel
    const [profileResult, rolesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', userId)
        .single(),
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
    ]);

    if (profileResult.data) {
      setProfile(profileResult.data);
    }

    const fetchedRoles = rolesResult.data?.map(r => r.role as UserRole) || [];
    setRoles(fetchedRoles);
    
    return fetchedRoles;
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMounted) return;

        // If session is expired/invalid, clear it
        if (error?.message?.includes('Session Expired') || error?.message?.includes('Refresh Token')) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setRoles([]);
        } else if (user) {
          setUser(user);
          // Wait for roles to load before setting isLoading to false
          await fetchProfileAndRoles(user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Fetch profile/roles outside the callback to avoid deadlock
          setTimeout(() => fetchProfileAndRoles(currentUser.id), 0);
        } else {
          setProfile(null);
          setRoles([]);
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndRoles]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: new Error('Banco de dados não configurado'), user: null, roles: [] as UserRole[] };

    // Clear any stale session first to avoid refresh token issues
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!error && data.user) {
      // Update state immediately so navigation can proceed
      setUser(data.user);
      // Wait for roles to load
      const userRoles = await fetchProfileAndRoles(data.user.id);
      return { error: null, user: data.user, roles: userRoles };
    }
    
    return { error, user: null, roles: [] as UserRole[] };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: new Error('Banco de dados não configurado'), needsConfirmation: false };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // If session exists, user is logged in (no email confirmation required)
    const needsConfirmation = !data.session;

    return { error, needsConfirmation };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: new Error('Banco de dados não configurado') };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    return { error };
  };

  const updatePassword = async (password: string) => {
    if (!supabase) return { error: new Error('Banco de dados não configurado') };

    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const isAdmin = roles.includes('admin');
  const isModeratorOrAbove = roles.includes('admin') || roles.includes('moderator');
  const isTeacherOrAbove = roles.includes('admin') || roles.includes('moderator') || roles.includes('teacher');

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        roles,
        isLoading,
        isAdmin,
        isModeratorOrAbove,
        isTeacherOrAbove,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
