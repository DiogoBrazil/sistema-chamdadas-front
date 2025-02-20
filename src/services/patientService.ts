import apiClient from "./apiClient";

interface FormData{
  fullName: string;
  cpf: string;
  birthDate: string;
}

export const fetchPatientsByPage = async (token: string, page: number): Promise<PatientResponse> => {
  const response = await apiClient.get<PatientResponse>(`/api/patients/page/${page}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const searchPatientByCpf = async (token: string, cpf: string): Promise<PatientResponse> => {
  const response = await apiClient.get<PatientResponse>(`/api/patients/cpf/${cpf}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const searchPatientsByName = async (token: string, name: string): Promise<PatientResponse> => {
  const response = await apiClient.get<PatientResponse>(`/api/patients/name/${name}`, {
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


export const updatePatient = async (id: number, token: string, formData: FormData) => {
  try {
    const response = await apiClient.put(
      `/api/patients/${id}`,
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

export const deletePatient = async (id: number, token: string) => {
  try {
    const response = await apiClient.delete(
      `/api/patients/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};