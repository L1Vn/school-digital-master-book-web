// Komponen TextArea reusable untuk input teks multi-baris

export default function TextArea({ 
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  ...props 
}) {
  const textareaId = `textarea-${name}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-danger-500' : 'border-gray-300'}
          transition-colors duration-200
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
