import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export const ConfigScreen = ({ navigation }: any) => {
  const [phMin, setPhMin] = useState('5.5');
  const [phMax, setPhMax] = useState('6.5');
  const [humMin, setHumMin] = useState('40');

  const handleSave = () => {
    // Aquí se guardarían los límites en la base de datos o AsyncStorage
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Límites de pH (Válvula 1)</Text>
        <Text style={styles.description}>Si el pH se sale de este rango óptimo, se activará la Válvula 1 para inyectar nutrientes.</Text>
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mínimo</Text>
            <TextInput style={styles.input} value={phMin} onChangeText={setPhMin} keyboardType="numeric" placeholderTextColor="#94A3B8" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Máximo</Text>
            <TextInput style={styles.input} value={phMax} onChangeText={setPhMax} keyboardType="numeric" placeholderTextColor="#94A3B8" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Humedad (Válvula 2)</Text>
        <Text style={styles.description}>Si la humedad cae por debajo de este valor, se activará la Válvula 2 (Riego).</Text>
        <View style={styles.inputContainerFull}>
          <Text style={styles.label}>Mínimo (%)</Text>
          <TextInput style={styles.input} value={humMin} onChangeText={setHumMin} keyboardType="numeric" placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar Configuración</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
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
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  sectionTitle: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    width: '48%',
  },
  inputContainerFull: {
    width: '100%',
  },
  label: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#63B72C',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
    shadowColor: '#63B72C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  }
});
