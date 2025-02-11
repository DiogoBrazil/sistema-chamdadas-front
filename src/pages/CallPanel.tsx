import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Attendance } from '../types';
import { WS_URL } from '../config/api';

export const CallPanel: React.FC = () => {
  const [currentCall, setCurrentCall] = useState<Attendance | null>(null);
  const [callHistory, setCallHistory] = useState<Attendance[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Inicializa o Socket.IO
    const socketInstance = io(WS_URL);

    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor');
      setConnectionStatus('connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do servidor');
      setConnectionStatus('disconnected');
    });

    socketInstance.on('callPatient', (data: { attendance: Attendance }) => {
      console.log('Recebido chamado:', data);
      //@ts-ignore
      handleNewCall(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleNewCall = (attendance: Attendance) => {
    console.log('Chamando paciente================:', attendance);
    setCurrentCall(attendance);
    setCallHistory(prev => [attendance, ...prev].slice(0, 5));
    speakPatientName(attendance);
  };

  const speakPatientName = (attendance: Attendance) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${attendance.patient.fullName}, compareça ao consultório ${attendance.officeNumber}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getConnectionStatusColor = () => {
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
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex justify-end">
        <span className={`inline-flex items-center ${getConnectionStatusColor()}`}>
          ●&nbsp;
          {connectionStatus === 'connected' ? 'Conectado' : 
           connectionStatus === 'connecting' ? 'Conectando...' : 
           'Desconectado'}
        </span>
      </div>

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
};