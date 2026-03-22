-- ===============================================
-- GREEN-PULSE: Script Completo para Supabase
-- ===============================================
-- Ejecuta este script en: SQL Editor > New Query
-- ===============================================

-- 1. CREAR TABLA sensor_data
-- ===============================================
CREATE TABLE IF NOT EXISTS sensor_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ph DECIMAL(4,2),
  conductivity DECIMAL(5,2),
  humidity DECIMAL(5,2),
  salinity DECIMAL(7,0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. CREAR ÍNDICES
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_sensor_data_user_id ON sensor_data(user_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_created_at ON sensor_data(created_at DESC);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ===============================================
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- 4. CREAR POLÍTICAS RLS
-- ===============================================

-- Política 1: Permitir INSERT para usuarios autenticados
CREATE POLICY "Users can insert their own data"
ON sensor_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Política 2: Permitir INSERT anónimo (para desarrollo)
CREATE POLICY "Allow anonymous insert"
ON sensor_data
FOR INSERT
TO anon
WITH CHECK (true);

-- Política 3: Permitir SELECT público
CREATE POLICY "Anyone can read sensor data"
ON sensor_data
FOR SELECT
TO public
USING (true);

-- ===============================================
-- ✅ SCRIPT COMPLETADO
-- ===============================================
-- Próximos pasos:
-- 1. Copia este script completo
-- 2. Ve a https://app.supabase.com
-- 3. Entra en tu proyecto
-- 4. Ve a SQL Editor > New Query
-- 5. Pega y ejecuta este script
-- 6. Reinicia la app
-- ===============================================
