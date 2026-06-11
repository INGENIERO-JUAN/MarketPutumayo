/**
 * Tooltip — muestra un texto informativo al hacer hover
 *
 * @param {React.ReactNode} children - el elemento que dispara el tooltip
 * @param {string} text - texto del tooltip
 * @param {'top'|'bottom'|'left'|'right'} position
 * @param {'dark'|'light'} theme
 */
const POSITIONS = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800',
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800',
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800',
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800',
  },
};

const Tooltip = ({ children, text, position = 'top', className = '' }) => {
  if (!text) return children;

  return (
    <div className={`relative group inline-flex ${className}`}>
      {children}
      <span
        className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg whitespace-nowrap opacity-0 pointer-events-none
          group-hover:opacity-100 transition-opacity duration-200
          ${POSITIONS[position].tooltip}`}
      >
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
