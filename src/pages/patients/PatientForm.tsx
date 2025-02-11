import React, { useState } from 'react';
import { API_ROUTES, getAuthHeader, handleApiError } from '../../config/api';
import { formatCPF, validateCPF } from '../../utils';

interface PatientFormProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  cpf: string;
  birthDate: string;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cpf: '',
    birthDate: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ROUTES.patients, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          ...formData,
          cpf: formData.cpf.replace(/\D/g, '')
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar paciente');
      }

      alert('Paciente cadastrado com sucesso!');
      onBack();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      cpf: formatCPF(value)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-600 hover:text-blue-800"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Cadastrar Paciente</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              fullName: e.target.value
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            CPF
          </label>
          <input
            type="text"
            required
            maxLength={14}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.cpf}
            onChange={handleCPFChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data de Nascimento
          </label>
          <input
            type="date"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              birthDate: e.target.value
            }))}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
};