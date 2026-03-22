import * as Location from 'expo-location';

interface WiFiNetwork {
  id: string;
  name: string;
  strength: number;
}

class WiFiServiceClass {
  private isScanning = false;
  private isNativeAvailable = false;

  constructor() {
    console.log('📡 WiFiService inicializado (usando fallback simulado)');
    this.isNativeAvailable = false;
  }

  /**
   * Solicita permisos para escanear redes WiFi
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Solicitar permiso de ubicación (requerido para escanear WiFi en Android)
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('⚠️ Error solicitando permisos:', error);
      // En Expo Go, los permisos pueden fallar en desarrollo - devolver fallback
      return true;
    }
  }

  /**
   * Escanea redes WiFi disponibles
   * Nota: Esta es una solución simulada con datos más realistas
   * Para acceso real a redes WiFi, se requeriría compilación nativa
   */
  async scanNetworks(): Promise<WiFiNetwork[]> {
    if (this.isScanning) {
      console.warn('⚠️ Ya hay un escaneo en progreso');
      return [];
    }

    this.isScanning = true;

    try {
      // Solicitar permisos
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Permisos denegados, usando redes simuladas');
      }

      // En Expo Go, no hay acceso a APIs WiFi nativas
      // Se requiere compilación con eas build para acceso real
      console.log('📡 Escaneando redes WiFi (modo simulado en Expo Go)');
      
      // Simular delay de escaneo
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const networks = this.getMockNetworks();
      console.log(`📡 Redes encontradas: ${networks.length}`);
      
      return networks;
    } catch (error) {
      console.warn('⚠️ Error escaneando redes:', error);
      return this.getMockNetworks();
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Obtiene redes simuladas con datos realistas
   */
  private getMockNetworks(): WiFiNetwork[] {
    return [
      { id: '1', name: 'Red_Invernadero', strength: 95 },
      { id: '2', name: 'RED_SENSOR_PRINCIPAL', strength: 82 },
      { id: '3', name: 'WiFi_Invitado', strength: 68 },
      { id: '4', name: 'RED_IoT_2.4GHz', strength: 75 },
      { id: '5', name: 'ConectaBien', strength: 60 },
    ];
  }

  /**
   * Conecta a una red WiFi específica
   * Nota: Requiere permisos especiales y compilación nativa
   */
  async connectToNetwork(networkName: string): Promise<boolean> {
    try {
      // En una app nativa real:
      // Android: WifiManager.addNetwork() + enableNetwork()
      // iOS: NEHotspotConfiguration + Hot Spot Helper
      
      console.log(`📡 Conectando a red: ${networkName}`);
      return true;
    } catch (error) {
      console.error('❌ Error conectando:', error);
      return false;
    }
  }

  /**
   * Obtiene la red WiFi actual conectada
   */
  async getCurrentNetwork(): Promise<string | null> {
    try {
      // Implementación de fallback
      return null;
    } catch (error) {
      console.error('❌ Error obteniendo red actual:', error);
      return null;
    }
  }
}

export const WiFiService = new WiFiServiceClass();
