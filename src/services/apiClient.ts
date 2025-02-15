import axios from 'axios';

const apiKey =  import.meta.env.VITE_API_KEY
const API_URL = import.meta.env.VITE_API_URL

if (!apiKey){
  console.error("Variaveis de ambiente não definidas");
  throw new Error("Error interno: API KEY não configurada")
}    

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'api_key': apiKey,
  }
})

export default apiClient;