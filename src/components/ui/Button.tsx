import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ loading, children, ...props }) => (
  <button
    className="w-full py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? 'Entrando...' : children}
  </button>
);
