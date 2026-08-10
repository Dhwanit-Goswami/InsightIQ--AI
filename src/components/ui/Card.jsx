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
        rounded-2xl shadow-card dark:shadow-card-dark
        transition-all duration-200
        ${padding ? 'p-5' : ''}
        ${hover ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-card-md dark:hover:shadow-card-md-dark cursor-pointer' : ''}
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
