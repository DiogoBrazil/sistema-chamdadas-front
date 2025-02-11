import React, { useState, useEffect } from 'react';
import { API_ROUTES, getAuthHeader, handleApiError } from '../../config/api';
import { Professional } from '../../types';
import { formatCPF, getProfileLabel } from '../../utils';

interface ProfessionalListProps {
  onBack: () => void;
}

export const ProfessionalList: React.FC<ProfessionalListProps> = ({ onBack }) => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch(API_ROUTES.professionals, {
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar profissionais');
      }

      const data = await response.json();
      setProfessionals(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessionals = professionals.filter(professional =>
    professional.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.cpf.includes(searchTerm.replace(/\D/g, ''))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Carregando profissionais...</div>
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
        <h2 className="text-2xl font-bold text-gray-900">Lista de Profissionais</h2>
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
        {filteredProfessionals.map(professional => (
          <div
            key={professional.id}
            className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <h3 className="font-medium text-gray-900">{professional.fullName}</h3>
              <p className="text-sm text-gray-500">
                CPF: {formatCPF(professional.cpf)}
              </p>
              <p className="text-sm text-gray-500">
                Perfil: {getProfileLabel(professional.profile)}
                {professional.currentOffice && ` - Consultório ${professional.currentOffice}`}
              </p>
            </div>
          </div>
        ))}

        {filteredProfessionals.length === 0 && (
          <p className="text-center text-gray-500">
            Nenhum profissional encontrado
          </p>
        )}
      </div>
    </div>
  );
};