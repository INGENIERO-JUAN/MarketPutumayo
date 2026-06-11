import { forwardRef, useState } from 'react';

/**
 * Input — campo de texto reutilizable
 *
 * @param {string} label
 * @param {string} error
 * @param {string} hint
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {boolean} password - activa toggle mostrar/ocultar
 */
const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, rightIcon, password = false, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);
  const type = password ? (show ? 'text' : 'password') : props.type || 'text';

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-[var(--verde-oscuro)] dark:text-green-400 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 border-2 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 text-[var(--negro-suave)] transition-all duration-200 outline-none
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || password ? 'pr-10' : ''}
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900'
              : 'border-gray-200 focus:border-[var(--verde-claro)] focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900'}
            ${className}`}
          {...props}
        />
        {password && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
            tabIndex={-1}
          >
            {show ? '🙈' : '👁️'}
          </button>
        )}
        {!password && rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
});

export default Input;
