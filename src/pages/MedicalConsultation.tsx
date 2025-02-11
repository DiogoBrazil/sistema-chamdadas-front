import React, { useState, useEffect } from 'react';

interface Patient {
  id: number;
  fullName: string;
  cpf: string;
  birthDate: string;
}

interface Attendance {
  id: number;
  patient: Patient;
  status: 'PENDING' | 'IN_PROGRESS' | 'FINISHED';
  createdAt: string;
  officeNumber?: number;
}

export const MedicalConsultation: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAttendances = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao buscar atendimentos');

      const data = await response.json();
      setAttendances(data);
    } catch (err) {
      setError('Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();

    // Atualiza a lista a cada 30 segundos
    const interval = setInterval(fetchAttendances, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCallPatient = async (attendanceId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendances/${attendanceId}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Erro ao chamar paciente');

      fetchAttendances();
    } catch (err) {
      alert('Erro ao chamar paciente');
    }
  };

  const handleFinishAttendance = async (attendanceId: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      const response = await fetch(`http://localhost:5000/api/attendances/${attendanceId}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          professionalId: user.id
        })
      });

      if (!response.ok) throw new Error('Erro ao finalizar atendimento');

      fetchAttendances();
    } catch (err) {
      alert('Erro ao finalizar atendimento');
    }
  };

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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{attendance.patient.fullName}</h3>
                      <p className="text-sm text-gray-500">
                        CPF: {attendance.patient.cpf}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {attendance.status}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {attendance.status === 'PENDING' && (
                        <button
                          onClick={() => handleCallPatient(attendance.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                          title="Chamar Paciente"
                        >
                          📢
                        </button>
                      )}
                      
                      {(attendance.status === 'PENDING' || attendance.status === 'IN_PROGRESS') && (
                        <button
                          onClick={() => handleFinishAttendance(attendance.id)}
                          className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
                          title="Finalizar Atendimento"
                        >
                          ✓
                        </button>
                      )}
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
};