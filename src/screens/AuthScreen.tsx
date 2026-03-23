import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const AuthScreen = () => {
  const { theme } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            <View style={styles.header}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
            <Text style={[styles.title, { color: theme.colors.primary }]}>GREEN PULSE</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Cuidado natural, control total</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, shadowColor: theme.colors.primary }]}>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Text>
            <Text style={[styles.welcomeSubtext, { color: theme.colors.textSecondary }]}>
              {isLogin ? 'Ingresa tus datos para continuar' : 'Regístrate para empezar a monitorear'}
            </Text>
            
            <View style={[
              styles.inputContainer, 
              { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              focusedInput === 'email' && [styles.inputContainerFocused, { borderColor: theme.colors.primary, shadowColor: theme.colors.primary }]
            ]}>
              <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? theme.colors.primary : theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Correo electrónico"
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={(text) => setEmail(text)}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={[
              styles.inputContainer, 
              { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
              focusedInput === 'password' && [styles.inputContainerFocused, { borderColor: theme.colors.primary, shadowColor: theme.colors.primary }]
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? theme.colors.primary : theme.colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Contraseña"
                placeholderTextColor={theme.colors.textSecondary}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isLogin && (
              <TouchableOpacity onPress={resetPassword} style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} 
              onPress={isLogin ? signInWithEmail : signUpWithEmail}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={theme.isDark ? '#000' : '#fff'} />
              ) : (
                <Text style={[styles.primaryButtonText, { color: theme.isDark ? '#0a0e17' : '#FFFFFF' }]}>{isLogin ? 'Ingresar' : 'Registrarse'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>o</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            <TouchableOpacity 
              style={[
                styles.secondaryButton, 
                { 
                  backgroundColor: theme.isDark ? theme.colors.background : '#F1F5F9',
                  borderColor: theme.colors.border,
                  borderWidth: theme.isDark ? 1 : 0
                }
              ]} 
              onPress={() => setIsLogin(!isLogin)}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
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
    maxWidth: '85%',
    aspectRatio: 1,
    marginBottom: -15,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: -4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  welcomeSubtext: {
    fontSize: 15,
    marginBottom: 30,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  inputContainerFocused: {
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
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
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
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

