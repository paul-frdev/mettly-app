import { toast } from 'sonner';

// Success notifications
export const showSuccess = (message: string) => {
  toast.success(message);
};

// Error notifications
export const showError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  toast.error(errorMessage);
  // Still log to console for debugging
  console.error(error);
};

// Info notifications
export const showInfo = (message: string) => {
  toast.info(message);
};

// Warning notifications
export const showWarning = (message: string) => {
  toast.warning(message);
};

// Promise notifications
export const showPromise = async <T>(
  promise: Promise<T>,
  {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong',
  }: {
    loading?: string;
    success?: string;
    error?: string;
  } = {}
) => {
  return toast.promise(promise, {
    loading,
    success,
    error: (err) => (err instanceof Error ? err.message : error),
  });
};
