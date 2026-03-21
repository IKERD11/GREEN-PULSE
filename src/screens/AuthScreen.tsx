import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error al iniciar sesión', error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error de registro', error.message);
    else Alert.alert('Registro exitoso', 'Por favor verifica la bandeja de entrada de tu correo electrónico.');
    setLoading(false);
  }

  async function resetPassword() {
    if (!email) {
      Alert.alert('Correo requerido', 'Ingresa tu correo electrónico para recuperar la contraseña.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Éxito', 'Se ha enviado un enlace para restablecer tu contraseña al correo.');
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            <View style={styles.header}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>GREEN PULSE</Text>
            <Text style={styles.subtitle}>Cuidado natural, control total</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.welcomeText}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              {isLogin ? 'Ingresa tus datos para continuar' : 'Regístrate para empezar a monitorear'}
            </Text>
            
            <View style={[styles.inputContainer, focusedInput === 'email' && styles.inputContainerFocused]}>
              <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#22C55E' : '#94A3B8'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#94A3B8"
                onChangeText={(text) => setEmail(text)}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputContainerFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#22C55E' : '#94A3B8'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#94A3B8"
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity onPress={resetPassword} style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={isLogin ? signInWithEmail : signUpWithEmail}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>{isLogin ? 'Ingresar' : 'Registrarse'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setIsLogin(!isLogin)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {isLogin ? 'Crear una cuenta nueva' : 'Ya tengo una cuenta'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4', // Fondo verde muy claro
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 0,
    width: '100%',
  },
  logo: {
    width: 280,
    height: 280,
    maxWidth: '85%', // Ajustado para permitir un tamaño mayor
    aspectRatio: 1, // Asegura que siempre mantenga proporción cuadrada
    marginBottom: -15,
  },
  title: {
    fontSize: 30, // Reducido ligeramente para evitar desbordamientos
    fontWeight: '900',
    color: '#15803D', // Verde oscuro moderno
    letterSpacing: -0.5,
    marginTop: -4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 24, // Bordes un poco más adaptables
    padding: 24, // Padding ajustado para pantallas pequeñas
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 30,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  inputContainerFocused: {
    borderColor: 'transparent', // Eliminar el borde al enfocar
    backgroundColor: '#FFFFFF',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 26,
  },
  forgotPasswordText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#22C55E', // Verde brillante moderno
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '700',
  },
});
