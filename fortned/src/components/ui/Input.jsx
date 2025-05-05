import React, { useState } from "react";

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  className = "",
  variant = "default",
  icon = null,
  iconPosition = "left",
  hint = "",
  disabled = false,
  maxLength = null,
  autoFocus = false,
  fullWidth = true,
  size = "md",
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

  const iconClasses =
    "absolute top-1/2 transform -translate-y-1/2 text-gray-500";
  const leftIconClasses = `${iconClasses} left-3`;
  const rightIconClasses = `${iconClasses} right-3`;

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

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === "left" && (
          <div className={leftIconClasses}>{icon}</div>
        )}

        {/* Input Field */}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          className={`
            rounded-md w-full transition-all duration-200
            ${variantClasses[variant]} ${sizeClasses[size]}
            ${icon && iconPosition === "left" ? "pl-10" : ""}
            ${icon && iconPosition === "right" ? "pr-10" : ""}
            ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
            focus:ring-2 focus:ring-opacity-50 ${
              error ? "focus:ring-red-500" : "focus:ring-blue-500"
            }
            focus:outline-none
          `}
        />

        {/* Right Icon */}
        {icon && iconPosition === "right" && (
          <div className={rightIconClasses}>{icon}</div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Hint Text */}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}

      {/* Character Count for inputs with maxLength */}
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default Input;
