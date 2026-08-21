import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toast({ message, type = 'success', isVisible, onClose, duration = 4000 }: ToastProps) {
  const [show, setShow] = useState(false);
  const Icon = icons[type];

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 200);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-300 bg-white text-black shadow-xl',
        'transition-all duration-200',
        show ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      )}
      role="alert"
    >
      <Icon className="h-5 w-5 shrink-0 text-black" />
      <p className="text-sm font-semibold text-black">{message}</p>
      <button onClick={() => { setShow(false); setTimeout(onClose, 200); }} className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-black cursor-pointer">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
