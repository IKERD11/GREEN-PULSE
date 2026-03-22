/**
 * ThingSpeak Service
 * Maneja la comunicación con la API de ThingSpeak
 */

interface ThingSpeakConfig {
  channelId: string;
  writeApiKey: string;
  readApiKey?: string;
}

interface ThingSpeakData {
  field1?: number; // pH
  field2?: number; // Conductivity
  field3?: number; // Humidity
  field4?: number; // Salinity
  [key: string]: number | undefined;
}

const THINGSPEAK_API_URL = 'https://api.thingspeak.com';

export const ThingSpeakService = {
  config: {
    channelId: '3306366',
    writeApiKey: '7RJJA2FFX7EE67AV',
    readApiKey: '',
  } as ThingSpeakConfig,

  /**
   * Actualiza las credenciales de ThingSpeak
   */
  setConfig(newConfig: Partial<ThingSpeakConfig>) {
    this.config = { ...this.config, ...newConfig };
  },

  /**
   * Envía datos a ThingSpeak
   */
  async sendData(data: ThingSpeakData): Promise<boolean> {
    try {
      if (!this.config.writeApiKey || !this.config.channelId) {
        console.error('ThingSpeak credentials not configured');
        return false;
      }

      const queryParams = new URLSearchParams();
      queryParams.append('api_key', this.config.writeApiKey);

      // Agregar campos de datos
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(
        `${THINGSPEAK_API_URL}/update?${queryParams.toString()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.ok) {
        console.error('ThingSpeak API error:', response.status);
        return false;
      }

      const result = await response.text();
      console.log('ThingSpeak response:', result);
      return result !== '0'; // 0 significa error en ThingSpeak
    } catch (error) {
      console.error('Error sending data to ThingSpeak:', error);
      return false;
    }
  },

  /**
   * Lee los últimos datos de ThingSpeak
   */
  async getLastData() {
    try {
      if (!this.config.readApiKey || !this.config.channelId) {
        console.warn('ThingSpeak read credentials not configured');
        return null;
      }

      const response = await fetch(
        `${THINGSPEAK_API_URL}/channels/${this.config.channelId}/feeds/last.json?api_key=${this.config.readApiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('ThingSpeak API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data from ThingSpeak:', error);
      return null;
    }
  },

  /**
   * Lee los últimos N registros de ThingSpeak
   */
  async getHistory(results: number = 100) {
    try {
      if (!this.config.readApiKey || !this.config.channelId) {
        console.warn('ThingSpeak read credentials not configured');
        return [];
      }

      const response = await fetch(
        `${THINGSPEAK_API_URL}/channels/${this.config.channelId}/feeds.json?api_key=${this.config.readApiKey}&results=${results}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('ThingSpeak API error:', response.status);
        return [];
      }

      const data = await response.json();
      return data.feeds || [];
    } catch (error) {
      console.error('Error fetching history from ThingSpeak:', error);
      return [];
    }
  },

  /**
   * Prueba la conexión a ThingSpeak
   */
  async testConnection(): Promise<boolean> {
    try {
      const testData: ThingSpeakData = {
        field1: 7.0, // pH test
        field2: 1.5, // Conductivity test
        field3: 60,  // Humidity test
        field4: 500, // Salinity test
      };

      return await this.sendData(testData);
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  /**
   * Obtiene la URL pública del canal de ThingSpeak
   */
  getChannelUrl(): string {
    return `https://thingspeak.com/channels/${this.config.channelId}`;
  },

  /**
   * Verifica si las credenciales están configuradas
   */
  isConfigured(): boolean {
    return !!this.config.channelId && !!this.config.writeApiKey;
  },
};
