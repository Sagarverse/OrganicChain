import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
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
  const baseClasses = `btn-${variant} font-semibold transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={(type as 'button' | 'submit' | 'reset') || 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${widthClass} ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

export default Button;
