import React, { useState, useEffect } from 'react';
import { API_ROUTES, getAuthHeader, handleApiError } from '../../config/api';
import { Patient } from '../../types';
import { formatCPF, formatDate } from '../../utils';

interface PatientListProps {
  onBack: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onBack }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch(API_ROUTES.patients, {
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pacientes');
      }

      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttendance = async (patientId: number) => {
    try {
      const response = await fetch(API_ROUTES.attendances, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar atendimento');
      }

      alert('Atendimento gerado com sucesso!');
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Carregando pacientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Lista de Pacientes</h2>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <h3 className="font-medium text-gray-900">{patient.fullName}</h3>
              <p className="text-sm text-gray-500">
                CPF: {formatCPF(patient.cpf)}
              </p>
              <p className="text-sm text-gray-500">
                Data de Nascimento: {formatDate(patient.birthDate)}
              </p>
            </div>
            <button
              onClick={() => handleCreateAttendance(patient.id)}
              className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition-colors"
              title="Gerar Atendimento"
            >
              📋
            </button>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <p className="text-center text-gray-500">
            Nenhum paciente encontrado
          </p>
        )}
      </div>
    </div>
  );
};