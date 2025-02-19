import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfficeSelectionModal } from '../components/OfficeSelectionModal';
import { login, setOffice } from '../services/authService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoginResponse['data']['user'] | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(cpf, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setCurrentUser(response.data.user);

      if (response.data.user.profile === 'DOCTOR') {
        setShowOfficeModal(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  const handleSetOffice = async (office: number) => {
    if (!currentUser) return;
    setLoading(true);

    try {
      await setOffice(currentUser.id, office);
      localStorage.setItem('officeNumber', JSON.stringify(office));
      const updatedUser = { ...currentUser, currentOffice: office };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao definir consultório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-400 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-bold text-gray-900">Sistema de Chamadas</h2>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" loading={loading}>
            Entrar
          </Button>
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
