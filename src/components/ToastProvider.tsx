import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, string> = {
  success: "border-[#b7ff4a] bg-black text-white",
  error: "border-red-400 bg-black text-white",
  info: "border-white/20 bg-black text-white",
};

const toastIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="text-[#b7ff4a]" size={20} />,
  error: <XCircle className="text-red-400" size={20} />,
  info: <Info className="text-[#b7ff4a]" size={20} />,
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now() + Math.random();

      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  const value = {
    success: (message: string) => pushToast("success", message),
    error: (message: string) => pushToast("error", message),
    info: (message: string) => pushToast("info", message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-md border px-4 py-3 shadow-xl ${toastStyles[toast.type]}`}
          >
            <div className="mt-0.5 shrink-0">{toastIcons[toast.type]}</div>
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
