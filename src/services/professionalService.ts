import apiClient from "./apiClient";

interface FormData {
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST' | 'ADMINISTRATOR';
    password: string;    
}

export const fetchProfessinalsByPage = async (token: string, page: number): Promise<ProfessionalResponse> => {
  const response = await apiClient.get(`/api/professionals/page/${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const searchProfessinalsByCpf = async (token: string, cpf: string): Promise<ProfessionalResponse> => {
  const response = await apiClient.get<ProfessionalResponse>(`/api/professionals/cpf/${cpf}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const searchProfessinalsByName = async (token: string, name: string): Promise<ProfessionalResponse> => {
  const response = await apiClient.get<ProfessionalResponse>(`/api/professionals/name/${name}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const addProfessional = async (token: string, formData: FormData) => {
  if(!token){
    throw new Error('Token não encontrado')
  }
  console.log("FormData no back", formData)
  try {
    const response = await apiClient.post(
      '/api/professionals',      
        formData,
      {
        headers: {
          Authorization: `Bearer ${token}`          
        },
      }
    ); 
       
    return response.data; 
  } catch (err) {
    throw err; 
  }
};

export const updateProfessional = async (id: number, token: string, formData: FormData) => {
  if (!token) {
    throw new Error('Token não encontrado');
  }

  try {
    const response = await apiClient.put(
      `/api/professionals/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'api_key': apiClient.defaults.headers.api_key
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const deleteProfessional = async (id: number, token: string) => {
  if (!token) {
    throw new Error('Token não encontrado');
  }

  try {
    const response = await apiClient.delete(
      `/api/professionals/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'api_key': apiClient.defaults.headers.api_key
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};