// src/components/Toasts.jsx
import React, { useState, useCallback, useEffect } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((text, { duration = 4500, type = "info" } = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const ToastContainer = (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 px-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="max-w-xs w-full break-words bg-white border shadow-md rounded-lg p-3 text-sm text-gray-800 ring-1 ring-gray-200"
          role="status"
        >
          {t.text}
        </div>
      ))}
    </div>
  );

  return { addToast, removeToast, ToastContainer };
}
