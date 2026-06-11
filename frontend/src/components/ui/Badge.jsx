/**
 * Badge — etiqueta de estado / categoría
 *
 * @param {'green'|'yellow'|'red'|'blue'|'purple'|'gray'} color
 * @param {'sm'|'md'} size
 */
const COLORS = {
  green: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  gold: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
};

const ESTADO_COLOR = {
  PENDIENTE: 'yellow',
  PAGADO: 'blue',
  ENVIADO: 'purple',
  ENTREGADO: 'green',
  CANCELADO: 'red',
  COMPRADOR: 'blue',
  PRODUCTOR: 'green',
  ADMIN: 'red',
  APROBADO: 'green',
  RECHAZADO: 'red',
  AGOTADO: 'gray',
};

const Badge = ({ children, color, estado, size = 'md', dot = false, className = '' }) => {
  const resolvedColor = color || ESTADO_COLOR[estado] || 'gray';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeClass} ${COLORS[resolvedColor]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${resolvedColor === 'green' ? 'bg-green-500' : resolvedColor === 'yellow' ? 'bg-yellow-500' : resolvedColor === 'red' ? 'bg-red-500' : resolvedColor === 'blue' ? 'bg-blue-500' : 'bg-gray-500'}`}
        />
      )}
      {children || estado}
    </span>
  );
};

export default Badge;
