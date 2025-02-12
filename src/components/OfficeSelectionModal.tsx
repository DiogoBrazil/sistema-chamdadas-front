import React, { useState } from 'react';
import { Modal } from './Modal';

interface OfficeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (office: number) => Promise<void>;
  professionalId: number;
}

export const OfficeSelectionModal: React.FC<OfficeSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm  
}) => {
  const [office, setOffice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!office || parseInt(office) <= 0) {
      setError('Por favor, informe um número de consultório válido');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(parseInt(office));
      setOffice('');
      onClose();
    } catch (err) {
      setError('Erro ao definir consultório');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Consultório"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Número do Consultório
          </label>
          <input
            type="number"
            min="1"
            value={office}
            onChange={(e) => setOffice(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Digite o número do consultório"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onClose}
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
            {loading ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};