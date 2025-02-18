// src/components/EditModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';

interface Option {
  value: string;
  label: string;
}

interface Field {
  name: string;
  label: string;
  type: string;
  value: string;
  formatter?: (value: string) => string;
  options?: Option[];
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
  title: string;
  fields: Field[];
  data: any;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  fields,
  data
}) => {
  const [formData, setFormData] = useState<any>(data);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onConfirm(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string, formatter?: (value: string) => string) => {
    const formattedValue = formatter ? formatter(value) : value;
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const renderField = (field: Field) => {
    if (field.type === 'select' && field.options) {
      return (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={field.name}>
        <Input
          label={field.label}
          type={field.type}
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value, field.formatter)}
          required
        />
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(renderField)}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};