# 🔵 Bluetooth LE Real - Configuración de Compilación Nativa

## Estado Actual
La app ahora escanea **dispositivos Bluetooth LE reales**. Sin embargo, requiere compilación nativa (no funciona en Expo Go).

## Por qué necesita compilación nativa
- `react-native-ble-plx` accede al hardware Bluetooth del dispositivo
- Expo Go **no soporta** librerías nativas compiladas
- Se requiere `eas build` para compilar la app con soporte BLE nativo

## Requisitos Previos

✅ Verificar que tengas:
```
- Node.js v18+ instalado
- npm o yarn
- Cuenta Expo (https://expo.dev)
- Git configurado
```

## Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

## Paso 2: Login en Expo

```bash
eas login
# O si ya tienes login:
eas logout
eas login
```

## Paso 3: Crear Proyecto EAS

Solo necesitas ejecutar esto UNA VEZ:

```bash
cd "C:\Users\ikdop\OneDrive\Desktop\App"
eas build:configure
```

Ya está configurado en `eas.json` (verifica que exista).

## Paso 4: Compilar para Android (Recomendado para desarrollo)

### Opción A: Compilar APK (para testing en dispositivo físico)
```bash
eas build --platform android --local
```

Esto genera un APK que puedes instalar directamente en tu dispositivo Android.

### Opción B: Compilar en la nube (más fácil, sin dependencias locales)
```bash
eas build --platform android
```

## Paso 5: Instalar en tu Dispositivo

**Si compilaste localmente (APK):**
1. Descarga el APK resultante
2. Transfiere a tu dispositivo Android
3. Instala: `adb install ruta/al/archivo.apk`

**Si compilaste en la nube:**
1. Espera a que eas.dev termine la compilación
2. Descarga desde https://expo.dev > Builds
3. Instala en tu dispositivo

## Variante: iOS (Opcional)

Para compilar para iPhone:
```bash
eas build --platform ios
```

Nota: Requiere Mac con Xcode para probar localmente.

## Probar Bluetooth Real

Una vez instalado en tu dispositivo:

1. **Abre la app** - Veras pantalla de Conexiones
2. **Activa Bluetooth** en tu teléfono
3. **Presiona el toggle de Bluetooth** en la app
4. **Ubica sensores BLE reales** cerca (ESP32, Arduino, etc.)
5. Verás lista de dispositivos con:
   - Nombre real del dispositivo
   - RSSI (fortaleza de señal en dBm)
   - Opción de conectar

## Ejemplo de Dispositivos que Encontrará

```
Dispositivos Bluetooth LE disponibles:
- ESP32_Greenhouse (RSSI: -45 dBm) ← Más cercano/fuerte
- Sensor_1 (RSSI: -55 dBm)
- Sensor_2 (RSSI: -70 dBm)
- MI_Band (RSSI: -80 dBm) ← Más lejano/débil
```

## Solucionar Problemas

### ❌ "Permission denied" en Android
- Asegúrate que el dispositivo tiene Bluetooth activado
- Verifica en Ajustes > Privacidad > Permisos que Bluetooth esté permitido
- Reinicia el dispositivo

### ❌ "No se encontraron dispositivos"
- Verifica que hay dispositivos BLE cerca
- Activa Bluetooth en los dispositivos sensores
- Espera 10 segundos para que completen el escaneo

### ❌ "Cannot connect"
- El dispositivo puede estar fuera de rango
- El dispositivo BLE requiere autenticación (contraseña)
- Intenta conectar desde Ajustes > Bluetooth del teléfono primero

### ❌ Build falla en eas build --local
- Instala Android SDK: `sdkmanager --install "platforms;android-34"`
- Configura ANDROID_HOME en variables de entorno
- O usa `eas build` (en la nube) en su lugar

## Archivos Importantes

- `eas.json` - Configuración de compilación
- `app.json` - Permisos de Bluetooth (ya configurado)
- `src/services/BluetoothService.ts` - Lógica BLE real
- `src/screens/ConnectionScreen.tsx` - UI que muestra dispositivos

## Siguientes Pasos

Una vez que tengas compilación nativa:
1. Conectar a sensores reales
2. Leer datos de sensores vía BLE
3. Enviar comandos a sensores
4. Persistir conexiones en AsyncStorage

## Recursos Adicionales

- [EAS Build Docs](https://docs.expo.dev/build/)
- [react-native-ble-plx Docs](https://polidea.github.io/react-native-ble-plx/)
- [Android Bluetooth LE Guide](https://developer.android.com/develop/connectivity/bluetooth/ble/overview)

---

📱 **Una vez compilado, verás los dispositivos Bluetooth REALES disponibles.**
