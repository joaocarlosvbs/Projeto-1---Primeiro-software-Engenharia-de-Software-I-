// api.js — Configuração central do Axios
// Axios é a biblioteca que faz as requisições HTTP do frontend para o backend.
// Ao centralizar aqui, todos os arquivos usam a mesma baseURL e token.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor: antes de cada requisição, anexa o token JWT automaticamente
// O token é salvo no localStorage após o login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
