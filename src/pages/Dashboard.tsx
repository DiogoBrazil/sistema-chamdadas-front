import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isDoctor } from '../utils';

interface MenuCard {
  title: string;
  icon: string;
  path: string;
  roles: string[];
  description: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const menuCards: MenuCard[] = [
    {
      title: 'Pacientes',
      icon: '👤',
      path: '/patients',
      roles: ['DOCTOR', 'RECEPTIONIST'],
      description: 'Gerenciar pacientes e gerar atendimentos'
    },
    {
      title: 'Profissionais',
      icon: '👥',
      path: '/professionals',
      roles: ['DOCTOR', 'RECEPTIONIST'],
      description: 'Gerenciar médicos e recepcionistas'
    },
    {
      title: 'Consulta Médica',
      icon: '🏥',
      path: '/medical-consultation',
      roles: ['DOCTOR'],
      description: 'Gerenciar atendimentos médicos'
    },
    {
      title: 'Painel de Chamadas',
      icon: '📢',
      path: '/panel',
      roles: ['DOCTOR', 'RECEPTIONIST'],
      description: 'Visualizar chamadas de pacientes'
    }
  ];

  const filteredCards = menuCards.filter(card => 
    card.roles.includes(user?.profile || '')
  );

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bem-vindo, {user?.fullName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredCards.map((card) => (
          <button
            key={card.title}
            onClick={() => navigate(card.path)}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center justify-center space-y-4"
          >
            <span className="text-4xl">{card.icon}</span>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {card.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};