/**
 * Mock Sensor Service
 * Simula datos de sensores para pruebas
 * En producción, esto vendría del hardware (ESP32, sensores, etc.)
 */

import { SensorService, SensorData } from './SensorService';
import { ThingSpeakService } from './ThingSpeakService';

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
      
      // Enviar a Supabase
      await SensorService.insertData(data);
      
      console.log('Data sent successfully:', data);
    } catch (error) {
      console.error('Error generating sensor data:', error);
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
