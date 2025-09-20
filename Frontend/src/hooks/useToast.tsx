import { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastProps } from "../components/Toast";

interface ToastContextType {
  showToast: (type: ToastProps['type'], title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastData extends Omit<ToastProps, 'onClose'> {
  id: string;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (
    type: ToastProps['type'], 
    title: string, 
    message?: string, 
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
};