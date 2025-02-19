import React, { useState, useEffect } from 'react';
import { formatCPF, replaceCPF, validateCPF } from '../../utils';
import { addProfessional } from '../../services/professionalService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


type Profile = 'DOCTOR' | 'RECEPTIONIST' | 'ADMINISTRATOR';

interface ProfessionalFormProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  cpf: string;
  profile: Profile;
  password: string;
  confirmPassword: string;
}

interface FormError {
  field: keyof FormData;
  message: string;
}

const INITIAL_FORM_DATA: FormData = {
  fullName: '',
  cpf: '',
  profile: 'DOCTOR',
  password: '',
  confirmPassword: ''
};

const PROFILE_OPTIONS = [
  { value: 'ADMINISTRATOR', label: 'Administrador' },
  { value: 'DOCTOR', label: 'Médico' },
  { value: 'RECEPTIONIST', label: 'Recepcionista' }
] as const;

export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormError[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token){
      toast.error(
        'Usuário não autenticado. Redirecionando...',{
          duration: 2000,
          position: 'bottom-right',
          style: {background:'red', color:'white'}
        });
        setTimeout(() => navigate('/login'), 3000);
    }  
  },[navigate]);

  const getFieldError = (field: keyof FormData): string => {
    return errors.find(error => error.field === field)?.message || '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formData.fullName.trim()) {
      newErrors.push({ field: 'fullName', message: 'Nome completo é obrigatório' });
    }

    const cpfValidation = validateCPF(formData.cpf);
    if (cpfValidation) {
      newErrors.push({ field: 'cpf', message: 'CPF inválido' });
    }

    if (formData.password.length < 6) {
      newErrors.push({ field: 'password', message: 'A senha deve ter no mínimo 6 caracteres' });
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'As senhas não conferem' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const { confirmPassword, ...submitData } = formData;
      const response = await addProfessional(token, {
        ...submitData,
        cpf: replaceCPF(submitData.cpf)
      });

      if (response.status_code !== 201) {
        throw new Error('Erro ao cadastrar profissional');
      }

      toast.success('Profissional cadastrado com sucesso!', {
        duration: 3000,
        position: 'bottom-right',
        style: { background: 'green', color: 'white' },
      });
      onBack();
    } catch (error) {
      toast.error('Erro ao cadastrar profissional. Tente novamente.', {
        duration: 3000,
        position: 'bottom-right',
        style: { background: '#ef4444', color: 'white' },
      });
      console.error('Error adding professional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string,
    formatter?: (value: string) => string
  ) => {
    const formattedValue = formatter ? formatter(value) : value;
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const renderField = (
    field: keyof FormData,
    label: string,
    type: string = 'text',
    options?: { placeholder?: string; formatter?: (value: string) => string; maxLength?: number }
  ) => {
    const error = getFieldError(field);

    if (field === 'profile') {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <select
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROFILE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value, options?.formatter)}
          maxLength={options?.maxLength}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={options?.placeholder}
        />
        {error && (
          <span className="text-sm text-red-500 mt-1">{error}</span>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Cadastrar Profissional</h2>
      </div> 

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {renderField('fullName', 'Nome Completo', 'text', {
            placeholder: 'Digite o nome completo'
          })}
          
          {renderField('cpf', 'CPF', 'text', {
            placeholder: '000.000.000-00',
            formatter: formatCPF,
            maxLength: 14
          })}
          
          {renderField('profile', 'Perfil')}
          
          {renderField('password', 'Senha', 'password', {
            placeholder: 'Digite sua senha'
          })}
          
          {renderField('confirmPassword', 'Confirmar Senha', 'password', {
            placeholder: 'Confirme sua senha'
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cadastrando...
              </div>
            ) : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
};