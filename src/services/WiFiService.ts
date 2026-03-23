import * as Location from 'expo-location';
import WifiManager from 'react-native-wifi-reborn';
import { Platform, PermissionsAndroid } from 'react-native';

interface WiFiNetwork {
  id: string;
  name: string;
  strength: number;
}

class WiFiServiceClass {
  private isScanning = false;

  constructor() {
    console.log('📡 WiFiService inicializado');
  }

  /**
   * Solicita permisos para escanear redes WiFi
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de Ubicación',
            message: 'Green Pulse necesita acceso a tu ubicación para buscar redes WiFi.',
            buttonNeutral: 'Preguntar luego',
            buttonNegative: 'Cancelar',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('⚠️ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Escanea redes WiFi disponibles
   */
  async scanNetworks(): Promise<WiFiNetwork[]> {
    if (this.isScanning) {
      console.warn('⚠️ Ya hay un escaneo en progreso');
      return [];
    }

    this.isScanning = true;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación denegados para escaneo WiFi');
      }

      console.log('📡 Escaneando redes WiFi reales...');
      
      // En dispositivos reales con el modulo nativo
      const wifiList = await WifiManager.loadWifiList();
      
      const networks: WiFiNetwork[] = wifiList.map((network, index) => ({
        id: network.BSSID || index.toString(),
        name: network.SSID || 'Red sin nombre',
        strength: network.level || 0,
      }));

      console.log(`📡 Redes encontradas: ${networks.length}`);
      return networks;
    } catch (error) {
      console.warn('⚠️ Error escaneando redes (posiblemente en Expo Go o sin hardware):', error);
      // Fallback a mock solo si falla el nativo (útil para desarrollo en simulador)
      return this.getMockNetworks();
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Obtiene redes simuladas (solo para fallback/desarrollo)
   */
  private getMockNetworks(): WiFiNetwork[] {
    return [
      { id: '1', name: 'Red_Invernadero (Simulada)', strength: 95 },
      { id: '2', name: 'RED_SENSOR_PRINCIPAL (Simulada)', strength: 82 },
      { id: '3', name: 'WiFi_Invitado (Simulada)', strength: 68 },
    ];
  }

  /**
   * Conecta a una red WiFi específica
   */
  async connectToNetwork(ssid: string, password?: string): Promise<boolean> {
    try {
      console.log(`📡 Conectando a red: ${ssid}`);
      if (password) {
        await WifiManager.connectToProtectedSSID(ssid, password, false, false);
      } else {
        await WifiManager.connectToSSID(ssid);
      }
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
      const ssid = await WifiManager.getCurrentWifiSSID();
      return ssid;
    } catch (error) {
      console.error('❌ Error obteniendo red actual:', error);
      return null;
    }
  }
}

export const WiFiService = new WiFiServiceClass();
