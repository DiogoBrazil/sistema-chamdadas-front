import React, { useState, useEffect, useCallback } from 'react';
import { formatCPF, formatDate } from '../../utils';
import { fetchPatients, createAttendance } from '../../services/patientService';
import toast from 'react-hot-toast';

interface PatientListProps {
  onBack: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [loadingAttendance, setLoadingAttendance] = useState<number | null>(null);

  useEffect(() => {
    fetchPatientList();
  }, []);

  const fetchPatientList = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetchPatients(token);
      setPatients(response.data);
    } catch (err) {
      setError('Erro ao buscar pacientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendance = useCallback(async (patientId: number) => {
    if (loadingAttendance !== null) return;

    setLoadingAttendance(patientId);
    const token = localStorage.getItem('token');
    if (!token) {      
      setLoadingAttendance(null);
      return     
    }

    try {
      await createAttendance(patientId, token);
      toast.success('Atendimento gerado com sucesso!', 
        { duration: 4000, 
          position: 'bottom-right',
          style: { 
            background: 'green', 
            color: 'white' } 
          });
    } catch (err) {
      toast.error('Erro ao gerar atendimento.', 
        { duration: 4000, 
          position: 'bottom-right',
          style: { 
            background: 'red', 
            color: 'white' } 
          });
    } finally {
      setLoadingAttendance(null);
    }
  }, [loadingAttendance]);

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-gray-500">Carregando pacientes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-600 hover:text-blue-800"
          aria-label="Voltar"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Lista de Pacientes</h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div
              key={patient.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-medium text-gray-900">{patient.fullName}</h3>
                <p className="text-sm text-gray-500">CPF: {formatCPF(patient.cpf)}</p>
                <p className="text-sm text-gray-500">Data de Nascimento: {formatDate(patient.birthDate)}</p>
              </div>
              <button
                onClick={() => handleCreateAttendance(patient.id)}
                className={`p-2 rounded-full transition-colors ${loadingAttendance === patient.id ? 'text-gray-500' : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'}`}
                aria-label="Gerar Atendimento"
                disabled={loadingAttendance === patient.id}
              >
                {loadingAttendance === patient.id ? '⏳' : '📋'}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Nenhum paciente encontrado</p>
        )}
      </div>
    </div>
  );
};
