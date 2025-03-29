import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CyberButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const CyberButton = ({ 
  children, 
  icon, 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  className = '', 
  ...props 
}: CyberButtonProps) => {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'border-cyber-green hover:border-cyber-green/70 text-cyber-green hover:text-cyber-green/90 hover:bg-cyber-green/10';
      case 'secondary':
        return 'border-cyber-pink hover:border-cyber-pink/70 text-cyber-pink hover:text-cyber-pink/90 hover:bg-cyber-pink/10';
      case 'accent':
        return 'border-cyber-blue hover:border-cyber-blue/70 text-cyber-blue hover:text-cyber-blue/90 hover:bg-cyber-blue/10';
      case 'outline':
        return 'border-white/30 hover:border-white/50 text-white/80 hover:text-white hover:bg-white/5';
      default:
        return 'border-cyber-green hover:border-cyber-green/70 text-cyber-green hover:text-cyber-green/90 hover:bg-cyber-green/10';
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'px-4 py-1 text-sm';
      case 'md': return 'px-6 py-2';
      case 'lg': return 'px-8 py-3 text-lg';
      default: return 'px-6 py-2';
    }
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading || props.disabled}
      className={`cyber-button ${getVariantClass()} ${getSizeClass()} ${className} flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default CyberButton; 