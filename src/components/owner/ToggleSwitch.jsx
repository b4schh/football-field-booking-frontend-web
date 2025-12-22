/**
 * Toggle Switch component
 * Dùng để bật/tắt isActive cho Complex, Field, TimeSlot
 */
export default function ToggleSwitch({ enabled, onChange, label, disabled = false }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
          enabled ? "bg-green-600" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && (
        <span className={`text-sm font-medium ${enabled ? "text-green-600" : "text-gray-500"}`}>
          {label}
        </span>
      )}
    </div>
  );
}
