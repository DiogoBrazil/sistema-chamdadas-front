import React, { useState, useEffect, useCallback } from 'react';
import { fetchAttendances, callPatient, finishAttendance } from '../services/apiServices';
import { Attendance } from '../types';
import classNames from 'classnames';

export const MedicalConsultation: React.FC = React.memo(() => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [officeNumber, setOfficeNumber] = useState<string>("");

  const loadAttendances = useCallback(async () => {
    try {
      const data = await fetchAttendances();
      setAttendances(data);
    } catch (err) {
      setError('Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedOffice = localStorage.getItem("officeNumber");
    if (storedOffice) {
      setOfficeNumber(storedOffice);
    }
    loadAttendances();

    // Atualiza a lista a cada 30 segundos
    const interval = setInterval(loadAttendances, 30000);
    return () => clearInterval(interval);
  }, [loadAttendances]);

  const handleCallPatient = useCallback(async (attendanceId: number) => {
    if (!officeNumber) {
      alert("Número do consultório não definido.");
      return;
    }

    try {
      await callPatient(attendanceId, parseInt(officeNumber));
      loadAttendances();
    } catch (err) {
      alert('Erro ao chamar paciente');
    }
  }, [loadAttendances, officeNumber]);

  const handleFinishAttendance = useCallback(async (attendanceId: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      await finishAttendance(attendanceId, user.id);
      loadAttendances();
    } catch (err) {
      alert('Erro ao finalizar atendimento');
    }
  }, [loadAttendances]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando atendimentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Consulta Médica</h1>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {attendances.length === 0 ? (
              <p className="text-gray-500 text-center">Nenhum atendimento pendente</p>
            ) : (
              <div className="space-y-4">
                {attendances.map(attendance => (
                  <div 
                    key={attendance.id}
                    className={classNames(
                      'flex items-center justify-between p-4 border rounded-lg',
                      { 'bg-gray-50': attendance.status === 'PENDING' }
                    )}
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{attendance.patient.fullName}</h3>
                      <p className="text-sm text-gray-500">CPF: {attendance.patient.cpf}</p>
                      <p className="text-sm text-gray-500">Status: {attendance.status}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCallPatient(attendance.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                        title="Chamar Paciente"
                      >
                        📢
                      </button>
                      <button
                        onClick={() => handleFinishAttendance(attendance.id)}
                        className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
                        title="Finalizar Atendimento"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
