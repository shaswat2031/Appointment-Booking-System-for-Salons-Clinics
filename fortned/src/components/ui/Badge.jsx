import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  rounded = "default",
  icon = null,
  className = "",
}) => {
  // Variant styles with proper color combinations
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-purple-100 text-purple-800",
    success: "bg-green-100 text-green-800",
    danger: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-cyan-100 text-cyan-800",
    light: "bg-gray-50 text-gray-600 border border-gray-200",
    dark: "bg-gray-700 text-gray-100",
    outline: "bg-transparent border",
  };

  // Outline variant border colors
  const outlineBorderColors = {
    default: "border-gray-400 text-gray-700",
    primary: "border-blue-500 text-blue-700",
    secondary: "border-purple-500 text-purple-700",
    success: "border-green-500 text-green-700",
    danger: "border-red-500 text-red-700",
    warning: "border-yellow-500 text-yellow-700",
    info: "border-cyan-500 text-cyan-700",
  };

  // Size styles
  const sizeStyles = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  // Border radius styles
  const roundedStyles = {
    none: "rounded-none",
    default: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  // Determine final class names
  const baseClasses = "inline-flex items-center justify-center font-medium";
  const variantClass =
    variant === "outline"
      ? `${variantStyles.outline} ${
          outlineBorderColors[variant === "outline" ? "default" : variant]
        }`
      : variantStyles[variant];

  return (
    <span
      className={`
      ${baseClasses}
      ${variantClass}
      ${sizeStyles[size]}
      ${roundedStyles[rounded]}
      ${className}
    `}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
