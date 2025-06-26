import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored session
    const getSession = async () => {
      try {
        const sessionString = await SecureStore.getItemAsync('supabase-session');
        if (sessionString) {
          const { session } = JSON.parse(sessionString);
          setSession(session);
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession) {
          try {
            await SecureStore.setItemAsync(
              'supabase-session',
              JSON.stringify({ session: newSession })
            );
          } catch (error) {
            console.error('Error storing session:', error);
          }
        } else {
          try {
            await SecureStore.deleteItemAsync('supabase-session');
          } catch (error) {
            console.error('Error removing session:', error);
          }
        }

        // Redirect based on auth state
        if (event === 'SIGNED_IN' && newSession) {
          router.replace('/(app)/(tabs)');
        } else if (event === 'SIGNED_OUT') {
          router.replace('/(auth)/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};