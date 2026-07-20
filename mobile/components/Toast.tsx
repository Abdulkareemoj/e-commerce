import { toast as sonnerToast } from '@/sonner';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

function mapVariant(variant?: ToastVariant) {
  switch (variant) {
    case 'success':
      return sonnerToast.success;
    case 'destructive':
      return sonnerToast.error;
    case 'warning':
      return sonnerToast.warning;
    default:
      return sonnerToast;
  }
}

export function useToast() {
  return {
    toast: (options: ToastOptions) => {
      const fn = mapVariant(options.variant);
      fn(options.title, {
        description: options.description,
        duration: options.duration ?? 4000,
      });
    },
  };
}
