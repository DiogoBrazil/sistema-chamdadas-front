import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfficeSelectionModal } from '../components/OfficeSelectionModal';

interface LoginResponse {
  token: string;
  message: string;
  user: {
    id: number;
    fullName: string;
    cpf: string;
    profile: string;
    currentOffice: number | null;
  };
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoginResponse['user'] | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data: LoginResponse = await response.json();
      
      // Salva o token e usuário no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setCurrentUser(data.user);

      // Se for médico, mostra o modal para selecionar consultório
      if (data.user.profile === 'DOCTOR') {
        setShowOfficeModal(true);
      } else {
        // Se não for médico, vai direto para o dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Credenciais inválidas');
    }
  };

  const handleSetOffice = async (office: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/set-office', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          professionalId: currentUser.id,
          office
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao definir consultório');
      }

      // Atualiza o usuário no localStorage com o novo consultório
      const updatedUser = { ...currentUser, currentOffice: office };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Redireciona para o dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao definir consultório');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-400 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sistema de Chamadas
          </h2>
        </div>
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>

        {currentUser && (
          <OfficeSelectionModal
            isOpen={showOfficeModal}
            onClose={() => setShowOfficeModal(false)}
            onConfirm={handleSetOffice}
            professionalId={currentUser.id}
          />
        )}
      </div>
    </div>
  );
};