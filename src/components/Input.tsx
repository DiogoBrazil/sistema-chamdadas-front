import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      {...props}
    />
  </div>
);
