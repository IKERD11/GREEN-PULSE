import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Linking, SafeAreaView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SensorService, SensorData } from '../services/SensorService';
import { ThingSpeakService } from '../services/ThingSpeakService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export const AnalysisScreen = () => {
  const { theme } = useTheme();
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    SensorService.getHistory(10) // Últimos 10 registros
      .then(data => {
        setHistory(data.reverse());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const openThingSpeak = () => {
    const url = ThingSpeakService.getChannelUrl();
    Linking.openURL(url);
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => theme.isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.textSecondary,
    strokeWidth: 2,
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: theme.colors.border,
    },
    useShadowColorFromDataset: false,
    fillShadowGradientFromOpacity: 0.2,
    fillShadowGradientToOpacity: 0.0,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <View style={styles.titleRow}>
              <Ionicons name="cloud-outline" size={24} color={theme.colors.secondary} style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Análisis de Nube</Text>
            </View>
            <View style={styles.titleRow}>
              <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Últimas Operaciones</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} 
            onPress={fetchHistory}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.text} style={loading ? { opacity: 0.5 } : {}} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: theme.colors.text }}>Sin datos históricos</Text>
          </View>
        ) : (
          <>
            {/* Chart 1: pH vs EC */}
            <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>pH vs Conductividad (EC)</Text>
              <LineChart
                data={{
                  labels: history.map((_, i) => ''),
                  datasets: [
                    { 
                      data: history.map(d => d.ph),
                      color: (opacity = 1) => `rgba(6, 182, 212, ${opacity})`, // Cyan
                    },
                    { 
                      data: history.map(d => d.conductivity),
                      color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Amber
                    }
                  ],
                  legend: ['pH', 'EC (mS/cm)']
                }}
                width={screenWidth - 40}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withVerticalLines={false}
                withHorizontalLines={true}
              />
            </View>

            {/* Chart 2: Humedad Relativa */}
            <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Humedad Relativa (%)</Text>
              <LineChart
                data={{
                  labels: history.map((_, i) => ''),
                  datasets: [
                    { 
                      data: history.map(d => d.humidity),
                      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Emerald
                    }
                  ],
                }}
                width={screenWidth - 40}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withVerticalLines={false}
              />
            </View>
          </>
        )}

        <TouchableOpacity 
          style={[styles.thingSpeakButton, { borderColor: theme.colors.secondary, backgroundColor: `${theme.colors.secondary}10` }]}
          onPress={openThingSpeak}
        >
          <Ionicons name="open-outline" size={18} color={theme.colors.secondary} />
          <Text style={[styles.thingSpeakButtonText, { color: theme.colors.secondary }]}>
            Abrir en ThingSpeak.com
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 0,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginLeft: -20,
  },
  thingSpeakButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  thingSpeakButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
