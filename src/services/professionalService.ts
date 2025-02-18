import apiClient from "./apiClient";

interface FormData {
    fullName: string;
    cpf: string;
    profile: 'DOCTOR' | 'RECEPTIONIST' | 'ADMINISTRATOR';
    password: string;    
}

export const fetchProfessinals = async (token: string): Promise<PatientResponse> => {
  const response = await apiClient.get<PatientResponse>('/api/professionals', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createAttendance = async (patientId: number, token: string) => {
  await apiClient.post('/api/attendances',{ patientId },
    { headers: {
      Authorization: `Bearer ${token}`,
    }, }
  );
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