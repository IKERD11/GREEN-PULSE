/**
 * Auto Auth Service
 * Proporciona autenticación automática para desarrollo/pruebas
 * El usuario de prueba se crea/autentifica automáticamente en Supabase
 */

import { supabase } from './supabase';

const TEST_USER_EMAIL = 'test@greenpulse.local';
const TEST_USER_PASSWORD = 'GreenPulse@2026';

export const AutoAuthService = {
  /**
   * Intenta iniciar sesión con el usuario de prueba
   * Si no existe, lo crea automáticamente
   */
  async autoLogin() {
    try {
      console.log('🔐 Intento de auto-login con usuario de prueba...');

      // Primero, intentar iniciar sesión
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      if (signInData.session) {
        console.log('✅ Auto-login exitoso');
        return { success: true, user: signInData.user };
      }

      // Si falla, intentar crear el usuario
      if (signInError?.message?.includes('Invalid login credentials')) {
        console.log('👤 Usuario no existe, creando...');
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          options: {
            data: {
              display_name: 'Test User - GreenPulse',
              role: 'tester',
            },
          },
        });

        if (signUpError) {
          console.error('❌ Error creando usuario:', signUpError);
          return { success: false, error: signUpError };
        }

        // Ahora intentar iniciar sesión de nuevo
        const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        });

        if (retrySignIn.session) {
          console.log('✅ Usuario creado y auto-login exitoso');
          return { success: true, user: retrySignIn.user };
        }

        if (retryError) {
          console.error('❌ Error en re-login:', retryError);
          return { success: false, error: retryError };
        }
      }

      return { success: false, error: signInError };
    } catch (error) {
      console.error('Error en autoLogin:', error);
      return { success: false, error };
    }
  },

  /**
   * Verifica si hay sesión activa
   */
  async checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return { hasSession: !!session, session };
    } catch (error) {
      console.error('Error checking session:', error);
      return { hasSession: false, session: null };
    }
  },

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};
