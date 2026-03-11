import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// Set to true to bypass real auth and use a mock user
const SIMULATE_AUTH = true;

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

const mockUser = {
  id: MOCK_USER_ID,
  email: "demo@knpconnect.app",
  app_metadata: {},
  user_metadata: { username: "demo_user", full_name: "Demo User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

const mockSession = {
  access_token: "mock-token",
  refresh_token: "mock-refresh",
  expires_in: 3600,
  token_type: "bearer",
  user: mockUser,
} as unknown as Session;

const mockProfile = {
  id: MOCK_USER_ID,
  user_id: MOCK_USER_ID,
  username: "demo_user",
  full_name: "Demo User",
  avatar_url: null,
  bio: "This is a simulated account for testing.",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as unknown as Tables<"profiles">;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Tables<"profiles"> | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isModerator: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(SIMULATE_AUTH ? mockSession : null);
  const [user, setUser] = useState<User | null>(SIMULATE_AUTH ? mockUser : null);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(SIMULATE_AUTH ? mockProfile : null);
  const [isAdmin, setIsAdmin] = useState(SIMULATE_AUTH);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(!SIMULATE_AUTH);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = data?.map((r) => r.role) || [];
    setIsAdmin(roles.includes("admin"));
    setIsModerator(roles.includes("moderator"));
  };

  const refreshProfile = async () => {
    if (SIMULATE_AUTH) return;
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    if (!SIMULATE_AUTH) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsModerator(false);
  };

  useEffect(() => {
    if (SIMULATE_AUTH) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            await fetchRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsModerator(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, profile, isAdmin, isModerator, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
