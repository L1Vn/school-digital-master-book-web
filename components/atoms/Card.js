// Komponen Card reusable untuk container styling yang konsisten

export default function Card({ 
  children, 
  title,
  subtitle,
  actions,
  padding = 'normal',
  className = '',
  ...props 
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    normal: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-soft hover:shadow-soft-lg transition-shadow duration-200 ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
