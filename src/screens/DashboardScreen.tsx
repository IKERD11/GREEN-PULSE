import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Platform, SafeAreaView } from 'react-native';
import { SensorService, SensorData } from '../services/SensorService';
import { LocalStorageService } from '../services/LocalStorageService';
import { MockSensorService } from '../services/MockSensorService';
import { AutoAuthService } from '../services/AutoAuthService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const DashboardScreen = () => {
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Auto-login al inicio
    const initializeAuth = async () => {
      console.log('Inicializando autenticación...');
      const result = await AutoAuthService.autoLogin();
      if (result.success) {
        console.log('✅ Autenticación completada, iniciando simulación...');
        // Iniciar simulación después de autenticarse
        if (!MockSensorService.isRunning) {
          MockSensorService.startSimulation(30000);
        }
      } else {
        console.warn('⚠️ Auto-login falló, usando almacenamiento local');
        // Iniciar simulación de todas formas
        if (!MockSensorService.isRunning) {
          MockSensorService.startSimulation(30000);
        }
      }
    };

    initializeAuth();

    // Cargar datos: primero del almacenamiento local, luego de Supabase
    const loadData = async () => {
      try {
        // Intentar obtener del almacenamiento local primero
        const localData = await LocalStorageService.getLatest(1);
        if (localData.length > 0) {
          setLatestData(localData[0]);
        }

        // Luego de Supabase si está disponible
        SensorService.getHistory(1).then((data) => {
          if (data.length > 0) setLatestData(data[0]);
        }).catch(console.error);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Suscribirse a Realtime
    const unsubscribe = SensorService.subscribeToNewData((newRecord) => {
      setLatestData(newRecord);
    });

    // Escuchar cambios del localStorage cada 5 segundos
    const localStorageInterval = setInterval(async () => {
      const localData = await LocalStorageService.getLatest(1);
      if (localData.length > 0) {
        setLatestData(localData[0]);
      }
    }, 5000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      unsubscribe();
      clearInterval(localStorageInterval);
    };
  }, []);

  const isSystemOk = latestData ? (latestData.ph >= 5.5 && latestData.ph <= 6.5) : true;

  const getProgressWidth = (value: number, max: number) => {
    const clamped = Math.min(Math.max(value, 0), max);
    return `${(clamped / max) * 100}%`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Network Status Banner */}
        <View style={[styles.networkBanner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.networkSubtitle, { color: theme.colors.textSecondary }]}>ESTADO DE RED</Text>
            <View style={styles.networkStatusContainer}>
              <Animated.View style={[
                styles.pulseDot, 
                { backgroundColor: isSystemOk ? theme.colors.primary : theme.colors.error, opacity: pulseAnim }
              ]} />
              <Text style={[styles.networkTitle, { color: theme.colors.text }]}>
                {isSystemOk ? 'SISTEMA OK' : 'ALERTA'}
              </Text>
            </View>
          </View>
          <Ionicons name="cellular" size={28} color={theme.colors.primary} />
        </View>

        {/* 2x2 Bento Box Grid */}
        <View style={styles.grid}>
          <SensorCard 
            icon="water-outline" 
            title="pH del Agua" 
            value={latestData?.ph.toFixed(1) ?? '--'} 
            unit="pH" 
            color="#06B6D4" // Cyan
            progress={getProgressWidth(latestData?.ph ?? 0, 14)}
            theme={theme}
          />
          <SensorCard 
            icon="leaf-outline" 
            title="Humedad Rel." 
            value={latestData?.humidity.toFixed(0) ?? '--'} 
            unit="%" 
            color="#10B981" // Emerald
            progress={getProgressWidth(latestData?.humidity ?? 0, 100)}
            theme={theme}
          />
          <SensorCard 
            icon="flash-outline" 
            title="Conductividad" 
            value={latestData?.conductivity.toFixed(1) ?? '--'} 
            unit="mS/cm" 
            color="#F59E0B" // Amber/Yellow
            progress={getProgressWidth(latestData?.conductivity ?? 0, 5)}
            theme={theme}
          />
          <SensorCard 
            icon="flask-outline" 
            title="Salinidad" 
            value={latestData?.salinity.toFixed(0) ?? '--'} 
            unit="ppm" 
            color="#8B5CF6" // Purple
            progress={getProgressWidth(latestData?.salinity ?? 0, 2000)}
            theme={theme}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const SensorCard = ({ icon, title, value, unit, color, progress, theme }: any) => (
  <View style={[styles.sensorCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
    <View style={styles.cardHeader}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
    </View>
    <View style={styles.cardBody}>
      <Text style={[styles.cardValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.cardUnit, { color: theme.colors.textSecondary }]}>{unit}</Text>
    </View>
    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
      <View style={[styles.progressBar, { backgroundColor: color, width: progress }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Important for bottom tab bar clearance
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  networkSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  networkTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardUnit: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
