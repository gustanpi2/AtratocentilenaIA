import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://nuevo.helsy.com.co/mrv/v1/';

const ApiRest = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// HIGH-FIDELITY MOCK DATA DEFINITIONS
// ==========================================

export const mockStations = [
  {
    id: 11,
    estacion_mrv: 11,
    nombre: 'Jardín Principal',
    descripcion: 'Monitoreo hidrológico y ambiental del Río Atrato en el Sector Jardín Principal, Quibdó.',
    lat: '5.6918',
    lng: '-76.6583',
    id_tipo_estacion: 2,
    tipo_estacion: 'Hidrológico',
    tipo_estacion_nombre: 'Hidrológico'
  },
  {
    id: 12,
    estacion_mrv: 12,
    nombre: 'Nicolás Medrano',
    descripcion: 'Monitoreo meteorológico avanzado y control de pluviosidad en Quibdó.',
    lat: '5.6942',
    lng: '-76.6611',
    id_tipo_estacion: 1,
    tipo_estacion: 'Meteorológico',
    tipo_estacion_nombre: 'Meteorológico'
  },
  {
    id: 13,
    estacion_mrv: 13,
    nombre: 'Kennedy, Quibdó',
    descripcion: 'Estación de monitoreo inteligente de la calidad del aire y clima en el Barrio Kennedy.',
    lat: '5.6810',
    lng: '-76.6510',
    id_tipo_estacion: 3,
    tipo_estacion: 'AiQ',
    tipo_estacion_nombre: 'AiQ'
  },
  {
    id: 14,
    estacion_mrv: 14,
    nombre: 'Puente García Gómez',
    descripcion: 'Estación hidrológica clave para la alerta temprana del nivel y caudal en el puente García Gómez.',
    lat: '5.6925',
    lng: '-76.6570',
    id_tipo_estacion: 2,
    tipo_estacion: 'Hidrológico',
    tipo_estacion_nombre: 'Hidrológico'
  },
  {
    id: 32,
    estacion_mrv: 32,
    nombre: 'Cértegui',
    descripcion: 'Monitoreo de dinámica hidrológica y afluentes del Río Cértegui.',
    lat: '5.3850',
    lng: '-76.6020',
    id_tipo_estacion: 2,
    tipo_estacion: 'Hidrológico',
    tipo_estacion_nombre: 'Hidrológico'
  },
  {
    id: 33,
    estacion_mrv: 33,
    nombre: 'Istmina',
    descripcion: 'Monitoreo hidrológico y alertas de caudal en el Río San Juan en Istmina.',
    lat: '5.1610',
    lng: '-76.6850',
    id_tipo_estacion: 2,
    tipo_estacion: 'Hidrológico',
    tipo_estacion_nombre: 'Hidrológico'
  },
  {
    id: 10,
    estacion_mrv: 10,
    nombre: 'Radiación solar',
    descripcion: 'Monitoreo de radiación solar y rayos UV en Quibdó.',
    lat: '5.6980',
    lng: '-76.6600',
    id_tipo_estacion: 4,
    tipo_estacion: 'Otros (Ruidos & Radiación solar)',
    tipo_estacion_nombre: 'Otros (Ruidos & Radiación solar)'
  },
  {
    id: 1,
    estacion_mrv: 1,
    nombre: 'Estación Meteorológica Norte',
    descripcion: 'Medición de temperatura, lluvia y humedad en la zona norte de Quibdó.',
    lat: '5.6950',
    lng: '-76.6530',
    id_tipo_estacion: 1,
    tipo_estacion: 'Meteorológico',
    tipo_estacion_nombre: 'Meteorológico'
  }
];

