import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Obtém a rota atual
  const [user, setUser] = useState<{ fullName?: string; currentOffice?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  
  const hideNavbarRoutes = ["/panel"];  

  return (
    <div className="min-h-screen bg-gray-50"> 
      <Toaster position="top-right" reverseOrder={false} />     
      {!hideNavbarRoutes.includes(location.pathname) && (
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-xl font-bold text-blue-600 hover:text-blue-800"
                >
                  Sistema de Chamadas
                </button>
                {title && <span className="text-gray-700 text-lg">/ {title}</span>}
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <span className="text-gray-700">
                    {user.fullName}
                    {user.currentOffice && ` - Consultório ${user.currentOffice}`}
                  </span>
                ) : (
                  <span className="text-gray-500">Carregando...</span>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
