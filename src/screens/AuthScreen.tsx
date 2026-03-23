import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Input wrapper con Animated border - sin setState para evitar re-renders
const AnimatedInput = React.forwardRef<
  TextInput,
  {
    icon: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: any;
    rightElement?: React.ReactNode;
    theme: any;
  }
>(({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, rightElement, theme }, ref) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          backgroundColor: theme.colors.background,
          borderColor: borderColor,
        },
      ]}
    >
      <Ionicons name={icon as any} size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
      <TextInput
        ref={ref}
        style={[styles.input, { color: theme.colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        onChangeText={onChangeText}
        value={value}
        autoCapitalize={autoCapitalize ?? 'none'}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {rightElement}
    </Animated.View>
  );
});

export const AuthScreen = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
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

  const content = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      showsVerticalScrollIndicator={false}
    >
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

          <AnimatedInput
            icon="mail-outline"
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            theme={theme}
          />

          <AnimatedInput
            icon="lock-closed-outline"
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            theme={theme}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            }
          />

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
              <Text style={[styles.primaryButtonText, { color: theme.isDark ? '#0a0e17' : '#FFFFFF' }]}>
                {isLogin ? 'Ingresar' : 'Registrarse'}
              </Text>
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
                borderWidth: theme.isDark ? 1 : 0,
              },
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
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.keyboardView}>{content}</View>
      )}
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
    marginBottom: 16,
    marginTop: 0,
    width: '100%',
  },
  logo: {
    width: 140,
    height: 140,
    maxWidth: '55%',
    aspectRatio: 1,
    marginBottom: -8,
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
    marginBottom: 20,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 58,
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
    marginBottom: 22,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    borderRadius: 16,
    height: 58,
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
    marginVertical: 20,
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
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