export const mockSensors = [
  {
    id: 1,
    nombre: 'Temperatura',
    codigo: 'V5',
    minimo: 15,
    maximo: 45,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 2,
    nombre: 'Óxido nítrico (NO) y dióxido de nitrógeno (NO₂)',
    codigo: 'V16',
    minimo: 0,
    maximo: 500,
    tipo_sensor: 'Calidad Aire',
    nombre_tipo_sensor: 'Calidad Aire',
    tipo_sensor_nombre: 'Calidad Aire',
    id_tipo_sensor: 3
  },
  {
    id: 3,
    nombre: 'Lluvia en 1 hora (mm)',
    codigo: 'V6',
    minimo: 0,
    maximo: 150,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 4,
    nombre: 'Monóxido de carbono / óxido de carbono µg/m³',
    codigo: 'V12',
    minimo: 0,
    maximo: 10000,
    tipo_sensor: 'Calidad Aire',
    nombre_tipo_sensor: 'Calidad Aire',
    tipo_sensor_nombre: 'Calidad Aire',
    id_tipo_sensor: 3
  },
  {
    id: 5,
    nombre: 'Lluvia en las últimas 24 horas (mm)',
    codigo: 'V7',
    minimo: 0,
    maximo: 500,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 6,
    nombre: 'Dirección del viento °',
    codigo: 'V2',
    minimo: 0,
    maximo: 360,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 7,
    nombre: 'Velocidad del viento en 5 minutos km/h',
    codigo: 'V4',
    minimo: 0,
    maximo: 120,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 8,
    nombre: 'Humedad Relativa % RH',
    codigo: 'V8',
    minimo: 0,
    maximo: 100,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 9,
    nombre: 'Flujo',
    codigo: 'V1',
    minimo: 0,
    maximo: 800,
    tipo_sensor: 'Hidrológico',
    nombre_tipo_sensor: 'Hidrológico',
    tipo_sensor_nombre: 'Hidrológico',
    id_tipo_sensor: 2
  },
  {
    id: 10,
    nombre: 'Velocidad del viento en 1 minuto km/h',
    codigo: 'V3',
    minimo: 0,
    maximo: 120,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 11,
    nombre: 'Amoníaco NH₃ µg/m³',
    codigo: 'V13',
    minimo: 0,
    maximo: 200,
    tipo_sensor: 'Calidad Aire',
    nombre_tipo_sensor: 'Calidad Aire',
    tipo_sensor_nombre: 'Calidad Aire',
    id_tipo_sensor: 3
  },
  {
    id: 12,
    nombre: 'Dióxido de nitrógeno u óxido de nitrógeno µg/m³',
    codigo: 'V15',
    minimo: 0,
    maximo: 500,
    tipo_sensor: 'Calidad Aire',
    nombre_tipo_sensor: 'Calidad Aire',
    tipo_sensor_nombre: 'Calidad Aire',
    id_tipo_sensor: 3
  },
  {
    id: 13,
    nombre: 'Presión Barométrica',
    codigo: 'V9',
    minimo: 800,
    maximo: 1200,
    tipo_sensor: 'Meteorológico',
    nombre_tipo_sensor: 'Meteorológico',
    tipo_sensor_nombre: 'Meteorológico',
    id_tipo_sensor: 1
  },
  {
    id: 14,
    nombre: 'Nivel',
    codigo: 'V10',
    minimo: 0.5,
    maximo: 12.0,
    tipo_sensor: 'Hidrológico',
    nombre_tipo_sensor: 'Hidrológico',
    tipo_sensor_nombre: 'Hidrológico',
    id_tipo_sensor: 2
  },
  {
    id: 15,
    nombre: 'pH',
    codigo: 'V17',
    minimo: 5.5,
    maximo: 8.5,
    tipo_sensor: 'Hidrológico',
    nombre_tipo_sensor: 'Hidrológico',
    tipo_sensor_nombre: 'Hidrológico',
    id_tipo_sensor: 2
  },
  {
    id: 16,
    nombre: 'Turbidez',
    codigo: 'V18',
    minimo: 0,
    maximo: 1000,
    tipo_sensor: 'Hidrológico',
    nombre_tipo_sensor: 'Hidrológico',
    tipo_sensor_nombre: 'Hidrológico',
    id_tipo_sensor: 2
  }
];

export const mockUsers = [
  {
    id: 1,
    nombre: 'Administrador de CodeChocó',
    nombreUsuario: 'admin_codechoco',
    email: 'admin@codechoco.gov.co',
    rol: 1, // 1: Admin
    estado: 1 // 1: Activo
  },
  {
    id: 2,
    nombre: 'Técnico de Campo',
    nombreUsuario: 'tecnico_campo',
    email: 'tecnico@helsy.com.co',
    rol: 2, // 2: Cliente / Técnico
    estado: 1 // 1: Activo
  },
  {
    id: 3,
    nombre: 'Guardián del Río',
    nombreUsuario: 'guardian_atrato',
    email: 'guardian@atratocentinela.org',
    rol: 3, // 3: Usuario
    estado: 1 // 1: Activo
  }
];

export const mockTipoSensors = [
  { id: 1, nombre: 'Meteorológico' },
  { id: 2, nombre: 'Hidrológico' },
  { id: 3, nombre: 'Calidad Aire' },
  { id: 4, nombre: 'Otros' }
];

