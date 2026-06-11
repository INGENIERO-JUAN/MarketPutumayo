import { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * Modal — diálogo reutilizable con overlay
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {React.ReactNode} children
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} hideFooter
 * @param {function} onConfirm
 * @param {string} confirmLabel
 * @param {boolean} confirmLoading
 * @param {'danger'|'primary'} confirmVariant
 */
const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideFooter = false,
  onConfirm,
  confirmLabel = 'Confirmar',
  confirmLoading = false,
  confirmVariant = 'primary',
}) => {
  const overlayRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`w-full ${SIZES[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-[var(--verde-oscuro)] dark:text-green-400 text-lg font-serif">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1 text-[var(--gris-texto)] dark:text-gray-300 text-sm leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            {onConfirm && (
              <Button variant={confirmVariant} onClick={onConfirm} loading={confirmLoading}>
                {confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
