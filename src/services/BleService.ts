import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { DiagnosticUtil } from '../utils/DiagnosticUtil';

class BleService {
  manager: BleManager;
  connectedDevice: Device | null = null;
  // TODO: Confirmar Service UUIDs con el dispositivo de hardware objetivo
  SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
  TX_CHARACTERISTIC = '0000ffe1-0000-1000-8000-00805f9b34fb';
  RX_CHARACTERISTIC = '0000ffe2-0000-1000-8000-00805f9b34fb';

  constructor() {
    try {
      if (Platform.OS !== 'web') {
        this.manager = new BleManager();
      } else {
        this.manager = {} as BleManager;
      }
    } catch (e) {
      console.warn('⚠️ No se pudo inicializar BleManager (quizá dependencias nativas faltantes)');
      this.manager = {} as BleManager;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      
      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
        result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true; // iOS se soluciona en Info.plist o app.json
  }

  async scanAndConnect(onDeviceFound: (device: Device) => void, filterName = "AGRO_SENSOR") {
    // Diagnóstico previo
    if (DiagnosticUtil.isExpoGo()) {
      console.warn('⚠️ BleService: Escaneo real no disponible en Expo Go');
      return;
    }

    if (!this.manager.startDeviceScan) return;

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Error al escanear BLE:", error);
        return;
      }

      if (device && device.name?.includes(filterName)) {
        this.manager.stopDeviceScan();
        onDeviceFound(device);
        this.connectToDevice(device);
      }
    });
  }

  async connectToDevice(device: Device) {
    if (DiagnosticUtil.isExpoGo()) return;
    
    try {
      const connected = await device.connect();
      this.connectedDevice = connected;
      await connected.discoverAllServicesAndCharacteristics();
      console.log('Dispositivo conectado:', connected.name);
    } catch (e) {
      console.error('Error al conectar:', e);
    }
  }

  startReceivingData(onDataParsed: (data: any) => void) {
    if (!this.connectedDevice || DiagnosticUtil.isExpoGo()) return;

    this.connectedDevice.monitorCharacteristicForService(
      this.SERVICE_UUID,
      this.TX_CHARACTERISTIC,
      (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
          console.error("Monitor error:", error);
          return;
        }
        if (characteristic?.value) {
          const decodedValue = atob(characteristic.value);
          console.log("Dato crudo:", decodedValue);
          try {
            const parsed = JSON.parse(decodedValue);
            onDataParsed(parsed);
          } catch (e) {
            console.error("Error parseando data JSON de bluetooth", e);
          }
        }
      }
    );
  }

  async sendCommand(command: string) {
    if (!this.connectedDevice || DiagnosticUtil.isExpoGo()) {
      console.warn("Comando no enviado. No hay dispositivo BLE conectado o entorno limitado.");
      return;
    }
    const base64Payload = btoa(command);
    await this.connectedDevice.writeCharacteristicWithResponseForService(
      this.SERVICE_UUID,
      this.RX_CHARACTERISTIC,
      base64Payload
    );
  }

  /**
   * Envía un comando de válvula específico en formato JSON
   */
  async sendValveCommand(valve: 'V1' | 'V2', action: 'ON' | 'OFF') {
    const command = JSON.stringify({ valvula: valve, accion: action });
    console.log(`🔵 BLE: Enviando comando: ${command}`);
    return this.sendCommand(command);
  }

  disconnect() {
    if (this.manager.destroy) {
      this.manager.destroy();
    }
  }
}

export const bleService = new BleService();

// Utilitarios básicos para Base64
function atob(b64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = String(b64).replace(/[=]+$/, '');
  let output = '';
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs! * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}
function btoa(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let block, charCode, idx = 0, map = chars; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
    charCode = str.charCodeAt(idx += 3/4);
    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block! << 8 | charCode;
  }
  return output;
}