export const mockCharts = [
  { id: 1, nombre: 'Temperatura', tipo: 'line' },
  { id: 2, nombre: 'Lluvia en 1h', tipo: 'bar' },
  { id: 3, nombre: 'Flujo', tipo: 'line' },
  { id: 4, nombre: 'Nivel del Río', tipo: 'line' }
];

// In-memory persistent map for custom linked sensors per station
export const stationSensorsMap: Record<number, number[]> = {};

// Helper to filter sensors by station type/id
export const getMockSensorByEstacionData = (estacionId: number) => {
  const station = mockStations.find(s => s.id === estacionId);
  if (!station) return [mockSensors[0]]; // fallback

  // Return customized sensors if they have been defined in-memory
  if (stationSensorsMap[estacionId]) {
    return mockSensors.filter(s => stationSensorsMap[estacionId].includes(s.id));
  }

  // Otherwise initialize standard set based on type
  let sensorIds: number[] = [];
  if (station.id_tipo_estacion === 2) {
    // Hidrológico: V10, V1, V17, V18, V5, V8
    sensorIds = [14, 9, 15, 16, 1, 8];
  } else if (station.id_tipo_estacion === 1) {
    // Meteorológico: V5, V8, V3, V6, V2, V4, V7, V9
    sensorIds = [1, 8, 10, 3, 6, 7, 5, 13];
  } else if (station.id_tipo_estacion === 3) {
    // Calidad Aire (AiQ): V12, V13, V15, V16, V5, V8
    sensorIds = [4, 11, 12, 2, 1, 8];
  } else {
    // Otros / Solar: V4, V5, V8
    sensorIds = [7, 1, 8];
  }

  stationSensorsMap[estacionId] = sensorIds;
  return mockSensors.filter(s => sensorIds.includes(s.id));
};

// ==========================================
// EXPORTS OF QUERY FUNCTIONS (PROMISE RESOLVES)
// ==========================================

export const getEstaciones = () => Promise.resolve(mockStations);
export const getSensors = () => Promise.resolve(mockSensors);
export const getUsuarios = () => Promise.resolve(mockUsers);
export const getSensorByEstacion = (estacionId: number) => Promise.resolve(getMockSensorByEstacionData(estacionId));

export const getEstacionById = (id: number): Promise<any> => {
  const parsedId = Number(id);
  let station = mockStations.find(s => s.id === parsedId);
  if (!station) {
    // Dynamically synthesize a high-fidelity station object so unknown IDs never crash!
    const tipoName = ['Meteorológico', 'Hidrológico', 'AiQ', 'Otros'][(parsedId - 1) % 4] || 'Meteorológico';
    station = {
      id: parsedId,
      estacion_mrv: parsedId,
      nombre: `Estación Centinela #${parsedId}`,
      descripcion: `Monitoreo automático inteligente dinámico en la estación #${parsedId}.`,
      lat: (5.6880 + (parsedId * 0.001) % 0.015).toFixed(4),
      lng: (-76.6583 - (parsedId * 0.001) % 0.015).toFixed(4),
      id_tipo_estacion: ((parsedId - 1) % 4) + 1,
      tipo_estacion: tipoName,
      tipo_estacion_nombre: tipoName
    };
    mockStations.push(station);
  }
  return Promise.resolve(station);
};

export const getMonitoreo = (id: number): Promise<any> => {
  const parsedId = Number(id);
  return getEstacionById(parsedId).then(station => {
    const sensors = getMockSensorByEstacionData(parsedId);
    return {
      ...station,
      sensores: sensors,
      temperatura: 27.2,
      humedad: 99.0,
      nivel_rio: 3.8,
      ph: 7.2,
      turbidez: 15.0
    };
  });
};

// ==========================================
// AXIOS METHOD OVERRIDES (TOTAL BYPASS)
// ==========================================

