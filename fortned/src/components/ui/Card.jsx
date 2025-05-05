import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = "",
  variant = "default",
  hoverEffect = false,
  image = null,
  imageAlt = "",
  imageHeight = "h-48",
  onClick = null,
  headerActions = null,
}) => {
  // Card style variants
  const variantStyles = {
    default: "bg-white shadow-md hover:shadow-lg",
    bordered: "bg-white border border-gray-200 hover:border-gray-300",
    elevated: "bg-white shadow-lg hover:shadow-xl",
    flat: "bg-gray-50 border border-gray-100",
    colorful: "bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md",
  };

  // Hover effect for interactive cards
  const hoverStyles = hoverEffect
    ? "transition-transform duration-300 transform hover:-translate-y-1 cursor-pointer"
    : "";

  return (
    <div
      className={`rounded-xl overflow-hidden ${variantStyles[variant]} transition-all duration-200 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {/* Optional Card Image */}
      {image && (
        <div className={`w-full ${imageHeight} overflow-hidden`}>
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Card Header */}
      {(title || subtitle || headerActions) && (
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex justify-between items-center">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">{headerActions}</div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="px-5 py-4">{children}</div>

      {/* Card Footer */}
      {footer && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
