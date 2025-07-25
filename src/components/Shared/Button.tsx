// components/Shared/Button.tsx
import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Omit conflicting props from HTMLMotionProps
type MotionButtonProps = Omit<HTMLMotionProps<"button">, keyof ButtonProps | 'onDrag' | 'onDragStart' | 'onDragEnd'>;

type CombinedButtonProps = ButtonProps & MotionButtonProps;

export const Button: React.FC<CombinedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...motionProps
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white';
      case 'secondary':
        return 'bg-slate-700 hover:bg-slate-600 text-white';
      case 'outline':
        return 'border border-slate-600 hover:bg-slate-700 text-white';
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white';
      default:
        return 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  // ✅ Determine if button should be disabled (either explicitly disabled or loading)
  const isDisabled = disabled || loading;

  const baseStyles = 'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

  return (
    <motion.button
      type={type}
      disabled={isDisabled} // ✅ Use combined disabled state
      onClick={onClick}
      className={`${baseStyles} ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }} // ✅ No hover effect when loading
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}   // ✅ No tap effect when loading
      transition={{ duration: 0.1 }}
      {...motionProps}
    >
      {loading ? (
        // ✅ Show loading spinner when loading
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children // ✅ Show normal content when not loading
      )}
    </motion.button>
  );
};
