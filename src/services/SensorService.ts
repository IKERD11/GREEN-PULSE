import { supabase } from './supabase';
import { ThingSpeakService } from './ThingSpeakService';

export interface SensorData {
  id?: string;
  user_id?: string;
  ph: number;
  conductivity: number;
  salinity: number;
  humidity: number;
  created_at?: string;
}

export const SensorService = {
  // Crear un nuevo registro
  async insertData(data: Omit<SensorData, 'id' | 'created_at'>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuario no autenticado');

    const { error, data: insertedData } = await supabase
      .from('sensor_data')
      .insert({ ...data, user_id: user.user.id })
      .select();

    if (error) throw error;

    // Enviar datos a ThingSpeak en paralelo
    if (insertedData && insertedData.length > 0) {
      const sensorData = insertedData[0];
      ThingSpeakService.sendData({
        field1: sensorData.ph,
        field2: sensorData.conductivity,
        field3: sensorData.humidity,
        field4: sensorData.salinity,
      }).catch(err => console.error('Error enviando a ThingSpeak:', err));
    }

    return insertedData;
  },

  // Obtener historial reciente
  async getHistory(limit = 50) {
    const { error, data } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SensorData[];
  },

  // Suscripción Realtime para la tabla sensor_data
  subscribeToNewData(callback: (newRecord: SensorData) => void) {
    const subscription = supabase
      .channel('public:sensor_data')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => callback(payload.new as SensorData)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
};
