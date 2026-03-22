import { BleManager } from 'react-native-ble-plx';
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
    if (Platform.OS !== 'web') {
      try {
        this.bleManager = new BleManager();
      } catch (e) {
        console.warn('⚠️ No se pudo inicializar BleManager (quizá dependencias nativas faltantes)');
        this.bleManager = {} as BleManager;
      }
    } else {
      console.warn('⚠️ BleManager no está soportado en la web. Usando mock.');
      this.bleManager = {} as BleManager;
    }
    console.log('🔵 Bluetooth LE Service - inicializado');
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return true;

      if (Platform.OS === 'android') {
        const { status: locationStatus } = await requestLocationPermissions();
        return locationStatus === 'granted';
      } else {
        return true;
      }
    } catch (error) {
      console.error('❌ Error solicitando permisos Bluetooth:', error);
      return false;
    }
  }

  async scanDevices(durationMs: number = 10000): Promise<BluetoothDevice[]> {
    if (this.isScanning) {
      console.warn('⚠️ Ya hay un escaneo en progreso');
      return Array.from(this.discoveredDevices.values());
    }

    this.isScanning = true;
    this.discoveredDevices.clear();

    if (Platform.OS === 'web' || !this.bleManager.startDeviceScan) {
      console.log('🔎 Escaneando dispositivos Bluetooth... (Modo Web simulado)');
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.isScanning = false;
      const mockDevices = this.getMockDevices();
      mockDevices.forEach(d => this.discoveredDevices.set(d.id, d));
      return mockDevices;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de Bluetooth denegados');
      }

      console.log('🔎 Escaneando dispositivos Bluetooth LE reales...');
      
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
        }
      });

      await new Promise((resolve) => setTimeout(resolve, durationMs));
      await this.bleManager.stopDeviceScan();
      
      const devices = Array.from(this.discoveredDevices.values()).sort((a, b) => b.rssi - a.rssi);
      console.log(`✅ Escaneo completado. Dispositivos encontrados: ${devices.length}`);

      return devices;
    } catch (error) {
      console.error('❌ Error escaneando dispositivos Bluetooth:', error);
      throw error;
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
      console.log(`🔗 Conectando a ${deviceName} (Simulado en Web)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`✅ Conectado a ${deviceName}`);
      return true;
    }

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

  async disconnectFromDevice(deviceId: string): Promise<boolean> {
    if (Platform.OS === 'web' || !this.bleManager.cancelDeviceConnection) {
      console.log(`✅ Desconectado (Simulado Web)`);
      return true;
    }

    try {
      await this.bleManager.cancelDeviceConnection(deviceId);
      console.log(`✅ Desconectado`);
      return true;
    } catch (error) {
      console.error('❌ Error desconectando:', error);
      return false;
    }
  }

  async readCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string | null> {
    if (Platform.OS === 'web' || !this.bleManager.readCharacteristicForDevice) return 'MOCK_VALUE';

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

  async writeCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): Promise<boolean> {
    if (Platform.OS === 'web' || !this.bleManager.writeCharacteristicWithResponseForDevice) return true;

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

  async monitorCharacteristic(
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    onValueChange: (value: string) => void
  ): Promise<void> {
    if (Platform.OS === 'web' || !this.bleManager.monitorCharacteristicForDevice) {
      const intervalId = setInterval(() => onValueChange(Math.random().toFixed(2)), 2000);
      return;
    }

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

  private getMockDevices(): BluetoothDevice[] {
    return [
      { id: 'ble_1', name: 'Sensor_pH_01', rssi: -50, isConnectable: true },
      { id: 'ble_2', name: 'Sensor_Conductivity_01', rssi: -65, isConnectable: true },
      { id: 'ble_3', name: 'ESP32_Greenhouse', rssi: -45, isConnectable: true },
      { id: 'ble_4', name: 'Sensor_2', rssi: -75, isConnectable: true },
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
