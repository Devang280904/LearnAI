import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 hover:shadow-primary/40',
  secondary: 'bg-secondary hover:bg-secondary-dark text-white shadow-lg shadow-secondary/25 hover:shadow-secondary/40',
  accent: 'bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/25 hover:shadow-accent/40',
  success: 'bg-success hover:bg-success/80 text-white shadow-lg shadow-success/25',
  danger: 'bg-danger hover:bg-danger/80 text-white shadow-lg shadow-danger/25',
  outline: 'border border-slate-200 hover:border-primary text-slate-500 hover:text-primary bg-transparent hover:bg-primary/10',
  ghost: 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-transparent',
  glass: 'glass text-slate-900 hover:bg-slate-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
  xl: 'px-9 py-4 text-lg rounded-2xl',
  icon: 'p-2.5 rounded-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
