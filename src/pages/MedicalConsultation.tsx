import React, { useState, useEffect, useCallback } from 'react';
import { fetchAttendances, callPatient, finishAttendance } from '../services/ConsultaMedicaService';
import { ReportModal } from '../components/ui/ReportModal';
import classNames from 'classnames';
import toast from 'react-hot-toast';

export const MedicalConsultation: React.FC = React.memo(() => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [officeNumber, setOfficeNumber] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; fullName: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Novos estados para controlar atualização
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Função para fetch com loading completo
  const loadAttendances = async (showLoading = true) => {
    if (!token) return;
    
    if (showLoading) setLoading(true);
    setIsRefreshing(true);

    try {
      const response = await fetchAttendances(token);
      setAttendances(response);
      setLastUpdated(new Date());
    } catch (err) {
      if (showLoading) setError('Erro ao carregar atendimentos');
      console.error('Erro ao atualizar atendimentos:', err);
    } finally {
      if (showLoading) setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Função para refresh silencioso
  const refreshAttendances = async () => {
    if (isRefreshing) return; // Evita múltiplas atualizações
    await loadAttendances(false);
  };

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setOfficeNumber(localStorage.getItem('officeNumber') || '');

    if (!token) return;
    
    // Carregamento inicial
    loadAttendances();

    // Configurar o intervalo para atualização silenciosa
    const interval = setInterval(refreshAttendances, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const statusMap: { [key in 'PENDING' | 'IN_PROGRESS' | 'FINISHED']: string } = {
    PENDING: 'Aguardando Atendimento',
    IN_PROGRESS: `Em Atendimento`,
    FINISHED: 'Atendimento Finalizado',
  };

  const handleCallPatient = useCallback(async (attendanceId: number) => {
    if (!token) return;
    if (!officeNumber) {
      toast.error(
        'Número do consultório não definido.',{
          duration: 2000,
          position: 'bottom-right',
          style: {background:'red', color:'white'}
        });      
      return;
    }

    try {
      await callPatient(attendanceId, parseInt(officeNumber), token);
      setAttendances(prev => prev.map(a => 
        (a.id === attendanceId 
          ? { ...a, status: 'IN_PROGRESS' } 
          : a)
        ));
    } catch (err) {      
      toast.error(
        'Erro ao chamar paciente',{
          duration: 2000,
          position: 'bottom-right',
          style: {background:'red', color:'white'}
        });
    }
  }, [token, officeNumber]);

  const handleFinishAttendance = useCallback(async (attendanceId: number) => {
    if (!token || !user?.id) return;

    try {
      await finishAttendance(attendanceId, user.id, token);
      setAttendances(prev => prev.filter(a => a.id !== attendanceId));
    } catch (err) {
      toast.error(
        'Erro ao finalizar atendimento',{
          duration: 2000,
          position: 'bottom-right',
          style: {background:'red', color:'white'}
        });      
    }
  }, [token, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando atendimentos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Consulta Médica</h1>
          {user && (
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Ver Meus Atendimentos
            </button>
          )}
        </div>

        {/* Indicador de Atualização */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>
            Última atualização: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={() => loadAttendances(false)}
            className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atualizando...
              </>
            ) : (
              <>
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Atualizar
              </>
            )}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {attendances.length === 0 ? (
            <p className="text-gray-500 text-center">Nenhum atendimento pendente</p>
          ) : (
            <div className="space-y-4">
              {attendances.map(attendance => (
                <div 
                  key={attendance.id}
                  className={classNames(
                    'flex items-center justify-between p-4 border rounded-lg',
                    { 'bg-gray-100': attendance.status === 'PENDING' }
                  )}
                >
                  <div className='flex flex-col'>
                    <h3 className="font-medium text-gray-900">{attendance.patient.fullName}</h3>
                    <p className="text-sm text-gray-500">CPF: {attendance.patient.cpf}</p>
                    <p className="text-sm text-gray-500">Status: {statusMap[attendance.status]}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCallPatient(attendance.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100 transition"
                      aria-label="Chamar Paciente"
                      title="Chamar Paciente"
                    >
                      📢
                    </button>
                    <button
                      onClick={() => handleFinishAttendance(attendance.id)}
                      className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100 transition"
                      aria-label="Finalizar Atendimento"
                      title="Finalizar Atendimento"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {user && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          professionalId={user.id}
          professionalName={user.fullName}
        />
      )}
    </div>
  );
});