import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="p-4 border-b">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className="p-4">{children}</div>
      
      {footer && (
        <div className="p-4 bg-gray-50 border-t">{footer}</div>
      )}
    </div>
  );
};

export default Card;
