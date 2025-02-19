import { Field as FieldType } from './types';

interface FieldProps<T> {
  field: FieldType<T>;
  value: string;
  error?: string;
  loading: boolean;
  onChange: (field: FieldType<T>, value: string) => void;
}

export function Field<T>({ field, value, error, loading, onChange }: FieldProps<T>) {
  const commonProps = {
    id: `field-${String(field.name)}`,
    'aria-label': field.label,
    disabled: loading || field.disabled,
    required: field.required,
    placeholder: field.placeholder,
    'aria-invalid': !!error,
    'aria-errormessage': error ? `error-${String(field.name)}` : undefined,
    className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
      error 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 focus:border-blue-500'
    }`
  };

  return (
    <div className="space-y-1">
      <label 
        htmlFor={`field-${String(field.name)}`}
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === 'select' && field.options ? (
        <select
          {...commonProps}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        >
          {field.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...commonProps}
          type={field.type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      )}

      {error && (
        <p 
          id={`error-${String(field.name)}`}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </p>
      )}
    </div>
  );
}