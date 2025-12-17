import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
