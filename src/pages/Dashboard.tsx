import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils';

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
      roles: ['DOCTOR', 'RECEPTIONIST', 'ADMINISTRATOR'],
      description: 'Gerenciar pacientes e gerar atendimentos'
    },
    {
      title: 'Profissionais',
      icon: '👥',
      path: '/professionals',
      roles: ['ADMINISTRATOR'],
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
      roles: ['DOCTOR', 'RECEPTIONIST', 'ADMINISTRATOR'],
      description: 'Visualizar chamadas de pacientes'
    }
  ];

  const filteredCards = menuCards.filter(card => 
    card.roles.includes(user?.profile || '')
  );

  // Determina a classe de grid com base no número de cards
  const getGridClass = () => {
    const count = filteredCards.length;
    
    // Classes base para todos os tamanhos de tela
    let baseClass = "grid gap-6 mx-auto ";
    
    // Ajusta as colunas com base na contagem e no tamanho da tela
    if (count <= 2) {
      return baseClass + "grid-cols-1 md:grid-cols-2 max-w-2xl";
    } else if (count === 3) {
      return baseClass + "grid-cols-1 md:grid-cols-3 max-w-4xl";
    } else {
      return baseClass + "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl";
    }
  };

  return (
    <div className="px-4 py-6 flex flex-col items-center">
      <div className={`w-full ${
        filteredCards.length <= 2 ? "max-w-2xl" : 
        filteredCards.length === 3 ? "max-w-4xl" : "max-w-6xl"
      }`}>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bem-vindo, {user?.fullName}</h1>
        <div className={getGridClass()}>
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
    </div>
  );
};