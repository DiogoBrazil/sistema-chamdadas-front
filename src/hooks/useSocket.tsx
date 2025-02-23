import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
//import { Attendance } from '../types/';
import { WS_URL } from '../config/api';

export const useSocket = (onCallPatient: (attendance: Attendance) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const socketInstance = io(WS_URL);

    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor');
      setConnectionStatus('connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do servidor');
      setConnectionStatus('disconnected');
    });

    socketInstance.on('callPatient', (data: Attendance) => {
      console.log('Recebido chamado:', data);      
      onCallPatient(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [onCallPatient]);

  return { socket, connectionStatus };
};