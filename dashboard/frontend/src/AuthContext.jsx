import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession, onAuthChange, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from './auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;
    
    async function initAuth() {
      try {
        const initialSession = await getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        setTenantId(initialSession?.user?.user_metadata?.tenant_id || null);
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }

      subscription = onAuthChange((event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setTenantId(newSession?.user?.user_metadata?.tenant_id || null);
        setLoading(false);
      });
    }

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    tenantId,
    accessToken: session?.access_token || null,
    loading,
    signIn: authSignIn,
    signUp: authSignUp,
    signOut: authSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
