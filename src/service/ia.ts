// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://mrv-ia.onrender.com/';

/*
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/mrv/v1/';
*/
const ia = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ia;
