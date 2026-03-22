/**
 * Local Storage Service
 * Almacena datos locales en el dispositivo
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SensorData } from './SensorService';

const STORAGE_KEY = 'sensor_data_local';
const MAX_RECORDS = 100;

export const LocalStorageService = {
  /**
   * Guarda datos de sensores localmente
   */
  async saveSensorData(data: SensorData) {
    try {
      const existing = await this.getLocalData();
      const newData = {
        ...data,
        created_at: new Date().toISOString(),
        id: `local_${Date.now()}`,
      };

      const updated = [newData, ...existing].slice(0, MAX_RECORDS);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      console.log('✅ Data saved locally');
      return newData;
    } catch (error) {
      console.error('Error saving data locally:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los datos almacenados localmente
   */
  async getLocalData(): Promise<SensorData[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading local data:', error);
      return [];
    }
  },

  /**
   * Obtiene los últimos N registros
   */
  async getLatest(limit: number = 50): Promise<SensorData[]> {
    try {
      const data = await this.getLocalData();
      return data.slice(0, limit);
    } catch (error) {
      console.error('Error getting latest data:', error);
      return [];
    }
  },

  /**
   * Limpia todos los datos locales
   */
  async clearAll() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ Local data cleared');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  },
};
