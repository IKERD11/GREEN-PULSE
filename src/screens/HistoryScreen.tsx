import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SensorService, SensorData } from '../services/SensorService';

const screenWidth = Dimensions.get('window').width;

export const HistoryScreen = ({ navigation }: any) => {
  const [history, setHistory] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SensorService.getHistory(20) // Últimos 20 registros
      .then(data => {
        // Invertimos para que el gráfico vaya de antiguo a nuevo
        setHistory(data.reverse());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#63B72C" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={styles.title}>Sin datos históricos</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(99, 183, 44, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#FFFFFF',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Evolución del pH</Text>
        <LineChart
          data={{
            labels: history.map((_, i) => i.toString()),
            datasets: [{ data: history.map(d => d.ph) }]
          }}
          width={screenWidth - 48}
          height={220}
          chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(10, 132, 165, ${opacity})`}}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Humedad (%)</Text>
        <LineChart
          data={{
            labels: history.map((_, i) => i.toString()),
            datasets: [{ data: history.map(d => d.humidity) }]
          }}
          width={screenWidth - 48}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  backText: {
    color: '#0C6E84',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#63B72C',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  chartContainer: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  chartTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
    marginLeft: 8,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -16, 
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600',
  }
});
