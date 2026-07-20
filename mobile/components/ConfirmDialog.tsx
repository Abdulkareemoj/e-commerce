import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
}

const ConfirmDialogContext = React.createContext<{
  confirm: (options: ConfirmOptions) => void;
}>({ confirm: () => {} });

export function useConfirmDialog() {
  return React.useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setState({ ...options, open: true });
  }, []);

  const handleConfirm = React.useCallback(async () => {
    await state.onConfirm();
    setState((prev) => ({ ...prev, open: false }));
  }, [state.onConfirm]);

  const handleCancel = React.useCallback(() => {
    state.onCancel?.();
    setState((prev) => ({ ...prev, open: false }));
  }, [state.onCancel]);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={handleCancel}>
              {state.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={handleConfirm}
              className={state.destructive ? 'bg-destructive' : ''}>
              {state.confirmText || 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}
