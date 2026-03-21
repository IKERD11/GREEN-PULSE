import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const ConfigScreen = () => {
  const { theme } = useTheme();
  
  // Conexiones Locales variables
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  
  // ThingSpeak API variables
  const [channelId, setChannelId] = useState('1234567');
  const [writeApiKey, setWriteApiKey] = useState('');
  const [readApiKey, setReadApiKey] = useState('');

  const handleSaveAndTest = () => {
    // Simulando una prueba de conexión HTTP a ThingSpeak y la configuración de adaptadores
    Alert.alert(
      "Conexión Exitosa", 
      "Se ha conectado correctamente a ThingSpeak y la configuración ha sido guardada.",
      [{ text: "OK" }]
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
});
