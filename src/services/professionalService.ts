import apiClient from "./apiClient";

interface FormData {
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST' | 'ADMINISTRATOR';
    password: string;    
}

export const fetchProfessinals = async (token: string): Promise<ProfessionalResponse> => {
  const response = await apiClient.get('/api/professionals', {
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