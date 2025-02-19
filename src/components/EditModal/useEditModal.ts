import { useState, useEffect, useCallback } from 'react';
import { Field, FormErrors } from './types';

interface UseEditModalProps<T> {
  data: T;
  fields: Field<T>[];
  onConfirm: (data: T) => Promise<void>;
  onClose: () => void;
  confirmBeforeClose?: boolean;
}

export function useEditModal<T extends Record<string, any>>({
  data,
  fields,
  onConfirm,
  onClose,
  confirmBeforeClose = true
}: UseEditModalProps<T>) {
  const [formData, setFormData] = useState<T>(data);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  useEffect(() => {
    setFormData(data);
    setErrors({});
    setIsDirty(false);
  }, [data]);

  const validateField = useCallback((field: Field<T>, value: string) => {
    if (field.required && !value) {
      return `${field.label} é obrigatório`;
    }
    if (field.validator) {
      return field.validator(value);
    }
    return undefined;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name] as string);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, formData, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onConfirm(formData);
      setIsDirty(false);
      onClose();
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        submit: err instanceof Error ? err.message : 'Erro ao atualizar dados'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: Field<T>, value: string) => {
    const formattedValue = field.formatter ? field.formatter(value) : value;
    setFormData(prev => ({ ...prev, [field.name]: formattedValue }));
    setIsDirty(true);

    if (errors[field.name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.name];
        return newErrors;
      });
    }
  };

  const handleClose = () => {
    if (!isDirty || !confirmBeforeClose) {
      onClose();
      return;
    }

    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  return {
    formData,
    errors,
    loading,
    isDirty,
    showConfirmClose,
    handleSubmit,
    handleChange,
    handleClose,
    handleConfirmClose,
    handleCancelClose
  };
}