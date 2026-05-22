import axios from 'axios';

export const apiHelsy = axios.create({
  baseURL: import.meta.env.VITE_API_URL_HELSY || 'https://api.helsy.com.co/api/',
  headers: { 'Content-Type': 'application/json' },
});

export const apiRest = axios.create({
  baseURL: import.meta.env.VITE_API_URL_MRV || 'https://nuevo.helsy.com.co/mrv/v1/',
  headers: { 'Content-Type': 'application/json' },
});

export const apiIa = axios.create({
  baseURL: import.meta.env.VITE_API_URL_IA || 'https://mrv-ia.onrender.com/',
  headers: { 'Content-Type': 'application/json' },
});

export const API_URL = import.meta.env.VITE_API_URL_HELSY || 'https://api.helsy.com.co/api/';
export const API_IMG_URL = import.meta.env.VITE_API_IMG_URL || 'https://nuevo.helsy.com.co/imgs/';
export const API_MAPS_KEY = import.meta.env.VITE_API_MAPS_KEY || 'AIzaSyBRGpQfSKKlNJIC69qI1cL1uwswRE2ggSc';
export const MRV_SETTINGS_URL = import.meta.env.VITE_MRV_SETTINGS_URL || 'https://mrvmonitor.com/settings';

export default apiHelsy;
