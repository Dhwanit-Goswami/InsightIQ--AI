import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-light-card dark:bg-dark-card
        border border-light-border dark:border-dark-border
        rounded-xl shadow-card dark:shadow-card-dark
        transition-colors duration-180
        ${padding ? 'p-4 sm:p-5' : ''}
        ${hover ? 'hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
