export const API_URL = 'http://localhost:5000/api';
export const WS_URL = 'http://localhost:5000'; 

export const apiKey =  "b1b15e88fa797225412429c1c50c122a1"


export const API_ROUTES = {
  login: `${API_URL}/auth/login`,
  setOffice: `${API_URL}/auth/set-office`,
  patients: `${API_URL}/patients`,
  professionals: `${API_URL}/professionals`,
  attendances: `${API_URL}/attendances`,
  reports: `${API_URL}/reports`
};

export const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'api_key': apiKey, 
});

export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data.message || 'Erro no servidor';
  }
  return error.message || 'Erro ao conectar com o servidor';
};