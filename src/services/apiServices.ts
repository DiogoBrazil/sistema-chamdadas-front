import { Attendance } from '../types';

const API_URL = 'http://localhost:5000/api';

export const fetchAttendances = async (): Promise<Attendance[]> => {
  const response = await fetch(`${API_URL}/attendances`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) throw new Error('Erro ao buscar atendimentos');
  return response.json();
};

export const callPatient = async (attendanceId: number, officeNumber: number): Promise<void> => {
  const response = await fetch(`${API_URL}/attendances/${attendanceId}/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ officeNumber }) 
  });

  if (!response.ok) {
    throw new Error('Erro ao chamar paciente');
  }
};

export const finishAttendance = async (attendanceId: number, professionalId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/attendances/${attendanceId}/finish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ professionalId })
  });

  if (!response.ok) throw new Error('Erro ao finalizar atendimento');
};