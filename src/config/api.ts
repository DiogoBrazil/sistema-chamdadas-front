export const API_URL = 'http://localhost:5000/api';
export const WS_URL = 'http://localhost:5000'; // URL para o Socket.IO

export const API_ROUTES = {
  login: `${API_URL}/auth/login`,
  setOffice: `${API_URL}/auth/set-office`,
  patients: `${API_URL}/patients`,
  professionals: `${API_URL}/professionals`,
  attendances: `${API_URL}/attendances`,
  reports: `${API_URL}/reports`
};

export const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data.message || 'Erro no servidor';
  }
  return error.message || 'Erro ao conectar com o servidor';
};