export default function FormSelect({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  error, 
  placeholder = "Chọn...",
  required = false,
  disabled = false,
  ...rest 
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-slate-500 focus:border-transparent'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
