import apiClient from "./apiClient";

interface FormData{
  fullName: string;
  cpf: string;
  birthDate: string;
}

export const fetchPatients = async (token: string): Promise<PatientResponse> => {
  const response = await apiClient.get<PatientResponse>('/api/patients', {
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

export const addPatient = async (token: string, formData: FormData) => {
  try {
    const response = await apiClient.post(
      '/api/patients',      
        formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; 
  } catch (err) {
    throw err; 
  }
};