import React, { useState } from "react";

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  error,
  required = false,
  className = "",
  variant = "default",
  size = "md",
  disabled = false,
  fullWidth = true,
  icon = null,
  hint = "",
  onBlur = null,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Size variants
  const sizeClasses = {
    sm: "py-1 px-2 text-sm",
    md: "py-2 px-3",
    lg: "py-3 px-4 text-lg",
  };

  // Style variants
  const variantClasses = {
    default: `border ${
      error
        ? "border-red-500"
        : isFocused
        ? "border-blue-500"
        : "border-gray-300"
    }`,
    filled: `${
      error
        ? "bg-red-50 border-red-500"
        : isFocused
        ? "bg-blue-50 border-blue-500"
        : "bg-gray-100 border-gray-300"
    } border`,
    flushed: `border-0 border-b-2 rounded-none px-0 ${
      error
        ? "border-red-500"
        : isFocused
        ? "border-blue-500"
        : "border-gray-300"
    }`,
    outline: `bg-transparent border-2 ${
      error
        ? "border-red-500"
        : isFocused
        ? "border-blue-500"
        : "border-gray-300"
    }`,
  };

  // Icon styles
  const iconClasses =
    "absolute top-1/2 transform -translate-y-1/2 text-gray-500 left-3";
  const chevronIconClasses =
    "absolute top-1/2 transform -translate-y-1/2 right-3 pointer-events-none text-gray-500";

  return (
    <div className={`${className} ${fullWidth ? "w-full" : "inline-block"}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${
            error ? "text-red-600" : "text-gray-700"
          } mb-1`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        {/* Custom Icon */}
        {icon && <div className={iconClasses}>{icon}</div>}

        {/* Select Field */}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          className={`
            appearance-none rounded-md w-full transition-all duration-200
            ${variantClasses[variant]} ${sizeClasses[size]}
            ${icon ? "pl-10" : ""}
            ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
            focus:ring-2 focus:ring-opacity-50 ${
              error ? "focus:ring-red-500" : "focus:ring-blue-500"
            }
            focus:outline-none
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>

        {/* Chevron Icon */}
        <div className={chevronIconClasses}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a 1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Hint Text */}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
};

export default Select;
