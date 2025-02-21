import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import classNames from 'classnames';

export const CallPanel: React.FC = React.memo(() => {
  const [currentCall, setCurrentCall] = useState<Attendance | null>(null);
  const [callHistory, setCallHistory] = useState<(Attendance & { callTime: Date })[]>([]);
  
  // Fila de pronúncias
  const speechQueue = useRef<Attendance[]>([]);
  const isSpeaking = useRef<boolean>(false);
  
  // Função para processar a fila de pronúncias
  const processSpeechQueue = useCallback(() => {
    if (speechQueue.current.length === 0 || isSpeaking.current) return;
    
    isSpeaking.current = true;
    const nextAttendance = speechQueue.current[0];
    
    const text = `${nextAttendance.patient.fullName}, compareça ao consultório ${nextAttendance.officeNumber}`;      
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    
    // Quando terminar de falar, remove da fila e processa o próximo
    utterance.onend = () => {
      speechQueue.current.shift(); // Remove o primeiro item da fila
      isSpeaking.current = false;
      processSpeechQueue(); // Processa o próximo item da fila
    };
    
    // Se ocorrer erro na pronúncia, não trava a fila
    utterance.onerror = () => {
      speechQueue.current.shift();
      isSpeaking.current = false;
      processSpeechQueue();
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);
  
  // Adiciona à fila de pronúncia
  const speakPatientName = useCallback((attendance: Attendance) => {
    if ('speechSynthesis' in window) {
      speechQueue.current.push(attendance);
      processSpeechQueue();
    }
  }, [processSpeechQueue]);

  const handleNewCall = useCallback((attendance: Attendance) => {
    const callWithTime = { 
      ...attendance, 
      callTime: new Date() 
    };
    
    setCurrentCall(callWithTime);
    setCallHistory(prev => [callWithTime, ...prev].slice(0, 5));
    speakPatientName(attendance);
  }, [speakPatientName]);

  const { connectionStatus } = useSocket(handleNewCall);

  // Limpar a síntese de fala quando o componente for desmontado
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{call.patient.fullName}</p>
                    <p className="text-sm text-gray-600">
                      Consultório {call.officeNumber}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {call.callTime && formatTime(call.callTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});