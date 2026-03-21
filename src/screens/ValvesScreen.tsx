import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const ValvesScreen = () => {
  const { theme } = useTheme();
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [v1Open, setV1Open] = useState(false);
  const [v2Open, setV2Open] = useState(false);

  const handleToggleMode = () => {
    setIsAutoMode(prev => !prev);
    if (!isAutoMode) {
      // Upon switching to auto, we probably want to assume closed or handled by ESP32.
    }
  };

  const toggleV1 = () => {
    if (isAutoMode) return;
    setV1Open(!v1Open);
  };

  const toggleV2 = () => {
    if (isAutoMode) return;
    setV2Open(!v2Open);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <View style={[styles.modeDescriptionBox, { backgroundColor: isAutoMode ? `${theme.colors.primary}1A` : `${theme.colors.border}80` }]}>
            <Text style={[styles.modeDescriptionText, { color: isAutoMode ? theme.colors.primary : theme.colors.textSecondary }]}>
              {isAutoMode ? 'Automático: Controlado por ESP32/Sensores.' : 'Manual: Puedes controlar las válvulas directamente.'}
            </Text>
          </View>
        </View>

        {/* Actuators Grid */}
        <View style={styles.actuatorsGrid}>
          {/* Válvula 1 */}
          <View style={[
            styles.valveCard, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border, opacity: isAutoMode ? 0.5 : 1 }
          ]}>
            <View style={styles.valveHeader}>
              <Text style={[styles.valveId, { color: theme.colors.textSecondary, backgroundColor: theme.colors.background }]}>V. 1</Text>
              <View style={[styles.valveStatusDot, { backgroundColor: v1Open ? theme.colors.secondary : theme.colors.border }]} />
            </View>
            <View style={styles.valveIconContainer}>
              <Ionicons name="water-outline" size={40} color={isAutoMode ? theme.colors.textSecondary : theme.colors.secondary} />
            </View>
            <Text style={[styles.valveName, { color: theme.colors.text }]}>Agua Fresca</Text>
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
              <Ionicons name={v1Open ? "stop" : "play"} size={16} color={v1Open ? theme.colors.secondary : theme.colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: v1Open ? theme.colors.secondary : theme.colors.textSecondary }]}>
                {v1Open ? 'DETENER' : 'INICIAR'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Válvula 2 */}
          <View style={[
            styles.valveCard, 
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border, opacity: isAutoMode ? 0.5 : 1 }
          ]}>
            <View style={styles.valveHeader}>
              <Text style={[styles.valveId, { color: theme.colors.textSecondary, backgroundColor: theme.colors.background }]}>V. 2</Text>
              <View style={[styles.valveStatusDot, { backgroundColor: v2Open ? '#A855F7' : theme.colors.border }]} />
            </View>
            <View style={styles.valveIconContainer}>
              <Ionicons name="flask-outline" size={40} color={isAutoMode ? theme.colors.textSecondary : '#A855F7'} />
            </View>
            <Text style={[styles.valveName, { color: theme.colors.text }]}>Nutrientes</Text>
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
              <Ionicons name={v2Open ? "stop" : "play"} size={16} color={v2Open ? '#A855F7' : theme.colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: v2Open ? '#A855F7' : theme.colors.textSecondary }]}>
                {v2Open ? 'DETENER' : 'INICIAR'}
              </Text>
            </TouchableOpacity>
          </View>
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeDescriptionBox: {
    padding: 12,
    borderRadius: 8,
  },
  modeDescriptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actuatorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valveCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  valveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  valveId: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  valveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  valveIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  valveName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  valveStateText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
