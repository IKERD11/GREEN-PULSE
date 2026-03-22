import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { WiFiService } from '../services/WiFiService';
import { BluetoothService } from '../services/BluetoothService';

interface WiFiNetwork {
  id: string;
  name: string;
  strength: number;
}

interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
}

export const ConnectionScreen = () => {
  const { theme } = useTheme();
  
  const [wifiEnabled, setWifiEnabled] = useState(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState<WiFiNetwork[]>([]);
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      BluetoothService.destroy().catch(console.error);
    };
  }, []);

  const handleWifiToggle = async () => {
    setLoading(true);
    try {
      if (!wifiEnabled) {
        // Escanear redes WiFi disponibles
        console.log('📡 Escaneando redes WiFi...');
        const networks = await WiFiService.scanNetworks();
        
        setWifiNetworks(networks);
        setWifiEnabled(true);
        
        if (networks.length > 0) {
          Alert.alert('WiFi Activado', `Se encontraron ${networks.length} redes disponibles`);
        } else {
          Alert.alert('WiFi Activado', 'No se encontraron redes WiFi');
        }
        
        setLoading(false);
      } else {
        setWifiEnabled(false);
        setWifiNetworks([]);
        setConnectedNetwork(null);
        Alert.alert('Desconectado', 'WiFi desactivado');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo escanear redes WiFi');
      console.error('Error WiFi:', error);
      setLoading(false);
    }
  };

  const handleBluetoothToggle = async () => {
    setLoading(true);
    try {
      if (!bluetoothEnabled) {
        // Escanear dispositivos Bluetooth LE
        console.log('🔎 Escaneando dispositivos Bluetooth...');
        const devices = await BluetoothService.scanDevices(5000);
        
        setBluetoothDevices(devices);
        setBluetoothEnabled(true);
        
        if (devices.length > 0) {
          Alert.alert('Bluetooth Activado', `Se encontraron ${devices.length} dispositivos`);
        } else {
          Alert.alert('Bluetooth Activado', 'No se encontraron dispositivos');
        }
        
        setLoading(false);
      } else {
        await BluetoothService.stopScanning();
        setBluetoothEnabled(false);
        setBluetoothDevices([]);
        setConnectedDevice(null);
        Alert.alert('Desconectado', 'Bluetooth desactivado');
        setLoading(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al activar Bluetooth');
      console.error('Error Bluetooth:', error);
      setLoading(false);
    }
  };

  const handleConnectNetwork = (networkId: string, networkName: string) => {
    setConnectedNetwork(networkId);
    Alert.alert('Conectado', `Conectado a "${networkName}"`);
  };

  const handleConnectDevice = async (deviceId: string, deviceName: string) => {
    try {
      setLoading(true);
      const connected = await BluetoothService.connectToDevice(deviceId, deviceName);
      
      if (connected) {
        setConnectedDevice(deviceId);
        Alert.alert('Éxito', `Conectado a ${deviceName}`);
      } else {
        Alert.alert('Error', `No se pudo conectar a ${deviceName}`);
      }
    } catch (error) {
      Alert.alert('Error', `Error conectando a ${deviceName}`);
      console.error('Error conectando:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSignalBars = (strength: number) => {
    if (strength >= 85) return 4;
    if (strength >= 70) return 3;
    if (strength >= 55) return 2;
    return 1;
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
                  {wifiEnabled ? 'Escaneando redes...' : 'Desactivado'}
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

          {wifiEnabled && wifiNetworks.length > 0 && (
            <>
              <Text style={[styles.deviceListTitle, { color: theme.colors.textSecondary }]}>Redes disponibles:</Text>
              {wifiNetworks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.deviceItem,
                    {
                      backgroundColor: connectedNetwork === network.id ? `${theme.colors.primary}20` : theme.colors.background,
                      borderColor: connectedNetwork === network.id ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleConnectNetwork(network.id, network.name)}
                >
                  <Ionicons 
                    name={connectedNetwork === network.id ? 'checkmark-circle' : 'wifi'} 
                    size={20} 
                    color={connectedNetwork === network.id ? theme.colors.primary : theme.colors.primary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.deviceName, { color: theme.colors.text }]}>{network.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {[...Array(4)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="wifi"
                          size={10}
                          color={i < getSignalBars(network.strength) ? theme.colors.primary : theme.colors.textSecondary}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                      <Text style={[styles.signalText, { color: theme.colors.textSecondary }]}>
                        {network.strength}%
                      </Text>
                    </View>
                  </View>
                  {connectedNetwork === network.id && (
                    <Text style={[styles.connectedLabel, { color: theme.colors.primary }]}>Conectado</Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}

          {wifiEnabled && wifiNetworks.length === 0 && !loading && (
            <View style={[styles.emptyBox, { backgroundColor: `${theme.colors.border}20` }]}>
              <Ionicons name="search-outline" size={32} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No se encontraron redes</Text>
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
                  {bluetoothEnabled ? 'Escaneando dispositivos...' : 'Apagado'}
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
              {bluetoothDevices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.deviceItem,
                    {
                      backgroundColor: connectedDevice === device.id ? `${theme.colors.secondary}20` : theme.colors.background,
                      borderColor: connectedDevice === device.id ? theme.colors.secondary : theme.colors.border,
                    },
                  ]}
                  onPress={() => handleConnectDevice(device.id, device.name)}
                >
                  <Ionicons 
                    name={connectedDevice === device.id ? 'checkmark-circle' : 'bluetooth'} 
                    size={20} 
                    color={connectedDevice === device.id ? theme.colors.secondary : theme.colors.secondary}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.deviceName, { color: theme.colors.text }]}>{device.name}</Text>
                    <Text style={[styles.signalText, { color: theme.colors.textSecondary }]}>
                      RSSI: {device.rssi} dBm
                    </Text>
                  </View>
                  {connectedDevice === device.id && (
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
            {connectedNetwork && connectedDevice 
              ? 'WiFi y Bluetooth conectados' 
              : connectedNetwork 
              ? 'Conectado por WiFi' 
              : connectedDevice 
              ? 'Conectado por Bluetooth' 
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
  signalText: {
    fontSize: 11,
    marginTop: 2,
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
