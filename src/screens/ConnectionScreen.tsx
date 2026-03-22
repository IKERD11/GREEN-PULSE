import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const ConnectionScreen = () => {
  const { theme } = useTheme();
  
  const [wifiEnabled, setWifiEnabled] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  const handleWifiToggle = async () => {
    setLoading(true);
    try {
      if (!wifiEnabled) {
        // Simular conexión WiFi
        setTimeout(() => {
          setWifiEnabled(true);
          setWifiConnected(true);
          Alert.alert('Éxito', 'Conectado a la red WiFi');
          setLoading(false);
        }, 1000);
      } else {
        setWifiEnabled(false);
        setWifiConnected(false);
        Alert.alert('Desconectado', 'WiFi desactivado');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar a WiFi');
      setLoading(false);
    }
  };

  const handleBluetoothToggle = async () => {
    setLoading(true);
    try {
      if (!bluetoothEnabled) {
        // Simular escaneo de dispositivos Bluetooth
        setTimeout(() => {
          setBluetoothEnabled(true);
          setBluetoothDevices(['Sensor_1', 'Sensor_2', 'ESP32_Device']);
          Alert.alert('Bluetooth Activado', 'Escaneando dispositivos...');
          setLoading(false);
        }, 1500);
      } else {
        setBluetoothEnabled(false);
        setBluetoothDevices([]);
        setConnectedDevice(null);
        Alert.alert('Desconectado', 'Bluetooth desactivado');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al activar Bluetooth');
      setLoading(false);
    }
  };

  const handleConnectDevice = (device: string) => {
    setConnectedDevice(device);
    Alert.alert('Conectado', `Conectado a ${device}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Conexiones</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Gestiona tus dispositivos</Text>
        </View>

        {/* WiFi Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>RED WI-FI</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Ionicons name="wifi" size={24} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Wi-Fi</Text>
                <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                  {wifiEnabled && wifiConnected ? 'Conectado a "Red_Invernadero"' : 'Desconectado'}
                </Text>
              </View>
            </View>
            <Switch
              value={wifiEnabled}
              onValueChange={handleWifiToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
              disabled={loading}
            />
          </View>

          {wifiConnected && (
            <View style={[styles.statusBox, { backgroundColor: `${theme.colors.primary}10` }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.statusText, { color: theme.colors.primary }]}>Red activa</Text>
            </View>
          )}
        </View>

        {/* Bluetooth Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>BLUETOOTH</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.cardRow}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.secondary}20` }]}>
                <Ionicons name="bluetooth" size={24} color={theme.colors.secondary} />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Bluetooth LE</Text>
                <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                  {bluetoothEnabled ? 'Encendido' : 'Apagado'}
                </Text>
              </View>
            </View>
            <Switch
              value={bluetoothEnabled}
              onValueChange={handleBluetoothToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.secondary }}
              thumbColor="#FFFFFF"
              disabled={loading}
            />
          </View>

          {bluetoothEnabled && bluetoothDevices.length > 0 && (
            <>
              <Text style={[styles.deviceListTitle, { color: theme.colors.textSecondary }]}>Dispositivos disponibles:</Text>
              {bluetoothDevices.map((device, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.deviceItem,
                    {
                      backgroundColor: connectedDevice === device ? `${theme.colors.secondary}20` : theme.colors.background,
                      borderColor: connectedDevice === device ? theme.colors.secondary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleConnectDevice(device)}
                >
                  <Ionicons 
                    name={connectedDevice === device ? 'checkmark-circle' : 'ellipse-outline'} 
                    size={20} 
                    color={connectedDevice === device ? theme.colors.secondary : theme.colors.textSecondary}
                  />
                  <Text style={[styles.deviceName, { color: theme.colors.text }]}>{device}</Text>
                  {connectedDevice === device && (
                    <Text style={[styles.connectedLabel, { color: theme.colors.secondary }]}>Conectado</Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}

          {bluetoothEnabled && bluetoothDevices.length === 0 && !loading && (
            <View style={[styles.emptyBox, { backgroundColor: `${theme.colors.border}20` }]}>
              <Ionicons name="search-outline" size={32} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No se encontraron dispositivos</Text>
            </View>
          )}
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Conectando...</Text>
          </View>
        )}

        {/* Connection Status Summary */}
        <View style={[styles.summaryCard, { backgroundColor: `${theme.colors.primary}10`, borderColor: theme.colors.primary }]}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
          <Text style={[styles.summaryText, { color: theme.colors.primary }]}>
            {wifiEnabled && bluetoothEnabled 
              ? 'Todas las conexiones están activas' 
              : wifiEnabled 
              ? 'Solo WiFi está activo' 
              : bluetoothEnabled 
              ? 'Solo Bluetooth está activo' 
              : 'Sin conexiones activas'}
          </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  statusBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deviceListTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  connectedLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyBox: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    marginTop: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
