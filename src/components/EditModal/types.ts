export interface Option {
    value: string;
    label: string;
  }
  
  export interface Field<T = any> {
    name: keyof T;
    label: string;
    type: 'text' | 'number' | 'email' | 'select' | 'date' | 'password';
    value: string;
    formatter?: (value: string) => string;
    validator?: (value: string) => string | undefined;
    options?: Option[];
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    error?: string
  }
  
  export interface EditModalProps<T extends Record<string, any>> {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: T) => Promise<void>;
    title: string;
    fields: Field<T>[];
    data: T;
    submitLabel?: string;
    cancelLabel?: string;
    confirmBeforeClose?: boolean;
  }
  
  export type FormErrors<T> = Partial<Record<keyof T | 'submit', string>>;