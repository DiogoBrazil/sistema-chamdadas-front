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

// export const addPatient = async (token: string, formData: FormData) => {
//   try {
//     const fullNameReplace = formData.fullName.toUpperCase();
//     const formDataReplace = {
//       fullName: fullNameReplace,
//       cpf: formData.cpf,
//       birthDate: formData.birthDate,
//     }
//     const response = await apiClient.post(
//       '/api/patients',      
//       formDataReplace,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     return response.data; 
//   } catch (err) {
//     throw err; 
//   }
// };

export const addPatient = async (token: string, formData: FormData) => {
  try {
    const fullNameReplace = formData.fullName.toUpperCase();
    const formDataReplace = {
      fullName: fullNameReplace,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
    }
    const response = await apiClient.post(
      '/api/patients',      
      formDataReplace,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; 
  } catch (err: any) {
    // Verificar se é um erro de CPF duplicado
    if (err.response?.data?.error && 
        typeof err.response.data.error === 'string' && 
        err.response.data.error.includes('Unique constraint failed') && 
        err.response.data.error.includes('(`cpf`)')) {
      throw new Error('Já existe um paciente cadastrado com esse CPF');
    }
    throw err; 
  }
};


// export const updatePatient = async (id: number, token: string, formData: FormData) => {
//   try {
//     const fullNameReplace = formData.fullName.toUpperCase();
//     const formDataReplace = {
//       fullName: fullNameReplace,
//       cpf: formData.cpf,
//       birthDate: formData.birthDate,
//     }
//     const response = await apiClient.put(
//       `/api/patients/${id}`,
//       formDataReplace,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//           'api_key': apiClient.defaults.headers.api_key
//         },
//       }
//     );
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };

export const updatePatient = async (id: number, token: string, formData: FormData) => {
  try {
    const fullNameReplace = formData.fullName.toUpperCase();
    const formDataReplace = {
      fullName: fullNameReplace,
      cpf: formData.cpf,
      birthDate: formData.birthDate,
    }
    const response = await apiClient.put(
      `/api/patients/${id}`,
      formDataReplace,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'api_key': apiClient.defaults.headers.api_key
        },
      }
    );
    return response.data;
  } catch (err: any) {
    // Verificar se é um erro de CPF duplicado
    if (err.response?.data?.error && 
        typeof err.response.data.error === 'string' && 
        err.response.data.error.includes('Unique constraint failed') && 
        err.response.data.error.includes('(`cpf`)')) {
      throw new Error('Já existe um paciente cadastrado com esse CPF');
    }
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