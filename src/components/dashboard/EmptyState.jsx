export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="text-4xl text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      {message && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
          {message}
        </p>
      )}

      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}
