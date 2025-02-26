import React, { useState } from 'react';
import { formatCPF, validateCPF } from '../../utils';
import { addPatient } from '../../services/patientService';
import toast from 'react-hot-toast';

interface PatientFormProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  cpf: string;
  birthDate: string;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onBack }) => {

  const initialFormData: FormData = { fullName: '', cpf: '', birthDate: '' };
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     setError('Usuário não autenticado');
  //     setLoading(false);
  //     return;
  //   }

  //   const cpfValidation = validateCPF(formData.cpf);
  //   if (cpfValidation) {      
  //     setError(cpfValidation);
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     await addPatient(token, formData);
  //     toast.success('Paciente cadastrado com sucesso!', {
  //       position: 'bottom-right',
  //       style: { background: 'green', color: 'white' },
  //     }); 
  //     setFormData(initialFormData);     
  //   } catch (err) {      
  //     toast.error('Erro ao cadastrar paciente', {
  //       position: 'bottom-right',
  //       style: { background: 'red', color: 'white' },
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }
  
    const cpfValidation = validateCPF(formData.cpf);
    if (cpfValidation) {      
      setError(cpfValidation);
      return;
    }
  
    setLoading(true);
  
    try {
      await addPatient(token, formData);
      toast.success('Paciente cadastrado com sucesso!', {
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      }); 
      setFormData(initialFormData);     
    } catch (err: any) {
      // Exibir mensagem personalizada quando for erro de CPF duplicado
      const errorMessage = err.message || 'Erro ao cadastrar paciente';
      
      toast.error(errorMessage, {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
      
      // Se for um erro de CPF duplicado, também atualiza o estado de erro do form
      if (err.message && err.message.includes('Já existe um paciente cadastrado com esse CPF')) {
        setError(err.message);
      }
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