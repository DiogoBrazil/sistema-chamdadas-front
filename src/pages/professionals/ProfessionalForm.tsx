import React, { useState } from 'react';
import { API_ROUTES, getAuthHeader, handleApiError } from '../../config/api';
import { formatCPF, validateCPF } from '../../utils';

interface ProfessionalFormProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  cpf: string;
  profile: 'DOCTOR' | 'RECEPTIONIST';
  password: string;
  confirmPassword: string;
}

export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cpf: '',
    profile: 'DOCTOR',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await fetch(API_ROUTES.professionals, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          ...submitData,
          cpf: submitData.cpf.replace(/\D/g, '')
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar profissional');
      }

      alert('Profissional cadastrado com sucesso!');
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
        <h2 className="text-2xl font-bold text-gray-900">Cadastrar Profissional</h2>
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
            Perfil
          </label>
          <select
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.profile}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              profile: e.target.value as 'DOCTOR' | 'RECEPTIONIST'
            }))}
          >
            <option value="DOCTOR">Médico</option>
            <option value="RECEPTIONIST">Recepcionista</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirmar Senha
          </label>
          <input
            type="password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              confirmPassword: e.target.value
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