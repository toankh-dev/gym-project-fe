import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
} from '@mui/material';
import PaymentHistoryPanel from './PaymentHistoryPanel';
import {
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Upgrade as UpgradeIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { subscriptionApi, packageApi } from '../../services/api.service';
import { useSnackbar } from '../../contexts/NotificationContext';
import { getApiErrorMessage } from '../../utils/errorHandler';

interface Subscription {
  id: number;
  packageId: number;
  startDate: string;
  endDate: string;
  actualPrice: number;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  daysRemaining?: number;
  isExpired?: boolean;
  package: {
    id: number;
    name: string;
    durationMonths: number;
    price: number;
    description?: string;
    benefits?: string;
    maxSessions?: number;
    allowTrainer: boolean;
  };
}

interface Package {
  id: number;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  benefits?: string;
  maxSessions?: number;
  allowTrainer: boolean;
  status: string;
}

const MemberSubscription: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [renewLoading, setRenewLoading] = useState(false);
  const [payingLoading, setPayingLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadSubscriptionData();
    loadPackages();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const currentResponse = await subscriptionApi.getCurrentMemberSubscription() as any;
      if (currentResponse.success) {
        const subData = currentResponse.data?.subscription ?? currentResponse.data;
        setCurrentSubscription(subData as Subscription);
      }
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      if (error?.response?.status !== 404) {
        enqueueSnackbar('Không thể tải thông tin subscription', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async () => {
    if (!currentSubscription) return;
    try {
      setPayingLoading(true);
      const res = await subscriptionApi.paySubscription(currentSubscription.id, { paymentMethod }) as any;
      if (res.success) {
        enqueueSnackbar('Thanh toán thành công! Gói tập của bạn đã được kích hoạt.', { variant: 'success' });
        setPayDialogOpen(false);
        loadSubscriptionData();
      }
    } catch (err: any) {
      console.error('Error paying subscription:', err);
      enqueueSnackbar(getApiErrorMessage(err, 'Thanh toán thất bại'), { variant: 'error' });
    } finally {
      setPayingLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await packageApi.getActivePackages();
      if (response.success) {
        const d = response.data as any;
        setPackages((Array.isArray(d) ? d : (d?.packages || [])) as Package[]);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      enqueueSnackbar('Không thể tải danh sách gói tập', { variant: 'error' });
    }
  };

  const handleRenewSubscription = async () => {
    if (!currentSubscription || !selectedPackage) return;

    try {
      setRenewLoading(true);
      const response = await subscriptionApi.renewSubscription(currentSubscription.id, {
        packageId: selectedPackage,
        paymentMethod: 'CASH' // Mock payment method
      });

      if (response.success) {
        enqueueSnackbar('Gia hạn subscription thành công!', { variant: 'success' });
        setRenewDialogOpen(false);
        setSelectedPackage(null);
        loadSubscriptionData(); // Reload data
      }
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      enqueueSnackbar(
        getApiErrorMessage(error, 'Không thể gia hạn subscription'),
        { variant: 'error' }
      );
    } finally {
      setRenewLoading(false);
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING': return 'warning';
      case 'EXPIRED':
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircleIcon />;
      case 'PENDING': return <WarningIcon />;
      default: return <CancelIcon />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý gói tập và thanh toán của bạn
        </Typography>
      </Box>

      {/* Current Subscription Card */}
      {currentSubscription ? (
        <>
          {currentSubscription.status === 'PENDING' && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              ⚠️ Bạn có 1 gói tập chưa được thanh toán (Trạng thái: <strong>CHƯA THANH TOÁN</strong>). Vui lòng hoàn tất thanh toán để kích hoạt gói tập và sử dụng dịch vụ.
            </Alert>
          )}

          <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h5">{currentSubscription.package.name}</Typography>
                    <Chip
                      icon={getStatusIcon(currentSubscription.status)}
                      label={currentSubscription.status === 'PENDING' ? 'CHƯA THANH TOÁN' : currentSubscription.status}
                      color={getStatusColor(currentSubscription.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {currentSubscription.package.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Ngày bắt đầu
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(currentSubscription.startDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Ngày hết hạn
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(currentSubscription.endDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Giá trị
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {formatPrice(currentSubscription.actualPrice)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Còn lại
                      </Typography>
                      <Typography variant="body2">
                        {currentSubscription.daysRemaining || 0} ngày
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Progress bar for days remaining */}
                  {currentSubscription.status === 'ACTIVE' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tiến độ subscription
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100,
                          ((currentSubscription.daysRemaining || 0) /
                           (currentSubscription.package.durationMonths * 30)) * 100
                        ))}
                        sx={{ mt: 1, borderRadius: 1 }}
                      />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {currentSubscription.status === 'PENDING' ? (
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<PaymentIcon />}
                        onClick={() => setPayDialogOpen(true)}
                        fullWidth
                        sx={{ fontWeight: 700, py: 1.2, textTransform: 'none', borderRadius: 2 }}
                      >
                        Thanh toán ngay (Pay Now)
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<UpgradeIcon />}
                        onClick={() => setRenewDialogOpen(true)}
                        disabled={currentSubscription.status !== 'ACTIVE'}
                        fullWidth
                        sx={{ py: 1.2, textTransform: 'none', borderRadius: 2 }}
                      >
                        Gia hạn / Nâng cấp
                      </Button>
                    )}
                  </Box>

                  {/* Package benefits */}
                  {currentSubscription.package.benefits && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Quyền lợi
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {currentSubscription.package.benefits}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Bạn chưa có gói tập nào
          </Typography>
          <Typography variant="body2">
            Hãy liên hệ với nhân viên để đăng ký gói tập phù hợp với bạn.
          </Typography>
        </Alert>
      )}

      {/* Renew Dialog */}
      <Dialog
        open={renewDialogOpen}
        onClose={() => setRenewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UpgradeIcon />
            Gia hạn Subscription
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Chọn gói tập mới để gia hạn subscription của bạn
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Chọn gói tập</InputLabel>
            <Select
              value={selectedPackage || ''}
              onChange={(e) => setSelectedPackage(e.target.value as number)}
              label="Chọn gói tập"
            >
              {packages.map((pkg) => (
                <MenuItem key={pkg.id} value={pkg.id}>
                  <Box>
                    <Typography variant="body1">
                      {pkg.name} - {pkg.durationMonths} tháng
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatPrice(pkg.price)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedPackage && (
            <Alert severity="info">
              <Typography variant="body2">
                Gói tập mới sẽ bắt đầu từ ngày hết hạn của gói hiện tại.
                Bạn sẽ cần thanh toán tại quầy để kích hoạt gói mới.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRenewDialogOpen(false)}
            disabled={renewLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleRenewSubscription}
            variant="contained"
            disabled={!selectedPackage || renewLoading}
            startIcon={renewLoading ? <CircularProgress size={16} /> : <UpgradeIcon />}
          >
            {renewLoading ? 'Đang xử lý...' : 'Gia hạn'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog
        open={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>Thanh toán gói tập (Subscription Payment)</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, p: 2.5, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {currentSubscription?.package?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thời hạn: {currentSubscription?.package?.durationMonths} tháng
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mt: 1 }}>
              Thành tiền: {formatPrice(currentSubscription?.actualPrice || 0)}
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="payment-method-select-label">Phương thức thanh toán</InputLabel>
            <Select
              labelId="payment-method-select-label"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as string)}
              label="Phương thức thanh toán"
            >
              <MenuItem value="CASH">Tiền mặt tại quầy (CASH)</MenuItem>
              <MenuItem value="BANK_TRANSFER">Chuyển khoản ngân hàng (BANK TRANSFER)</MenuItem>
              <MenuItem value="E_WALLET">Ví điện tử (Momo / ZaloPay)</MenuItem>
              <MenuItem value="CREDIT_CARD">Thẻ ngân hàng / Visa / Master</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPayDialogOpen(false)} disabled={payingLoading}>
            Hủy
          </Button>
          <Button
            onClick={handlePaySubmit}
            variant="contained"
            color="warning"
            disabled={payingLoading}
            startIcon={payingLoading ? <CircularProgress size={16} /> : <PaymentIcon />}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {payingLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>

      <PaymentHistoryPanel />
    </Container>
  );
};

export default MemberSubscription;