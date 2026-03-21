import { bleService } from './BleService';
import { NotificationService } from './NotificationService';
import { SensorData } from './SensorService';

export const AutomationService = {
  // Configuración actual predeterminada
  config: {
    phMin: 5.5,
    phMax: 6.5,
    humMin: 40,
  },

  updateConfig(newConfig: Partial<{ phMin: number; phMax: number; humMin: number }>) {
    this.config = { ...this.config, ...newConfig };
  },

  async processIncomingData(data: SensorData) {
    const alertMessages = [];

    // Lógica para Válvula 1 (Nutrientes / pH fuera de rango)
    if (data.ph < this.config.phMin || data.ph > this.config.phMax) {
      alertMessages.push(`pH crítico detectado: ${data.ph.toFixed(2)}`);
      await bleService.sendCommand('VALVE1_AUTO_ON');
    }

    // Lógica para Válvula 2 (Agua / Humedad baja)
    if (data.humidity < this.config.humMin) {
      alertMessages.push(`Humedad baja detectada: ${data.humidity.toFixed(1)}%`);
      await bleService.sendCommand('VALVE2_AUTO_ON');
    }

    // Enviar notificaciones si hay alarmas
    if (alertMessages.length > 0) {
      const body = alertMessages.join('\n');
      console.log('Enviando alerta:', body);
      await NotificationService.scheduleAlert('Alarma del Sistema Agrícola', body);
    } else {
      // Opcional: Si todo está en rango, enviar comando de apagar válvulas (VALVES_AUTO_OFF)
      // await bleService.sendCommand('VALVES_AUTO_OFF');
    }
  }
};
