import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <span className="text-xl font-bold">Sistema de Chamadas</span>
              </button>
              {title && (
                <div className="ml-6 flex items-center text-gray-700">
                  <span className="text-lg">/ {title}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user.fullName}
                {user.currentOffice && ` - Consultório ${user.currentOffice}`}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};