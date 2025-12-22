import { MdChevronRight } from "react-icons/md";
import { Link } from "react-router-dom";

export default function PageHeader({ title, breadcrumbs, actions }) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.path ? (
                <Link 
                  to={crumb.path}
                  className="hover:text-slate-800 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? "text-gray-900 font-medium" : ""}>
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && (
                <MdChevronRight className="text-gray-400" />
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
