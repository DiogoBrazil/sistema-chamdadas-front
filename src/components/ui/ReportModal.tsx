// sistema-chamadas-react/src/components/ui/ReportModal.tsx

import React, { useState } from 'react';
import { Modal } from '../Modal';
import { getAttendanceReport } from '../../services/reportService';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: number;
  professionalName?: string;
}

interface AttendanceReport {
  count: number;
  attendances: {
    id: number;
    patientId: number;
    status: string;
    createdAt: string;
    finishedAt: string;
    professionalId: number;
    officeNumber: number;
    patient?: {
      fullName: string;
      cpf: string;
    };
  }[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  professionalId,
  professionalName
}) => {
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState<string>('23:59');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'form' | 'results'>('form');

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      const reportData = await getAttendanceReport(
        token,
        professionalId,
        startDate,
        startTime,
        endDate,
        endTime
      );
      
      setReport(reportData.data);
      setViewMode('results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'bottom-right',
        style: { background: 'red', color: 'white' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setViewMode('form');
  };

  const handleClose = () => {
    setReport(null);
    setViewMode('form');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Relatório de Atendimentos ${professionalName ? `- Dr(a). ${professionalName}` : ''}`}
    >
      {viewMode === 'form' ? (
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data Inicial
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora Inicial
              </label>
              <input
                type="time"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data Final
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora Final
              </label>
              <input
                type="time"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Período: {formatDate(startDate)} {startTime} - {formatDate(endDate)} {endTime}
            </h3>
            <p className="text-gray-600">
              Total de atendimentos: {report?.count || 0}
            </p>
          </div>

          {report && report.attendances.length > 0 ? (
            <div className="max-h-96 overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Consultório
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.attendances.map((attendance) => {
                    const finishedDate = new Date(attendance.finishedAt);
                    return (
                      <tr key={attendance.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attendance.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {finishedDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {finishedDate.toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {attendance.officeNumber}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Nenhum atendimento encontrado no período selecionado.
            </p>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={handleBackToForm}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};