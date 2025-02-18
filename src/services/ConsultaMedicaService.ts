import apiClient from './apiClient';


export const fetchAttendances = async (token: string): Promise<Attendance[]> => {
  try {
    const response = await apiClient.get('/api/attendances', {
      headers: {
        Authorization: `Bearer ${token}`        
      }
    });
    
    return response.data.data;
  } catch (error) {
    throw new Error('Erro ao buscar atendimentos');
  }
};

export const callPatient = async (attendanceId: number, officeNumber: number, token: string): Promise<void> => {
  try {
    await apiClient.post(`/api/attendances/${attendanceId}/call`, { officeNumber }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    throw new Error('Erro ao chamar paciente');
  }
};

export const finishAttendance = async (attendanceId: number, professionalId: number, token: string): Promise<void> => {
  try {
    await apiClient.post(`/api/attendances/${attendanceId}/finish`, { professionalId }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    throw new Error('Erro ao finalizar atendimento');
  }
};
