import { Platform, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import WifiManager from 'react-native-wifi-reborn';
import { DiagnosticUtil } from '../utils/DiagnosticUtil';

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
      // Diagnóstico previo
      if (DiagnosticUtil.isExpoGo()) {
        console.warn('⚠️ Escaneo WiFi real no disponible en Expo Go');
        throw new Error('ENTORNO_LIMITADO: El escaneo WiFi requiere una compilación nativa (no funciona en Expo Go).');
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('PERMISO_DENEGADO: Permisos de ubicación denegados para escaneo WiFi');
      }

      const locationEnabled = await DiagnosticUtil.isLocationEnabled();
      if (!locationEnabled && Platform.OS === 'android') {
        throw new Error('UBICACION_APAGADA: Por favor activa la ubicación para escanear redes WiFi');
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
    } catch (error: any) {
      console.warn('⚠️ Error escaneando redes:', error.message);
      
      // Si el error es por entorno limitado o permisos, lo lanzamos para que la UI lo maneje
      if (error.message && (
          error.message.includes('ENTORNO_LIMITADO') || 
          error.message.includes('PERMISO_DENEGADO') || 
          error.message.includes('UBICACION_APAGADA'))) {
        throw error;
      }

      // Solo si es un error técnico inesperado, intentamos mock para no romper la UI en desarrollo local no-Expo
      console.log('Falling back to mocks due to unexpected error');
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

  /**
   * Envía un comando de válvula al ESP32 vía HTTP
   * @param ip Dirección IP del ESP32
   * @param valve "V1" (Nutrientes) o "V2" (Agua)
   * @param action "ON" o "OFF"
   */
  async sendValveCommand(ip: string, valve: 'V1' | 'V2', action: 'ON' | 'OFF'): Promise<boolean> {
    try {
      const url = `http://${ip}/control`;
      const body = JSON.stringify({ valvula: valve, accion: action });
      
      console.log(`🌐 WiFi: Enviando POST a ${url}: ${body}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🌐 WiFi: Respuesta recibida:', data);
      return data.status === 'OK';
    } catch (error) {
      console.error('❌ Error enviando comando WiFi:', error);
      return false;
    }
  }
}

export const WiFiService = new WiFiServiceClass();
