import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2" aria-live="polite">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-xs animate-fade-in ${
          t.type === 'success' ? 'bg-success' : 'bg-danger'
        }`}
      >
        {t.message}
      </div>
    ))}
  </div>
);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans ToastProvider');
  return ctx;
};
