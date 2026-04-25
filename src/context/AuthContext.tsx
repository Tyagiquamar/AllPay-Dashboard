import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, SignUpPayload } from "../types/auth";

const SESSION_KEY = "allpay_session";
const USERS_KEY = "allpay_registered_users";

type StoredAccount = SignUpPayload & { id: string; createdAt: string };

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function readUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredAccount[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function writeSession(user: AuthUser | null) {
  if (!user) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  signUp: (payload: SignUpPayload) => Promise<{ ok: true } | { ok: false; message: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setIsReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const accounts = readUsers();
    const match = accounts.find((a) => a.email.toLowerCase() === normalized);
    if (!match) return { ok: false as const, message: "No account found for this email. Please sign up first." };
    if (match.password !== password) return { ok: false as const, message: "Incorrect password." };
    const sessionUser: AuthUser = {
      id: match.id,
      email: match.email,
      fullName: match.fullName,
      companyName: match.companyName,
      companySize: match.companySize,
      monthlySpend: match.monthlySpend,
      companyType: match.companyType,
      jobTitle: match.jobTitle,
      createdAt: match.createdAt,
    };
    writeSession(sessionUser);
    setUser(sessionUser);
    return { ok: true as const };
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const normalized = payload.email.trim().toLowerCase();
    const accounts = readUsers();
    if (accounts.some((a) => a.email.toLowerCase() === normalized)) {
      return { ok: false as const, message: "An account with this email already exists. Please log in." };
    }
    const id = `usr_${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString();
    const row: StoredAccount = { ...payload, email: normalized, id, createdAt };
    writeUsers([row, ...accounts]);
    const sessionUser: AuthUser = {
      id,
      email: normalized,
      fullName: payload.fullName,
      companyName: payload.companyName,
      companySize: payload.companySize,
      monthlySpend: payload.monthlySpend,
      companyType: payload.companyType,
      jobTitle: payload.jobTitle,
      createdAt,
    };
    writeSession(sessionUser);
    setUser(sessionUser);
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, signIn, signUp, signOut }),
    [user, isReady, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
