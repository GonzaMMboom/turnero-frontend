import React from 'react';

/**
 * Componente Modal Genérico y Elegante
 * 
 * @param {Object} props
 * @param {boolean} props.show - Si se muestra el modal o no
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del cuerpo del modal
 * @param {Function} props.onConfirm - Acción al confirmar
 * @param {Function} props.onCancel - Acción al cancelar
 * @param {string} props.confirmText - Texto del botón de confirmación
 * @param {string} props.cancelText - Texto del botón de cancelación
 * @param {string} props.type - Tipo de modal (warning, error, success)
 */
export default function Modal({
  show,
  title,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  hideIcon = false
}) {
  if (!show) return null;

  const iconMap = {
    warning: 'warning',
    error: 'error',
    success: 'check_circle'
  };

  const colorMap = {
    warning: 'text-amber-500 bg-amber-50',
    error: 'text-red-500 bg-red-50',
    success: 'text-emerald-500 bg-emerald-50'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {!hideIcon && (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorMap[type]}`}>
                <span className="material-symbols-outlined text-2xl font-bold">
                  {iconMap[type]}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-xl font-headline font-bold text-gray-900 mb-2">{title}</h3>
              <div className="text-slate-500 font-body text-sm leading-relaxed">
                {children}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-6 rounded-xl font-headline font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10 ${
              type === 'warning' ? 'bg-indigo-600 hover:bg-indigo-700' : 
              type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmText}
          </button>
          
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 rounded-xl font-headline font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
