import axios from 'axios';
import { mockUsers, mockStations } from './ApiRest';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.helsy.com.co/api/';

const ApiHelsy = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory cache for variable active states (toggled by admin)
export const variablesStateMap: Record<number, number> = {};

// Helper to resolve custom active variables per station type, strictly matching mockSensors IDs
export const getMockVariablesForEstacion = (idEstacion: number) => {
  const stationId = Number(idEstacion);
  const station = mockStations.find(s => s.id === stationId);
  const typeId = station ? station.id_tipo_estacion : 1;

  let vars: any[] = [];
  if (typeId === 2) {
    // Hidrológico
    vars = [
      { id: 14, nombre: 'Nivel', codigo: 'V10', estado: 0 },
      { id: 9, nombre: 'Flujo', codigo: 'V1', estado: 0 },
      { id: 15, nombre: 'pH', codigo: 'V17', estado: 0 },
      { id: 16, nombre: 'Turbidez', codigo: 'V18', estado: 0 },
      { id: 1, nombre: 'Temperatura', codigo: 'V5', estado: 0 },
      { id: 8, nombre: 'Humedad Relativa % RH', codigo: 'V8', estado: 0 }
    ];
  } else if (typeId === 1) {
    // Meteorológico
    vars = [
      { id: 1, nombre: 'Temperatura', codigo: 'V5', estado: 0 },
      { id: 8, nombre: 'Humedad Relativa % RH', codigo: 'V8', estado: 0 },
      { id: 10, nombre: 'Velocidad del viento en 1 minuto km/h', codigo: 'V3', estado: 0 },
      { id: 3, nombre: 'Lluvia en 1 hora (mm)', codigo: 'V6', estado: 0 },
      { id: 6, nombre: 'Dirección del viento °', codigo: 'V2', estado: 0 },
      { id: 7, nombre: 'Velocidad del viento en 5 minutos km/h', codigo: 'V4', estado: 0 },
      { id: 5, nombre: 'Lluvia en las últimas 24 horas (mm)', codigo: 'V7', estado: 0 },
      { id: 13, nombre: 'Presión Barométrica', codigo: 'V9', estado: 0 }
    ];
  } else if (typeId === 3) {
    // Calidad Aire (AiQ)
    vars = [
      { id: 4, nombre: 'Monóxido de carbono / óxido de carbono µg/m³', codigo: 'V12', estado: 0 },
      { id: 11, nombre: 'Amoníaco NH₃ µg/m³', codigo: 'V13', estado: 0 },
      { id: 12, nombre: 'Dióxido de nitrógeno u óxido de nitrógeno µg/m³', codigo: 'V15', estado: 0 },
      { id: 2, nombre: 'Óxido nítrico (NO) y dióxido de nitrógeno (NO₂)', codigo: 'V16', estado: 0 },
      { id: 1, nombre: 'Temperatura', codigo: 'V5', estado: 0 },
      { id: 8, nombre: 'Humedad Relativa % RH', codigo: 'V8', estado: 0 }
    ];
  } else {
    // Otros / Solar / Ruidos
    vars = [
      { id: 7, nombre: 'Velocidad del viento en 5 minutos km/h', codigo: 'V4', estado: 0 },
      { id: 1, nombre: 'Temperatura', codigo: 'V5', estado: 0 },
      { id: 8, nombre: 'Humedad Relativa % RH', codigo: 'V8', estado: 0 }
    ];
  }

  // Apply in-memory toggles
  return vars.map(v => ({
    ...v,
    estado: variablesStateMap[v.id] !== undefined ? variablesStateMap[v.id] : v.estado
  }));
};

// Map each variable code to its premium target baseline and unit code
const getBaseValForVariable = (variable: string): { base: number; unit: string } => {
  const code = variable.toUpperCase();
  switch (code) {
    case 'V5':  // Temperatura
      return { base: 27.2, unit: 'V5' };
    case 'V8':  // Humedad Relativa % RH
      return { base: 99.0, unit: 'V8' };
    case 'V3':  // Velocidad del viento en 1 minuto km/h
      return { base: 12.0, unit: 'V3' };
    case 'V6':  // Lluvia en 1 hora (mm)
      return { base: 1.5, unit: 'V6' };
    case 'V7':  // Lluvia en las últimas 24 horas (mm)
      return { base: 12.0, unit: 'V7' };
    case 'V10': // Nivel (Estación Hidrológica)
      return { base: 3.8, unit: 'V10' };
    case 'V1':  // Flujo (Estación Hidrológica)
      return { base: 340.0, unit: 'V1' };
    case 'V17': // pH (Agregado para el reto del Río Atrato)
      return { base: 7.2, unit: 'V17' };
    case 'V18': // Turbidez (Agregado para el reto del Río Atrato)
      return { base: 15.0, unit: 'V18' };
    case 'V4':  // Velocidad del viento en 5 minutos km/h
      return { base: 15.0, unit: 'V4' };
    case 'V12': // Monóxido de carbono / óxido de carbono µg/m³
      return { base: 350.0, unit: 'V12' };
    case 'V13': // Amoníaco NH₃ µg/m³
      return { base: 25.0, unit: 'V13' };
    case 'V15': // Dióxido de nitrógeno u óxido de nitrógeno µg/m³
      return { base: 45.0, unit: 'V15' };
    case 'V16': // Óxido nítrico (NO) y dióxido de nitrógeno (NO₂)
      return { base: 30.0, unit: 'V16' };
    case 'V2':  // Dirección del viento °
      return { base: 180.0, unit: 'V2' };
    case 'V9':  // Presión Barométrica
      return { base: 1012.0, unit: 'V9' };
    default:
      return { base: 45.0, unit: code };
  }
};

