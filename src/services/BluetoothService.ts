import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { requestForegroundPermissionsAsync as requestLocationPermissions } from 'expo-location';
import { Platform } from 'react-native';

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
    this.bleManager = new BleManager();
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
      
      this.bleManager.onStateChange((state) => {
        console.log(`📱 Estado Bluetooth: ${state}`);
      }, true);

      this.bleManager.startDeviceScan(null, null, (error, device) => {
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
      this.bleManager.stopDeviceScan();
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
      this.bleManager.monitorCharacteristicForDevice(
        deviceId,
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
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
      await this.bleManager.destroy();
    } catch (error) {
      console.error('❌ Error destruyendo BleManager:', error);
    }
  }
}

export const BluetoothService = new BluetoothServiceClass();
