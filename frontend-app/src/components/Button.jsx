import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:from-purple-700 hover:to-indigo-800 focus:ring-purple-500 active:scale-95',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 active:scale-95',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 focus:ring-red-500 active:scale-95',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 active:scale-95',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:scale-95'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;