const originalGet = ApiRest.get;
ApiRest.get = function (url: string, config?: any): Promise<any> {
  const normalizedUrl = url.toLowerCase();
  console.log(`[ApiRest Mock GET] Bypassing real request to: ${url}`);

  if (normalizedUrl.includes('obtenerestacion')) {
    const match = url.match(/[?&]id=(\d+)/) || url.match(/\/(\d+)/);
    const id = match ? parseInt(match[1]) : 11;
    
    return getEstacionById(id).then(station => {
      return {
        data: { success: true, data: [station] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config || {},
      };
    });
  }

  if (normalizedUrl.includes('tipos-estacion')) {
    return Promise.resolve({
      data: { success: true, data: mockTipoSensors },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('estaciones')) {
    return Promise.resolve({
      data: { success: true, data: mockStations },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('sensor-estacion')) {
    const parsedUrl = new URL(url, 'https://dummy.com');
    const sensorParam = parsedUrl.searchParams.get('sensor') || config?.params?.sensor;
    const addParam = parsedUrl.searchParams.get('add') || config?.params?.add;

    if (sensorParam && addParam) {
      const sId = Number(sensorParam);
      const estId = Number(addParam);
      if (!stationSensorsMap[estId]) {
        getMockSensorByEstacionData(estId); // initialize
      }
      if (!stationSensorsMap[estId].includes(sId)) {
        stationSensorsMap[estId].push(sId);
      }
      return Promise.resolve({
        data: { success: true, message: 'Sensor vinculado correctamente' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config || {},
      });
    }

    const id = config?.params?.id || parsedUrl.searchParams.get('id') || 11;
    return Promise.resolve({
      data: { success: true, data: getMockSensorByEstacionData(Number(id)) },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('sensor')) {
    return Promise.resolve({
      data: { success: true, data: mockSensors },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('tipo_sensor')) {
    return Promise.resolve({
      data: { success: true, data: mockTipoSensors },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  // General fallback
  return Promise.resolve({
    data: { success: true, data: [] },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config || {},
  });
};

const originalPost = ApiRest.post;
ApiRest.post = function (url: string, data?: any, config?: any): Promise<any> {
  const normalizedUrl = url.toLowerCase();
  console.log(`[ApiRest Mock POST] Bypassing real request to: ${url}`);

  if (normalizedUrl.includes('add/estacion')) {
    let nombre = 'Estación Nueva';
    let descripcion = '';
    let lat = '5.6900';
    let lng = '-76.6500';
    let id_tipo_estacion = 1;

    if (data instanceof FormData) {
      nombre = (data.get('nombre') as string) || nombre;
      descripcion = (data.get('descripcion') as string) || descripcion;
      lat = (data.get('lat') as string) || lat;
      lng = (data.get('lng') as string) || lng;
      id_tipo_estacion = Number(data.get('id_tipo_estacion')) || id_tipo_estacion;
    } else if (data) {
      nombre = data.nombre || nombre;
      descripcion = data.descripcion || descripcion;
      lat = data.lat || lat;
      lng = data.lng || lng;
      id_tipo_estacion = Number(data.id_tipo_estacion) || id_tipo_estacion;
    }

    const newId = mockStations.length > 0 ? Math.max(...mockStations.map(s => s.id)) + 1 : 1;
    const tipoName = ['Meteorológico', 'Hidrológico', 'AiQ', 'Otros (Ruidos & Radiación solar)'][(id_tipo_estacion - 1) % 4] || 'Meteorológico';
    const newStation = {
      id: newId,
      estacion_mrv: newId,
      nombre,
      descripcion,
      lat,
      lng,
      id_tipo_estacion,
      tipo_estacion: tipoName,
      tipo_estacion_nombre: tipoName
    };
    mockStations.push(newStation);

    return Promise.resolve({
      data: { success: true, message: 'Estación creada con éxito', data: newStation },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('estaciones/update')) {
    const parsedId = Number(data?.id);
    const station = mockStations.find(s => s.id === parsedId);
    if (station) {
      station.nombre = data.nombre || station.nombre;
      station.descripcion = data.descripcion || station.descripcion;
    }
    return Promise.resolve({
      data: { success: true, message: 'Estación actualizada con éxito' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('delete/estaciones')) {
    const parsedId = Number(data?.id);
    const index = mockStations.findIndex(s => s.id === parsedId);
    if (index > -1) {
      mockStations.splice(index, 1);
    }
    return Promise.resolve({
      data: { success: true, message: 'Estación eliminada con éxito' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('sensor-estacion-delete')) {
    const sensorId = data?.id;
    if (sensorId) {
      for (const estId in stationSensorsMap) {
        const index = stationSensorsMap[estId].indexOf(Number(sensorId));
        if (index > -1) {
          stationSensorsMap[estId].splice(index, 1);
        }
      }
    }
    return Promise.resolve({
      data: { success: true, message: 'Sensor desvinculado con éxito' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('charts')) {
    return Promise.resolve({
      data: { success: true, data: mockCharts },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  // Mock all other actions as successful
  return Promise.resolve({
    data: { success: true, message: 'Operación simulada con éxito' },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config || {},
  });
};

export default ApiRest;
