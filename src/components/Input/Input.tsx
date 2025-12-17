import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};
