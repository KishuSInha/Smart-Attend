import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X, Info } from "lucide-react";

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, type, title, message, duration = 4000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto close
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-accent/10 border-accent/30';
      case 'error':
        return 'bg-destructive/10 border-destructive/30';
      case 'warning':
        return 'bg-warning/10 border-warning/30';
      case 'info':
      default:
        return 'bg-primary/10 border-primary/30';
    }
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 max-w-sm w-full mx-auto p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${getBackgroundColor()}
        transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-background/20 rounded transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Toast;