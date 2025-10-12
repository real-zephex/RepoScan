"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, description?: string, duration?: number) => void;
  showError: (
    title: string,
    description?: string,
    persistent?: boolean
  ) => void;
  showWarning: (title: string, description?: string, duration?: number) => void;
  showInfo: (title: string, description?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-600" />;
    default:
      return null;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "info":
      return "border-blue-200 bg-blue-50 text-blue-800";
    default:
      return "";
  }
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.persistent ? undefined : 3000),
    };  

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration (if not persistent)
    if (!toast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ type: "success", title, description, duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, description?: string, persistent?: boolean) => {
      addToast({ type: "error", title, description, persistent });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ type: "warning", title, description, duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ type: "info", title, description, duration });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          className={`relative transition-all duration-300 ease-in-out transform ${getToastStyles(
            toast.type
          )} shadow-lg border`}
        >
          {getToastIcon(toast.type)}
          <div className="flex-1">
            <AlertTitle className="flex items-center justify-between">
              {toast.title}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => onRemove(toast.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertTitle>
            {toast.description && (
              <AlertDescription>{toast.description}</AlertDescription>
            )}
          </div>
        </Alert>
      ))}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
