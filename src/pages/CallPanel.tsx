import React, { useState, useCallback } from 'react';
import { Attendance } from '../types';
import { useSocket } from '../hooks/useSocket';
import classNames from 'classnames';

export const CallPanel: React.FC = React.memo(() => {
  const [currentCall, setCurrentCall] = useState<Attendance | null>(null);
  const [callHistory, setCallHistory] = useState<Attendance[]>([]);

  const handleNewCall = useCallback((attendance: Attendance) => {
    setCurrentCall(attendance);
    setCallHistory(prev => [attendance, ...prev].slice(0, 5));
    speakPatientName(attendance);
  }, []);

  const { connectionStatus } = useSocket(handleNewCall);

  const speakPatientName = useCallback((attendance: Attendance) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${attendance.patient.fullName}, compareça ao consultório ${attendance.officeNumber}`;
      console.log("consultorio numero", attendance.officeNumber)
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const getConnectionStatusColor = useCallback(() => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }, [connectionStatus]);

  return (
    <div className="px-4 py-6">
      {/* Status da Conexão */}
      <div className="mb-4 flex justify-end">
        <span className={classNames('inline-flex items-center', getConnectionStatusColor())}>
          ●&nbsp;
          {connectionStatus === 'connected' ? 'Conectado' : 
           connectionStatus === 'connecting' ? 'Conectando...' : 
           'Desconectado'}
        </span>
      </div>

      {/* Chamada Atual */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        {currentCall ? (
          <div className="text-center animate-fade-in">
            <h2 className="text-5xl font-bold text-blue-600 mb-4">
              {currentCall.patient.fullName}
            </h2>
            <p className="text-3xl text-gray-600">
              Consultório {currentCall.officeNumber}
            </p>
          </div>
        ) : (
          <div className="text-center text-2xl text-gray-500">
            Aguardando chamadas...
          </div>
        )}
      </div>

      {/* Histórico de Chamadas */}
      {callHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Últimas Chamadas
          </h2>
          <div className="space-y-4">
            {callHistory.map((call, index) => (
              <div
                key={`${call.id}-${index}`}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <p className="font-medium text-gray-900">{call.patient.fullName}</p>
                <p className="text-sm text-gray-600">
                  Consultório {call.officeNumber}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});