import React from "react";
import { Link } from "react-router-dom";

const Button = ({
  children,
  to,
  type = "button",
  onClick,
  fullWidth = false,
  isLoading = false,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  icon = null,
  iconPosition = "left",
  rounded = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm";

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 active:bg-gray-400",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    warning:
      "bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500 active:bg-amber-700",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800",
    ghost:
      "text-gray-700 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-gray-800",
    link: "text-blue-600 hover:underline focus:ring-blue-500 shadow-none",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled
    ? "opacity-60 cursor-not-allowed pointer-events-none"
    : "";
  const roundedClass = rounded ? "rounded-full" : "rounded-md";

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${roundedClass} ${className}`;

  const renderContent = () => (
    <>
      {isLoading ? (
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className={`${children ? "mr-2" : ""}`}>{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className={`${children ? "ml-2" : ""}`}>{icon}</span>
          )}
        </>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {renderContent()}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={isLoading || disabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
