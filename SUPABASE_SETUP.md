# 📋 Guía de Configuración - Almacenamiento en Supabase

## 🎯 Objetivo
Configurar Supabase para que la app almacene datos de sensores automáticamente.

---

## ✅ OPCIÓN A: Auto-Login (Recomendado - Más Fácil)

### Paso 1: Ir a Supabase
1. Abre https://app.supabase.com
2. Entra en tu proyecto
3. Ve a **Authentication > Users** (Autenticación > Usuarios)

### Paso 2: Ver Usuarios Existentes
La app intentará crear automáticamente un usuario de test:
- **Email**: `test@greenpulse.local`
- **Password**: `GreenPulse@2026`

**La app lo crea automáticamente cuando inicia**, así que probablemente ya esté creado.

### Paso 3: Verificar Tabla `sensor_data`
1. Ve a **SQL Editor**
2. Ejecuta esta query para crear la tabla si no existe:

```sql
CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ph DECIMAL(4,2),
  conductivity DECIMAL(5,2),
  humidity DECIMAL(5,2),
  salinity DECIMAL(7,0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_sensor_data_user_id ON sensor_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at DESC);
```

### Paso 4: Configurar Row Level Security (RLS)

1. Ve a **Authentication > Policies** (Autenticación > Políticas)
2. Selecciona tabla `sensor_data`
3. **Habilita RLS** (toggle en la esquina superior)
4. Crea estas políticas:

#### Política 1: Permitir INSERT para usuarios autenticados
```
CREATE POLICY "Users can insert their own data"
ON sensor_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
```

#### Política 2: Permitir INSERT anónimo (opcional, para desarrollo)
```
CREATE POLICY "Allow anonymous insert"
ON sensor_data
FOR INSERT
TO anon
WITH CHECK (true);
```

#### Política 3: Permitir SELECT público
```
CREATE POLICY "Anyone can read sensor data"
ON sensor_data
FOR SELECT
TO public
USING (true);
```

---

## 📱 ¿Cómo Funciona Ahora?

### Flujo de Datos:
```
App Inicia
    ↓
AutoAuthService.autoLogin()
    ↓
user: test@greenpulse.local
    ↓
MockSensorService genera datos cada 30s
    ↓
SensorService.insertData() → Supabase
    ↓
ThingSpeakService.sendData() → ThingSpeak (automático)
    ↓
Pantallas muestran datos (Supabase + Local Storage)
```

### Dónde se guardan los datos:
- ✅ **Supabase** - Base de datos en la nube
- ✅ **LocalStorage** - En el dispositivo (backup)
- ✅ **ThingSpeak** - Canal 3306366 (visualización)

---

## 🔍 Verificar que Funciona

### En la App:
1. Abre **Dashboard** - Verás datos actualizarse
2. Abre **Análisis** - Verás gráficas
3. Abre **Config** - Verás credenciales

### En Supabase:
1. Ve a **Table Editor** > `sensor_data`
2. Deberías ver registros nuevos cada 30 segundos
3. Verifica columnas:
   - `ph`: Valor entre 5.75 - 6.25
   - `conductivity`: Valor entre 1.1 - 1.9
   - `humidity`: Valor entre 55-75
   - `salinity`: Valor entre 350-450
   - `created_at`: Marca de tiempo actual

### En ThingSpeak:
1. Ve a https://thingspeak.com/channels/3306366
2. Verás gráficas actualizándose con los datos

---

## ⚙️ Configuración en el Código (Ya Hecho)

Los siguientes servicios ya están configurados:

### `AutoAuthService.ts`
- Crea/autentica automáticamente con `test@greenpulse.local`
- Se ejecuta al iniciar la app

### `SensorService.ts`
- Inserta datos en Supabase con o sin autenticación
- Automáticamente envía a ThingSpeak

### `MockSensorService.ts`
- Genera datos realistas cada 30 segundos
- Los datos fluyen automáticamente a Supabase

---

## 🆘 Solucionar Problemas

### "No veo datos en Supabase"
- Verifica que está habilitado RLS ✅
- Verifica que existe la tabla `sensor_data`
- Revisa los logs en la app (consola del navegador)

### "Error: usuario no autenticado"
- La app debería auto-crear el usuario
- Si no, ve a **Authentication > Users** y verifica que existe `test@greenpulse.local`

### "Los datos no se guardan pero veo en LocalStorage"
- Es normal, significa que Supabase puede estar temporalmente caído
- Los datos se guardan localmente como backup
- Se sincronizarán cuando Supabase esté disponible

---

## 📚 Recursos

- [Documentación Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [GreenPulse Repo](https://github.com/IKERD11/GREEN-PULSE)

---

**¿Necesitas ayuda? Los datos deberían aparecer en Supabase automáticamente al iniciar la app.**
