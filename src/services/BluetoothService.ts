import { Platform } from 'react-native';
import { requestForegroundPermissionsAsync as requestLocationPermissions } from 'expo-location';

// Importar BleManager de forma segura (solo disponible en compilación nativa)
let BleManager: any;
let Device: any;
let Characteristic: any;

try {
  const ble = require('react-native-ble-plx');
  BleManager = ble.BleManager;
  Device = ble.Device;
  Characteristic = ble.Characteristic;
} catch (error) {
  console.warn('⚠️ react-native-ble-plx no está disponible en este entorno');
}

interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  isConnectable: boolean;
}

class BluetoothServiceClass {
  private bleManager: any;
  private isScanning = false;
  private discoveredDevices: Map<string, BluetoothDevice> = new Map();
  private isNativeAvailable = false;

  constructor() {
    // Inicializar BleManager solo si está disponible
    if (BleManager) {
      try {
        this.bleManager = new BleManager();
        this.isNativeAvailable = true;
        console.log('✅ Bluetooth LE nativo disponible');
      } catch (error) {
        console.warn('⚠️ No se pudo inicializar Bluetooth LE nativo:', error);
        this.isNativeAvailable = false;
      }
    } else {
      console.warn('⚠️ Usando fallback de Bluetooth (simulado)');
      this.isNativeAvailable = false;
    }
  }

  /**
   * Solicita permisos de Bluetooth necesarios
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Android 12+ requiere permisos de ubicación para Bluetooth LE
        const { status: locationStatus } = await requestLocationPermissions();
        return locationStatus === 'granted';
      } else {
        // iOS requiere acceso a Bluetooth (configurado en Info.plist via app.json)
        return true;
      }
    } catch (error) {
      console.error('❌ Error solicitando permisos Bluetooth:', error);
      return false;
    }
  }

  /**
   * Inicia el escaneo de dispositivos Bluetooth LE
   */
  async scanDevices(durationMs: number = 10000): Promise<BluetoothDevice[]> {
    if (this.isScanning) {
      console.warn('⚠️ Ya hay un escaneo en progreso');
      return Array.from(this.discoveredDevices.values());
    }

    // Si no está disponible el nativo, usar simulación
    if (!this.isNativeAvailable || !this.bleManager) {
      console.log('📱 Usando modo simulado de Bluetooth');
      return this.getMockDevices();
    }

    this.isScanning = true;
    this.discoveredDevices.clear();

    try {
      // Solicitar permisos
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('⚠️ Permisos de Bluetooth denegados');
        return this.getMockDevices();
      }

      // Iniciar escaneo
      console.log('🔎 Iniciando escaneo BLE...');
      
      this.bleManager.onStateChange((state: any) => {
        console.log(`📱 Estado Bluetooth: ${state}`);
      }, true);

      this.bleManager.startDeviceScan(null, null, (error: any, device: any) => {
        if (error) {
          console.error('❌ Error durante escaneo:', error);
          return;
        }

        if (device && device.name) {
          this.discoveredDevices.set(device.id, {
            id: device.id,
            name: device.name,
            rssi: device.rssi || -100,
            isConnectable: device.isConnectable ?? true,
          });

          console.log(`✅ Dispositivo encontrado: ${device.name} (RSSI: ${device.rssi})`);
        }
      });

      // Esperar la duración del escaneo
      await new Promise((resolve) => setTimeout(resolve, durationMs));

      // Detener escaneo
      await this.bleManager.stopDeviceScan();
      console.log(`✅ Escaneo completado. Dispositivos encontrados: ${this.discoveredDevices.size}`);

      return Array.from(this.discoveredDevices.values()).sort((a, b) => b.rssi - a.rssi);
    } catch (error) {
      console.error('❌ Error escaneando dispositivos:', error);
      return this.getMockDevices();
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Detiene el escaneo actual
   */
  async stopScanning(): Promise<void> {
    try {
      if (!this.isNativeAvailable || !this.bleManager) {
        this.isScanning = false;
        return;
      }
      
      await this.bleManager.stopDeviceScan();
      this.isScanning = false;
      console.log('⏹️ Escaneo detenido');
    } catch (error) {
      console.error('❌ Error deteniendo escaneo:', error);
    }
  }

  /**
   * Conecta a un dispositivo Bluetooth específico
   */
  async connectToDevice(deviceId: string, deviceName: string): Promise<boolean> {
    try {
      console.log(`🔗 Conectando a ${deviceName}...`);
      
      if (!this.isNativeAvailable || !this.bleManager) {
        console.log('📱 Modo simulado - conexión aceptada');
        return true;
      }
      
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      
      console.log(`✅ Conectado a ${deviceName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error conectando a ${deviceName}:`, error);
      return false;
    }
  }

  /**
   * Desconecta de un dispositivo Bluetooth
   */
  async disconnectFromDevice(deviceId: string): Promise<boolean> {
    try {
      if (!this.isNativeAvailable || !this.bleManager) {
        return true;
      }
      
      await this.bleManager.cancelDeviceConnection(deviceId);
      console.log(`✅ Desconectado`);
      return true;
    } catch (error) {
      console.error('❌ Error desconectando:', error);
      return false;
    }
  }

  /**
   * Lee una característica de un dispositivo conectado
   */
  async readCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string | null> {
    try {
      if (!this.isNativeAvailable || !this.bleManager) {
        return null;
      }
      
      const characteristic = await this.bleManager.readCharacteristicForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID
      );
      
      return characteristic.value;
    } catch (error) {
      console.error('❌ Error leyendo característica:', error);
      return null;
    }
  }

  /**
   * Escribe en una característica de un dispositivo conectado
   */
  async writeCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): Promise<boolean> {
    try {
      if (!this.isNativeAvailable || !this.bleManager) {
        return true;
      }
      
      await this.bleManager.writeCharacteristicWithResponseForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        value
      );
      
      return true;
    } catch (error) {
      console.error('❌ Error escribiendo característica:', error);
      return false;
    }
  }

  /**
   * Suscribe a cambios en una característica
   */
  async monitorCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    onValueChange: (value: string) => void
  ): Promise<void> {
    try {
      if (!this.isNativeAvailable || !this.bleManager) {
        return;
      }
      
      this.bleManager.monitorCharacteristicForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        (error: any, characteristic: any) => {
          if (error) {
            console.error('❌ Error monitoreando:', error);
            return;
          }
          
          if (characteristic?.value) {
            onValueChange(characteristic.value);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error configurando monitor:', error);
    }
  }

  /**
   * Obtiene dispositivos simulados como fallback
   */
  private getMockDevices(): BluetoothDevice[] {
    return [
      { id: 'ble_1', name: 'Sensor_pH_01', rssi: -50, isConnectable: true },
      { id: 'ble_2', name: 'Sensor_Conductivity_01', rssi: -65, isConnectable: true },
      { id: 'ble_3', name: 'ESP32_Greenhouse', rssi: -45, isConnectable: true },
      { id: 'ble_4', name: 'Sensor_2', rssi: -75, isConnectable: true },
    ];
  }

  /**
   * Limpia los recursos
   */
  async destroy(): Promise<void> {
    try {
      if (!this.isNativeAvailable || !this.bleManager) {
        return;
      }
      
      await this.bleManager.destroy();
    } catch (error) {
      console.error('❌ Error destruyendo BleManager:', error);
    }
  }
}

export const BluetoothService = new BluetoothServiceClass();
