/**
 * Spinner — indicador de carga
 *
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {string} color - clase de Tailwind para color (ej: 'text-white')
 * @param {string} label - texto accesible
 */
const SIZES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
  xl: 'w-14 h-14 border-4',
};

const Spinner = ({ size = 'md', color = 'text-[var(--verde-oscuro)]', label = 'Cargando...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-label={label}>
      <div
        className={`${SIZES[size]} ${color} rounded-full border-current border-t-transparent animate-spin`}
        style={{ borderTopColor: 'transparent' }}
      />
      {(size === 'lg' || size === 'xl') && (
        <span className="text-sm text-[var(--gris-texto)] dark:text-gray-400">{label}</span>
      )}
    </div>
  );
};

export default Spinner;
