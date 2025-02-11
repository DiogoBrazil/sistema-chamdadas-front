import React, { useState } from 'react';
import { PatientList } from './PatientList';
import { PatientForm } from './PatientForm';

export const PatientsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'list' | 'form'>('menu');

  const renderContent = () => {
    switch (currentView) {
      case 'list':
        return <PatientList onBack={() => setCurrentView('menu')} />;
      case 'form':
        return <PatientForm onBack={() => setCurrentView('menu')} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setCurrentView('form')}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center justify-center space-y-4"
            >
              <span className="text-4xl">📝</span>
              <h3 className="text-xl font-semibold text-gray-900">
                Cadastrar Paciente
              </h3>
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center justify-center space-y-4"
            >
              <span className="text-4xl">🔍</span>
              <h3 className="text-xl font-semibold text-gray-900">
                Buscar Pacientes
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