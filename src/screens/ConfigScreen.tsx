import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ThingSpeakService } from '../services/ThingSpeakService';

export const ConfigScreen = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  
  // Conexiones Locales variables
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // ThingSpeak API variables
  const [channelId, setChannelId] = useState('3306366');
  const [writeApiKey, setWriteApiKey] = useState('7RJJA2FFX7EE67AV');
  const [readApiKey, setReadApiKey] = useState('L2MK619W8E21QCJG');

  const handleSaveAndTest = async () => {
    // Guardar configuración
    ThingSpeakService.setConfig({
      channelId,
      writeApiKey,
      readApiKey,
    });

    // Probar conexión
    const isConnected = await ThingSpeakService.testConnection();
    
    if (isConnected) {
      Alert.alert(
        "Conexión Exitosa", 
        "Se ha conectado correctamente a ThingSpeak y la configuración ha sido guardada.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Error de Conexión",
        "No se pudo conectar a ThingSpeak. Verifica tus credenciales.",
        [{ text: "OK" }]
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            try {
              setLoggingOut(true);
              console.log('Intentando cerrar sesión...');
              await logout();
              console.log('Sesión cerrada exitosamente');
              // La navegación se manejará automáticamente en RootNavigator
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              setLoggingOut(false);
              Alert.alert(
                'Error', 
                'Hubo un error al cerrar sesión. Por favor intenta de nuevo o contacta al soporte si el problema persiste.'
              );
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Configuración</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Dispositivo y Nube</Text>
        </View>

        {/* Sección 1: Conexiones Locales */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CONEXIONES DEL DISPOSITIVO</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.row, styles.borderBottom, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Ionicons name="wifi" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Wi-Fi</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                  {wifiEnabled ? 'Conectado a "Red_Invernadero"' : 'Apagado'}
                </Text>
              </View>
            </View>
            <Switch
              value={wifiEnabled}
              onValueChange={setWifiEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.secondary}20` }]}>
                <Ionicons name="bluetooth" size={20} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Bluetooth LE</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                  {bluetoothEnabled ? 'Encendido' : 'Apagado'}
                </Text>
              </View>
            </View>
            <Switch
              value={bluetoothEnabled}
              onValueChange={setBluetoothEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Sección 2: API de ThingSpeak */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>API DE THINGSPEAK</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.row, { marginBottom: 16 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.secondary}20` }]}>
                <Ionicons name="cloud" size={20} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.colors.secondary }]}>Credenciales</Text>
                <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>Para enviar y leer gráficos</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Channel ID</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={channelId}
              onChangeText={setChannelId}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textSecondary}
              placeholder="Ej: 1234567"
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Read API Key (Para gráficas)</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={readApiKey}
              onChangeText={setReadApiKey}
              placeholderTextColor={theme.colors.textSecondary}
              placeholder="Clave de lectura (Opcional si es público)"
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Write API Key (Para guardar)</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, marginBottom: 24 }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              value={writeApiKey}
              onChangeText={setWriteApiKey}
              placeholderTextColor={theme.colors.textSecondary}
              placeholder="Clave de escritura"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleSaveAndTest}
          >
            <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Guardar y Probar Conexión</Text>
          </TouchableOpacity>
        </View>

        {/* Sección 3: Logout */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>CUENTA</Text>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#FF3B30', opacity: loggingOut ? 0.5 : 1 }]} 
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.logoutButtonText}>{loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    padding: 14,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 0,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
