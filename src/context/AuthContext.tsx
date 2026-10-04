import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authErrorMessage } from '../lib/errors';
import { signInLimiter, signUpLimiter } from '../lib/rateLimit';
import { supabase } from '../lib/supabase';
import { profiles } from '../repositories';
import type { Profile } from '../types/profile';

export interface AuthUser {
  id: string;
  email: string;
}

export interface SignUpDetails {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  bio: string;
}

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (input: SignUpDetails) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!supabase) return;
    const toUser = (u: { id: string; email?: string } | undefined): AuthUser | null =>
      u ? { id: u.id, email: u.email ?? '' } : null;
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user));
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(toUser(session?.user)));
    return () => data.subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return setProfile(null);
    try {
      setProfile(await profiles.get(userId));
    } catch {
      setProfile(null);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    if (!userId) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    profiles.get(userId).then((p) => !cancelled && setProfile(p)).catch(() => undefined).finally(() => !cancelled && setProfileLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Accounts are not available right now.';
    const wait = signInLimiter.retryAfterSeconds();
    if (wait > 0) return `Too many attempts. Please wait ${wait} seconds and try again.`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      signInLimiter.record();
      return authErrorMessage(error, 'signin');
    }
    signInLimiter.reset();
    return null;
  }, []);

  const signUp = useCallback(async (d: SignUpDetails) => {
    if (!supabase) return { error: 'Accounts are not available right now.', needsConfirmation: false };
    const wait = signUpLimiter.retryAfterSeconds();
    if (wait > 0) return { error: `Too many attempts. Please wait ${wait} seconds and try again.`, needsConfirmation: false };
    signUpLimiter.record();
    // Name, phone and bio travel as metadata; a database trigger copies them into the profile.
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: { data: { full_name: d.fullName, phone: d.phone, bio: d.bio } },
    });
    if (error) return { error: authErrorMessage(error, 'signup'), needsConfirmation: false };
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, profile, profileLoading, isAdmin: profile?.role === 'admin', refreshProfile, signIn, signUp, signOut }),
    [user, loading, profile, profileLoading, refreshProfile, signIn, signUp, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
