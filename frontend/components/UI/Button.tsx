import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
  onClick,
  type,
  ...rest
}) => {
  const baseClasses = 'glass-button font-semibold transition-all duration-300';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-500',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <motion.button
      type={(type as 'button' | 'submit' | 'reset') || 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
