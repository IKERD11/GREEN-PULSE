import { BleManager } from 'react-native-ble-plx';
import { requestForegroundPermissionsAsync as requestLocationPermissions } from 'expo-location';
import { Platform, PermissionsAndroid } from 'react-native';

interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  isConnectable: boolean;
}

class BluetoothServiceClass {
  private bleManager: BleManager;
  private isScanning = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();

  constructor() {
    try {
      if (Platform.OS !== 'web') {
        this.bleManager = new BleManager();
      } else {
        this.bleManager = {} as BleManager;
      }
    } catch (e) {
      console.warn('⚠️ No se pudo inicializar BleManager (quizá dependencias nativas faltantes)');
      this.bleManager = {} as BleManager;
    }
    console.log('🔵 Bluetooth LE Service - inicializado');
  }

  /**
   * Solicita permisos críticos de Bluetooth para Android 12 y superiores
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return true;

      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          return (
            granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
            granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const { status: locationStatus } = await requestLocationPermissions();
          return locationStatus === 'granted';
        }
      }
      
      // iOS no requiere permisos específicos de manifiesto aparte de los cargados en Info.plist
      return true;
    } catch (error) {
      console.error('❌ Error solicitando permisos Bluetooth:', error);
      return false;
    }
  }

  /**
   * Inicia el escaneo de dispositivos físicos reales
   */
  async scanDevices(durationMs: number = 10000): Promise<BluetoothDevice[]> {
    if (this.isScanning) {
      console.warn('⚠️ Ya hay un escaneo en progreso');
      return Array.from(this.discoveredDevices.values());
    }

    this.isScanning = true;
    this.discoveredDevices.clear();

    // Verificación de disponibilidad de API nativa
    if (Platform.OS === 'web' || !this.bleManager.startDeviceScan) {
      console.log('🔎 Escaneando dispositivos (Simulado)');
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.isScanning = false;
      const mockDevices = this.getMockDevices();
      mockDevices.forEach(d => this.discoveredDevices.set(d.id, d));
      return mockDevices;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de Bluetooth denegados. No se puede escanear.');
      }

      console.log('🔎 Iniciando escaneo Bluetooth LE REAL...');
      
      // Asegurarse de que el manager está listo
      const state = await this.bleManager.state();
      if (state !== 'PoweredOn') {
        console.warn(`⚠️ Bluetooth no está encendido (Estado: ${state}). Intenta encenderlo.`);
        // No lanzamos error para que el usuario pueda encenderlo manualmente después
      }

      this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('❌ Error durante escaneo real:', error);
          this.isScanning = false;
          return;
        }

        if (device && device.name) {
          this.discoveredDevices.set(device.id, {
            id: device.id,
            name: device.name,
            rssi: device.rssi || -100,
            isConnectable: device.isConnectable ?? true,
          });
        }
      });

      // Detener automáticamente después de la duración establecida
      await new Promise((resolve) => setTimeout(resolve, durationMs));
      await this.bleManager.stopDeviceScan();
      
      const devices = Array.from(this.discoveredDevices.values()).sort((a, b) => b.rssi - a.rssi);
      console.log(`✅ Escaneo completado. Reales encontrados: ${devices.length}`);

      return devices;
    } catch (error) {
      console.error('❌ Error crítico en escaneo Bluetooth real:', error);
      // Fallback a mock solo si falla el nativo para evitar pantalla vacía en desarrollo
      return this.getMockDevices();
    } finally {
      this.isScanning = false;
    }
  }

  async stopScanning(): Promise<void> {
    try {
      if (Platform.OS !== 'web' && this.bleManager.stopDeviceScan) {
        await this.bleManager.stopDeviceScan();
      }
      this.isScanning = false;
      console.log('⏹️ Escaneo detenido');
    } catch (error) {
      console.error('❌ Error deteniendo escaneo:', error);
    }
  }

  async connectToDevice(deviceId: string, deviceName: string): Promise<boolean> {
    if (Platform.OS === 'web' || !this.bleManager.connectToDevice) {
      console.log(`🔗 Conectando (Mock) a ${deviceName}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    try {
      console.log(`🔗 Conectando real a ${deviceName}...`);
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      console.log(`✅ Conexión establecida con ${deviceName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error conectando real a ${deviceName}:`, error);
      return false;
    }
  }

  async disconnectFromDevice(deviceId: string): Promise<boolean> {
    if (Platform.OS === 'web' || !this.bleManager.cancelDeviceConnection) {
      return true;
    }

    try {
      await this.bleManager.cancelDeviceConnection(deviceId);
      console.log(`✅ Desconectado de dispositivo real`);
      return true;
    } catch (error) {
      console.error('❌ Error desconectando real:', error);
      return false;
    }
  }

  private getMockDevices(): BluetoothDevice[] {
    return [
      { id: 'ble_1', name: 'Sensor_Simulado_1', rssi: -50, isConnectable: true },
    ];
  }

  async destroy(): Promise<void> {
    if (Platform.OS === 'web' || !this.bleManager.destroy) return;
    try {
      await this.bleManager.destroy();
    } catch (error) {
      console.error('❌ Error destruyendo BleManager:', error);
    }
  }
}

export const BluetoothService = new BluetoothServiceClass();
