export default function CardStat({ icon: Icon, title, value, subtitle, color = "slate" }) {
  const colorClasses = {
    slate: "bg-slate-100 text-slate-800",
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        
        {Icon && (
          <div className={`w-14 h-14 rounded-full ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
            <Icon className="text-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}
