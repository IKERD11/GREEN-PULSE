/**
 * Mock Sensor Service
 * Simula datos de sensores para pruebas
 * En producción, esto vendría del hardware (ESP32, sensores, etc.)
 */

import { SensorService, SensorData } from './SensorService';
import { ThingSpeakService } from './ThingSpeakService';
import { LocalStorageService } from './LocalStorageService';
import { supabase } from './supabase';

export const MockSensorService = {
  isRunning: false,
  intervalId: null as NodeJS.Timeout | null,

  /**
   * Inicia la simulación de sensores
   * Envía datos cada intervalMs
   */
  startSimulation(intervalMs: number = 30000) { // Cada 30 segundos
    if (this.isRunning) {
      console.warn('Simulation already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting sensor simulation...');

    // Enviar datos inmediatamente
    this.generateAndSendData();

    // Luego cada intervalo
    this.intervalId = setInterval(() => {
      this.generateAndSendData();
    }, intervalMs);
  },

  /**
   * Detiene la simulación
   */
  stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Simulation stopped');
  },

  /**
   * Genera datos realistas de sensores
   */
  generateRealisticData(): SensorData {
    // Valores base con variación realista
    const basePH = 6.0;
    const baseHumidity = 65;
    const baseConductivity = 1.5;
    const baseSalinity = 400;

    return {
      ph: basePH + (Math.random() - 0.5) * 0.5, // 5.75 - 6.25
      humidity: baseHumidity + (Math.random() - 0.5) * 20, // 55 - 75%
      conductivity: baseConductivity + (Math.random() - 0.5) * 0.8, // 1.1 - 1.9 mS/cm
      salinity: baseSalinity + (Math.random() - 0.5) * 100, // 350 - 450 ppm
    };
  },

  /**
   * Genera y envía datos a la base de datos y ThingSpeak
   */
  async generateAndSendData() {
    try {
      const data = this.generateRealisticData();
      
      // Guardar localmente SIEMPRE
      await LocalStorageService.saveSensorData(data);

      // Enviar a ThingSpeak
      this.sendToThingSpeakOnly(data);

      // Verificar si el usuario está autenticado
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Si hay sesión, guardar en Supabase también
        try {
          await SensorService.insertData(data);
          console.log('✅ Data saved to Supabase and ThingSpeak:', data);
        } catch (supabaseError) {
          console.error('⚠️ Error saving to Supabase (pero está en local):', supabaseError);
        }
      }
    } catch (error) {
      console.error('Error generating sensor data:', error);
    }
  },

  /**
   * Envía datos solo a ThingSpeak (sin Supabase)
   */
  async sendToThingSpeakOnly(data: SensorData) {
    try {
      const success = await ThingSpeakService.sendData({
        field1: data.ph,
        field2: data.conductivity,
        field3: data.humidity,
        field4: data.salinity,
      });

      if (success) {
        console.log('✅ Data sent to ThingSpeak only:', data);
      } else {
        console.error('❌ Failed to send to ThingSpeak');
      }
    } catch (error) {
      console.error('Error sending to ThingSpeak:', error);
    }
  },

  /**
   * Obtiene el estado de la simulación
   */
  getStatus(): { isRunning: boolean; hasData: boolean } {
    return {
      isRunning: this.isRunning,
      hasData: true,
    };
  },
};
