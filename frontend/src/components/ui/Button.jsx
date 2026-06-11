/**
 * Button — componente de botón reutilizable con variantes y estados
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading
 * @param {boolean} fullWidth
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary:
      'bg-[var(--verde-oscuro)] text-white shadow-md hover:bg-[var(--verde-medio)] focus:ring-[var(--verde-claro)]',
    secondary:
      'bg-[var(--dorado)] text-white shadow-md hover:opacity-90 focus:ring-[var(--dorado)]',
    danger:
      'bg-red-600 text-white shadow-md hover:bg-red-700 focus:ring-red-400',
    ghost:
      'bg-transparent text-[var(--verde-oscuro)] dark:text-green-400 hover:bg-[var(--verde-suave)] dark:hover:bg-gray-800 focus:ring-[var(--verde-claro)]',
    outline:
      'bg-transparent border-2 border-[var(--verde-oscuro)] text-[var(--verde-oscuro)] dark:border-green-400 dark:text-green-400 hover:bg-[var(--verde-suave)] dark:hover:bg-gray-800 focus:ring-[var(--verde-claro)]',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
