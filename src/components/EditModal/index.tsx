import { EditModalProps } from './types';
import { useEditModal } from './useEditModal';
import { Field } from './Field';
import { ConfirmModal } from './ConfirmModal';

export function EditModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  onConfirm,
  title,
  fields,
  data,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  confirmBeforeClose = true,
}: EditModalProps<T>) {
  const {
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
  } = useEditModal({
    data,
    fields,
    onConfirm,
    onClose,
    confirmBeforeClose
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative z-50 w-full max-w-lg bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              {fields.map(field => (
                <Field
                  key={String(field.name)}
                  field={field}
                  value={formData[field.name] as string}
                  error={errors[field.name]}
                  loading={loading}
                  onChange={handleChange}
                />
              ))}
            </div>

            {errors.submit && (
              <p className="mt-4 text-red-500 text-sm">{errors.submit}</p>
            )}

            {/* Footer */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={loading || !isDirty}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center space-x-1">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processando...</span>
                  </span>
                ) : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmClose}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Descartar alterações"
        message="Você tem alterações não salvas. Deseja realmente descartar as alterações?"
        confirmLabel="Descartar"
        cancelLabel="Cancelar"
      />
    </>
  );
}

export * from './types';