import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { supabase } from '../services/supabase';
import { SensorService, SensorData } from '../services/SensorService';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen = ({ navigation }: any) => {
  const [latestData, setLatestData] = useState<SensorData | null>(null);

  useEffect(() => {
    SensorService.getHistory(1).then((data) => {
      if (data.length > 0) setLatestData(data[0]);
    }).catch(console.error);

    const unsubscribe = SensorService.subscribeToNewData((newRecord) => {
      setLatestData(newRecord);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isSystemOk = latestData ? (latestData.ph >= 5.5 && latestData.ph <= 6.5) : true;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>General</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={[styles.statusCard, isSystemOk ? styles.statusOk : styles.statusAlert]}>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Estado del Sistema</Text>
            <Text style={styles.statusValue}>{isSystemOk ? 'Sistema OK' : 'Alerta'}</Text>
          </View>
          <View style={[styles.statusIndicator, isSystemOk ? styles.indicatorOk : styles.indicatorAlert]} />
        </View>

        <View style={styles.grid}>
          <SensorCard icon="water-outline" title="pH" value={latestData?.ph.toFixed(2) ?? '--'} color="#3B82F6" />
          <SensorCard icon="leaf-outline" title="Humedad" value={latestData?.humidity.toFixed(1) ?? '--'} unit="%" color="#22C55E" />
          <SensorCard icon="flash-outline" title="Conductividad" value={latestData?.conductivity.toFixed(1) ?? '--'} unit=" mS/cm" color="#F59E0B" />
          <SensorCard icon="analytics-outline" title="Salinidad" value={latestData?.salinity.toFixed(1) ?? '--'} unit=" ppm" color="#8B5CF6" />
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={22} color="#1E40AF" style={styles.buttonIcon} />
          <Text style={styles.actionButtonText}>Ver Historial de Datos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Config')}>
          <Ionicons name="settings-outline" size={22} color="#1E40AF" style={styles.buttonIcon} />
          <Text style={styles.actionButtonText}>Configuración de Válvulas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const SensorCard = ({ icon, title, value, unit = '', color }: { icon: keyof typeof Ionicons.glyphMap, title: string, value: string | number, unit?: string, color: string }) => (
  <View style={styles.sensorCard}>
    <View style={[styles.sensorIconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={28} color={color} />
    </View>
    <View style={styles.sensorInfo}>
      <Text style={styles.sensorTitle}>{title}</Text>
      <Text style={styles.sensorValue}>{value}<Text style={styles.sensorUnit}>{unit}</Text></Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  logoutButton: {
    padding: 8,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  statusOk: {
    backgroundColor: '#E0F2F1',
  },
  statusAlert: {
    backgroundColor: '#FFEBEE',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263238',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  indicatorOk: {
    backgroundColor: '#00C853',
  },
  indicatorAlert: {
    backgroundColor: '#D50000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sensorCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#9EADBE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sensorIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sensorInfo: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  sensorUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonIcon: {
    marginRight: 12,
  },
  actionButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
