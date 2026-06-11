/**
 * Alert — mensaje de feedback inline
 *
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {string} message
 * @param {function} onClose
 */
const TYPES = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-300',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-300',
    icon: '⚠️',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: '⚡',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-300',
    icon: 'ℹ️',
  },
};

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;
  const t = TYPES[type];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${t.bg} ${t.text} ${className}`}
      role="alert"
    >
      <span className="text-base leading-none mt-0.5">{t.icon}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-current opacity-60 hover:opacity-100 cursor-pointer leading-none"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
