import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import CommonErrorDialog, { DialogVariant } from '../components/common/CommonErrorDialog';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface DialogState {
  open: boolean;
  title?: string;
  message: string;
  variant: DialogVariant;
}

export interface NotificationContextType {
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  enqueueSnackbar: (message: string, options?: { variant?: 'error' | 'warning' | 'success' | 'info' }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Backward-compatible hook for useSnackbar
export const useSnackbar = () => {
  return useNotification();
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    title: '',
    message: '',
    variant: 'error',
  });

  const showError = useCallback((message: string, title?: string) => {
    setDialog({
      open: true,
      title: title || 'Thông báo lỗi',
      message,
      variant: 'error',
    });
  }, []);

  const showWarning = useCallback((message: string, title?: string) => {
    setDialog({
      open: true,
      title: title || 'Cảnh báo',
      message,
      variant: 'warning',
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    setToast({
      open: true,
      message: title ? `${title}: ${message}` : message,
      severity: 'success',
    });
  }, []);

  const showInfo = useCallback((message: string, title?: string) => {
    setToast({
      open: true,
      message: title ? `${title}: ${message}` : message,
      severity: 'info',
    });
  }, []);

  const enqueueSnackbar = useCallback((message: string, options?: { variant?: 'error' | 'warning' | 'success' | 'info' }) => {
    const variant = options?.variant || 'info';
    if (variant === 'error') {
      showError(message);
    } else if (variant === 'warning') {
      showWarning(message);
    } else {
      setToast({
        open: true,
        message,
        severity: variant as AlertColor,
      });
    }
  }, [showError, showWarning]);

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleCloseDialog = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider
      value={{
        showError,
        showWarning,
        showSuccess,
        showInfo,
        enqueueSnackbar,
      }}
    >
      {children}

      {/* Common Error / Warning Dialog Popup */}
      <CommonErrorDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        variant={dialog.variant}
        onClose={handleCloseDialog}
      />

      {/* Snackbar Toast for Success & Info notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 7 }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3, fontWeight: 500 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
