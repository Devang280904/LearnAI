import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  gradient,
  glass = false,
  padding = 'p-6',
  onClick,
  ...props
}) => {
  const baseStyles = glass
    ? 'glass rounded-2xl'
    : 'bg-white border border-slate-200 rounded-2xl';

  const hoverStyles = hover
    ? 'hover:border-slate-300 hover:shadow-lg hover:shadow-primary/5'
    : '';

  return (
    <motion.div
      className={`
        ${baseStyles}
        ${hoverStyles}
        ${padding}
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover && onClick ? { y: -2 } : {}}
      onClick={onClick}
      {...props}
    >
      {gradient && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${gradient}`}
        />
      )}
      {children}
    </motion.div>
  );
};

export default Card;
