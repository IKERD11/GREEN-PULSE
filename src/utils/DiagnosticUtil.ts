import { Platform } from 'react-native';
import * as Location from 'expo-location';

// Podemos intentar detectar Expo Go revisando si existe Constants.expoConfig.sdkVersion 
// o si no hay acceso a módulos nativos específicos.
// En SDK 50+, se prefiere usar Constants de expo-constants si está disponible.

export class DiagnosticUtil {
  /**
   * Verifica si la app está corriendo en Expo Go
   * Las librerías nativas como react-native-wifi-reborn NO funcionan en Expo Go.
   */
  static isExpoGo(): boolean {
    // Una forma común en versiones recientes de Expo
    // @ts-ignore - Evitar errores si Constants no está tipado globalmente
    const isExpo = global.expo?.modules?.NativeModulesProxy?.ExpoGo !== undefined || 
                   // @ts-ignore
                   global.__expo_device_info !== undefined;
    
    // Si no podemos detectarlo así, podemos asumir que si falla la carga de un módulo nativo,
    // estamos en un entorno limitado.
    return isExpo;
  }

  /**
   * Verifica si los servicios de ubicación están activos (necesario para WiFi y BLE en Android)
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return true;
      const { locationServicesEnabled } = await Location.getProviderStatusAsync();
      return locationServicesEnabled;
    } catch (error) {
      console.warn('⚠️ Error verificando servicios de ubicación:', error);
      return false;
    }
  }

  /**
   * Obtiene un resumen del estado del sistema para diagnóstico
   */
  static async getSystemStatus() {
    const isGo = this.isExpoGo();
    const locEnabled = await this.isLocationEnabled();
    
    return {
      isExpoGo: isGo,
      locationEnabled: locEnabled,
      platform: Platform.OS,
      canScanReal: !isGo && Platform.OS !== 'web'
    };
  }
}
