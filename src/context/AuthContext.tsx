import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Al cargar, revisar la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error && error.message !== 'No current session') {
        console.error('❌ Error al cerrar sesión en Supabase:', error);
      }
      
      // Limpiar los datos locales de sesión
      await AsyncStorage.removeItem('sb-qenobpysnkyfgysmfvcw-auth-token');
      
      // Limpiar los estados
      setSession(null);
      setUser(null);
      
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún así limpiar los estados locales
      setSession(null);
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, logout }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