// In-memory cache for mock readings
const readingsCache: Record<string, { timestamp: number; data: any[] }> = {};

// Mock readings generator for charts & cards with 10-second stability cache
const generateMockReadings = (variable: string) => {
  const nowMs = Date.now();
  const cacheKey = variable.toUpperCase();
  
  // Check if we have cached readings less than 10 seconds old
  if (readingsCache[cacheKey] && nowMs - readingsCache[cacheKey].timestamp < 10000) {
    return readingsCache[cacheKey].data;
  }

  const readings: any[] = [];
  const { base: baseVal, unit } = getBaseValForVariable(variable);
  const now = new Date(nowMs);
  
  // Create a seed based on current time (changes once every 10 seconds)
  const seedTime = Math.floor(nowMs / 10000);
  
  for (let i = 48; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600 * 1000);
    
    // A deterministic pseudo-random variation using sine waves and a time seed
    const pseudoRandom = Math.sin(seedTime + i) * 0.5 + Math.cos((seedTime * i) % 10) * 0.5;
    const variation = (Math.sin(i / 6) * (baseVal * 0.05)) + (pseudoRandom * (baseVal * 0.02));
    const val = baseVal + variation;
    
    // YYYY-MM-DD HH:mm:ss format
    const year = time.getFullYear();
    const month = String(time.getMonth() + 1).padStart(2, '0');
    const day = String(time.getDate()).padStart(2, '0');
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // IMPORTANT: The leitura property MUST be strictly formatted as: `${val.toFixed(3)}${unit}` (e.g. "27.200V5")
    // or else the UI lookahead regex `(?=V5)` matches null, and gauges or lines remain blank!
    readings.push({
      id: i,
      fecha: formattedDate,
      created_at: formattedDate,
      lectura: `${val.toFixed(3)}${unit}`,
      hora: `${hours}:${minutes}`,
      sensor: 1 // dummy sensor ID
    });
  }

  readingsCache[cacheKey] = {
    timestamp: nowMs,
    data: readings
  };

  return readings;
};

// Method overrides to bypass network entirely
ApiHelsy.post = function (url: string, data?: any, config?: any): Promise<any> {
  const normalizedUrl = url.toLowerCase();
  console.log(`[ApiHelsy Mock POST] Bypassing: ${url}`);

  if (normalizedUrl.includes('users')) {
    return Promise.resolve({
      data: mockUsers,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('toggle/variable/update')) {
    const parts = url.split('/');
    const state = Number(parts[parts.length - 1]);
    const varId = Number(parts[parts.length - 2]);
    if (!isNaN(varId) && !isNaN(state)) {
      variablesStateMap[varId] = state;
    }
    return Promise.resolve({
      data: { success: true, message: 'Estado de variable actualizado con éxito' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('previewdetailcharts') || normalizedUrl.includes('previewdetailchartsadvancedsolar') || normalizedUrl.includes('previewdetailchartsadvanced')) {
    const parts = url.split('/');
    const estacionId = Number(parts[parts.length - 2]);

    const variable = parts[parts.length - 1] || 'V5';
    
    const vars = getMockVariablesForEstacion(estacionId);
    const varObj = vars.find(v => v.codigo.toUpperCase() === variable.toUpperCase());
    if (varObj && varObj.estado === 1) {
      return Promise.resolve({ data: [], status: 200, statusText: 'OK', headers: {}, config: config || {} });
    }

    const mockData = generateMockReadings(variable);
    return Promise.resolve({
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  return Promise.resolve({
    data: [],
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config || {},
  });
};

ApiHelsy.get = function (url: string, config?: any): Promise<any> {
  const normalizedUrl = url.toLowerCase();
  console.log(`[ApiHelsy Mock GET] Bypassing: ${url}`);

  if (normalizedUrl.includes('estaciones/veriables')) {
    const parts = url.split('/');
    const idEstacion = Number(parts[parts.length - 1]);
    const vars = getMockVariablesForEstacion(idEstacion);
    return Promise.resolve({
      data: vars,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  if (normalizedUrl.includes('previewdetailcharts') || normalizedUrl.includes('previewdetailchartsadvancedsolar') || normalizedUrl.includes('previewdetailchartsadvanced')) {
    const parts = url.split('/');
    const estacionId = Number(parts[parts.length - 2]);

    const variable = parts[parts.length - 1] || 'V5';
    
    const vars = getMockVariablesForEstacion(estacionId);
    const varObj = vars.find(v => v.codigo.toUpperCase() === variable.toUpperCase());
    if (varObj && varObj.estado === 1) {
      return Promise.resolve({ data: [], status: 200, statusText: 'OK', headers: {}, config: config || {} });
    }

    const mockData = generateMockReadings(variable);
    return Promise.resolve({
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config || {},
    });
  }

  return Promise.resolve({
    data: [],
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config || {},
  });
};

export default ApiHelsy;