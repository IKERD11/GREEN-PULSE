import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, SafeAreaView, useWindowDimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { BluetoothService } from '../services/BluetoothService';
import { WiFiService } from '../services/WiFiService';
import { TextInput, Alert, ActivityIndicator } from 'react-native';

export const ValvesScreen = () => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [v1Open, setV1Open] = useState(false);
  const [v2Open, setV2Open] = useState(false);
  const [esp32Ip, setEsp32Ip] = useState('192.168.1.100');
  const [isProcessing, setIsProcessing] = useState(false);

  // Responsive calculations
  const isSmallScreen = width < 380;
  const padding = 20;
  const gap = 12;
  const availableWidth = width - (padding * 2);
  const cardWidth = (availableWidth - gap) / 2;

  const handleToggleMode = () => {
    setIsAutoMode(prev => !prev);
    if (!isAutoMode) {
      // Si volvemos a auto, apagar valves localmente (el ESP32 lo hará tras timeout)
      setV1Open(false); 
      setV2Open(false);
    }
  };

  const sendCommand = async (valve: 'V1' | 'V2', newState: boolean) => {
    const action = newState ? 'ON' : 'OFF';
    setIsProcessing(true);
    let success = false;

    try {
      if (BluetoothService.connectedDeviceId) {
        await BluetoothService.sendValveCommand(valve, action);
        success = true;
      } else {
        success = await WiFiService.sendValveCommand(esp32Ip, valve, action);
      }

      if (success) {
        if (valve === 'V1') setV1Open(newState);
        else setV2Open(newState);
        setIsAutoMode(false); // Al enviar manual, forzamos modo manual
      } else {
        Alert.alert('Error', 'No se pudo alcanzar el ESP32. Verifica la conexión.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Fallo en la comunicación');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleV1 = () => sendCommand('V1', !v1Open);
  const toggleV2 = () => sendCommand('V2', !v2Open);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Control de Flujo</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Gestión manual de válvulas</Text>
        </View>

        {/* Master Switch */}
        <View style={[styles.masterSwitchCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <View style={[styles.modeIndicator, { backgroundColor: isAutoMode ? theme.colors.primary : theme.colors.textSecondary }]} />
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Modo de Operación</Text>
            </View>
            <Switch
              value={isAutoMode}
              onValueChange={handleToggleMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {!BluetoothService.connectedDeviceId && !isAutoMode && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, marginBottom: 4, color: theme.colors.textSecondary }}>IP ESP32:</Text>
              <TextInput
                style={{ 
                  height: 35, 
                  borderWidth: 1, 
                  borderColor: theme.colors.border, 
                  borderRadius: 8, 
                  paddingHorizontal: 10,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background
                }}
                value={esp32Ip}
                onChangeText={setEsp32Ip}
                placeholder="192.168.1.X"
              />
            </View>
          )}

          <View style={[styles.modeDescriptionBox, { backgroundColor: isAutoMode ? `${theme.colors.primary}1A` : `${theme.colors.border}80` }]}>
            <Text style={[styles.modeDescriptionText, { color: isAutoMode ? theme.colors.primary : theme.colors.textSecondary }]}>
              {isAutoMode ? 'Automático: Controlado por ESP32/Sensores.' : 'Manual: Control directo desde la App habilitado.'}
            </Text>
          </View>
          {isProcessing && <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 10 }} />}
        </View>

        {/* Actuators Grid */}
        <View style={[styles.actuatorsGrid, { gap: gap }]}>
          {/* Válvula 1 */}
          <View style={[
            styles.valveCard, 
            { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.border, 
              opacity: isAutoMode ? 0.6 : 1,
              width: cardWidth
            }
          ]}>
            <View style={styles.valveHeader}>
              <Text style={[styles.valveId, { color: theme.colors.textSecondary, backgroundColor: theme.colors.background }]}>V. 1</Text>
              <View style={[styles.valveStatusDot, { backgroundColor: v1Open ? theme.colors.secondary : theme.colors.border }]} />
            </View>
            <View style={styles.valveIconContainer}>
              <Ionicons name="water-outline" size={isSmallScreen ? 32 : 40} color={isAutoMode ? theme.colors.textSecondary : theme.colors.secondary} />
            </View>
            <Text style={[styles.valveName, { color: theme.colors.text }]} numberOfLines={1}>Agua Fresca</Text>
            <Text style={[styles.valveStateText, { color: v1Open ? theme.colors.secondary : theme.colors.textSecondary }]}>
              {v1Open ? 'ABIERTA' : 'CERRADA'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { backgroundColor: v1Open ? `${theme.colors.secondary}20` : theme.colors.background }
              ]}
              onPress={toggleV1}
              disabled={isAutoMode}
            >
              <Ionicons name={v1Open ? "stop" : "play"} size={14} color={v1Open ? theme.colors.secondary : theme.colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: v1Open ? theme.colors.secondary : theme.colors.textSecondary }]}>
                {v1Open ? 'DETENER' : 'INICIAR'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Válvula 2 */}
          <View style={[
            styles.valveCard, 
            { 
              backgroundColor: theme.colors.card, 
              borderColor: theme.colors.border, 
              opacity: isAutoMode ? 0.6 : 1,
              width: cardWidth
            }
          ]}>
            <View style={styles.valveHeader}>
              <Text style={[styles.valveId, { color: theme.colors.textSecondary, backgroundColor: theme.colors.background }]}>V. 2</Text>
              <View style={[styles.valveStatusDot, { backgroundColor: v2Open ? '#A855F7' : theme.colors.border }]} />
            </View>
            <View style={styles.valveIconContainer}>
              <Ionicons name="flask-outline" size={isSmallScreen ? 32 : 40} color={isAutoMode ? theme.colors.textSecondary : '#A855F7'} />
            </View>
            <Text style={[styles.valveName, { color: theme.colors.text }]} numberOfLines={1}>Nutrientes</Text>
            <Text style={[styles.valveStateText, { color: v2Open ? '#A855F7' : theme.colors.textSecondary }]}>
              {v2Open ? 'ABIERTA' : 'CERRADA'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { backgroundColor: v2Open ? `#A855F720` : theme.colors.background }
              ]}
              onPress={toggleV2}
              disabled={isAutoMode}
            >
              <Ionicons name={v2Open ? "stop" : "play"} size={14} color={v2Open ? '#A855F7' : theme.colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: v2Open ? '#A855F7' : theme.colors.textSecondary }]}>
                {v2Open ? 'DETENER' : 'INICIAR'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </View>
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
  masterSwitchCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  modeDescriptionBox: {
    padding: 12,
    borderRadius: 10,
  },
  modeDescriptionText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  actuatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  valveCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  valveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  valveId: {
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  valveStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  valveIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  valveName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  valveStateText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    width: '100%',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
});
