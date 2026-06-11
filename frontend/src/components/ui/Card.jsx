/**
 * Card — contenedor de tarjeta reutilizable
 *
 * @param {'default'|'hover'|'flat'} variant
 * @param {string} className
 * @param {function} onClick
 */
const Card = ({ children, variant = 'default', className = '', onClick, ...props }) => {
  const base = 'bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-200';

  const variants = {
    default: 'shadow-[var(--sombra-sm)] dark:shadow-black/20',
    hover:
      'shadow-[var(--sombra-sm)] dark:shadow-black/20 cursor-pointer hover:shadow-[var(--sombra-md)] hover:-translate-y-1',
    flat: 'border border-gray-100 dark:border-gray-700',
  };

  return (
    <div
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
