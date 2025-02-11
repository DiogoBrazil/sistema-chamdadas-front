import React, { useState } from 'react';
import { ProfessionalList } from './ProfessionalList';
import { ProfessionalForm } from './ProfessionalForm';

export const ProfessionalsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'list' | 'form'>('menu');

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return <ProfessionalList onBack={() => setCurrentView('menu')} />;
      case 'form':
        return <ProfessionalForm onBack={() => setCurrentView('menu')} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setCurrentView('form')}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center justify-center space-y-4"
            >
              <span className="text-4xl">👨‍⚕️</span>
              <h3 className="text-xl font-semibold text-gray-900">
                Cadastrar Profissional
              </h3>
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center justify-center space-y-4"
            >
              <span className="text-4xl">🔍</span>
              <h3 className="text-xl font-semibold text-gray-900">
                Buscar Profissionais
              </h3>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};