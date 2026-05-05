import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        className: 'dark:bg-neutral-900 dark:text-neutral-100 dark:border dark:border-neutral-800',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#171717', // text-neutral-900
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          borderRadius: '12px',
          padding: '16px',
          fontWeight: 500,
          border: '1px solid #e5e5e5', // text-neutral-200
        },
        success: {
          iconTheme: {
            primary: '#10b981', // emerald-500
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
