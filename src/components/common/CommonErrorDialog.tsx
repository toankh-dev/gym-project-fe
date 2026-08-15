import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import {
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutline as SuccessIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export type DialogVariant = 'error' | 'warning' | 'success' | 'info';

export interface CommonErrorDialogProps {
  open: boolean;
  title?: string;
  message: string;
  variant?: DialogVariant;
  onClose: () => void;
}

export const CommonErrorDialog: React.FC<CommonErrorDialogProps> = ({
  open,
  title,
  message,
  variant = 'error',
  onClose,
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <WarningIcon sx={{ fontSize: 36, color: 'warning.main' }} />,
          bg: 'rgba(237, 108, 2, 0.1)',
          defaultTitle: 'Cảnh báo',
          buttonColor: 'warning' as const,
        };
      case 'success':
        return {
          icon: <SuccessIcon sx={{ fontSize: 36, color: 'success.main' }} />,
          bg: 'rgba(46, 125, 50, 0.1)',
          defaultTitle: 'Thành công',
          buttonColor: 'success' as const,
        };
      case 'info':
        return {
          icon: <InfoIcon sx={{ fontSize: 36, color: 'info.main' }} />,
          bg: 'rgba(2, 136, 209, 0.1)',
          defaultTitle: 'Thông báo',
          buttonColor: 'info' as const,
        };
      case 'error':
      default:
        return {
          icon: <ErrorIcon sx={{ fontSize: 36, color: 'error.main' }} />,
          bg: 'rgba(211, 47, 47, 0.1)',
          defaultTitle: 'Thông báo lỗi',
          buttonColor: 'error' as const,
        };
    }
  };

  const config = getVariantConfig();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          zIndex: 1400, // Higher than regular Material-UI dialogs (1300)
        },
      }}
      sx={{
        zIndex: 1400,
      }}
    >
      <DialogTitle sx={{ pt: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: config.bg,
              width: 52,
              height: 52,
            }}
          >
            {config.icon}
          </Avatar>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {title || config.defaultTitle}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, mt: 1 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color={config.buttonColor}
          fullWidth
          size="large"
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            py: 1,
          }}
        >
          Đã hiểu (Close)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommonErrorDialog;
