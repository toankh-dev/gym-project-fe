import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { packageApi } from '../../services/api.service';
import { getApiErrorMessage } from '../../utils/errorHandler';

// Temporary notification helper
const useSnackbar = () => ({
  enqueueSnackbar: (message: string, options: { variant?: string }) => {
    if (options.variant === 'error') {
      console.error(message);
      alert('Error: ' + message);
    } else {
      console.log(message);
      alert(message);
    }
  }
});

interface Package {
  id: number;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  benefits?: string;
  maxSessions?: number;
  allowTrainer: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

interface PackageFormData {
  name: string;
  durationMonths: number;
  price: number;
  description: string;
  benefits: string;
  maxSessions: number | '';
  allowTrainer: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

const AdminPackages: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    durationMonths: 1,
    price: 0,
    description: '',
    benefits: '',
    maxSessions: '',
    allowTrainer: false,
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packageApi.getPackages() as any;
      if (response.success) {
        setPackages(response.data.packages as Package[]);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      enqueueSnackbar('Không thể tải danh sách gói tập', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        durationMonths: pkg.durationMonths,
        price: pkg.price,
        description: pkg.description || '',
        benefits: pkg.benefits || '',
        maxSessions: pkg.maxSessions || '',
        allowTrainer: pkg.allowTrainer,
        status: pkg.status,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        durationMonths: 1,
        price: 0,
        description: '',
        benefits: '',
        maxSessions: '',
        allowTrainer: false,
        status: 'ACTIVE',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPackage(null);
    setSubmitting(false);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const submitData = {
        ...formData,
        maxSessions: formData.maxSessions === '' ? null : Number(formData.maxSessions),
      };

      let response;
      if (editingPackage) {
        response = await packageApi.updatePackage(editingPackage.id, submitData);
      } else {
        response = await packageApi.createPackage(submitData);
      }

      if (response.success) {
        enqueueSnackbar(
          editingPackage ? 'Cập nhật gói tập thành công!' : 'Tạo gói tập thành công!',
          { variant: 'success' }
        );
        handleCloseDialog();
        loadPackages();
      }
    } catch (error: any) {
      console.error('Error submitting package:', error);
      enqueueSnackbar(
        getApiErrorMessage(error, 'Không thể lưu gói tập'),
        { variant: 'error' }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gói tập này?')) return;

    try {
      const response = await packageApi.deletePackage(id);
      if (response.success) {
        enqueueSnackbar('Xóa gói tập thành công!', { variant: 'success' });
        loadPackages();
      }
    } catch (error: any) {
      console.error('Error deleting package:', error);
      enqueueSnackbar(
        getApiErrorMessage(error, 'Không thể xóa gói tập'),
        { variant: 'error' }
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Package Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Tạo gói mới
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Quản lý các gói tập và giá thành
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {packages.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số gói
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {packages.filter(p => p.status === 'ACTIVE').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gói đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {packages.filter(p => p.allowTrainer).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gói có HLV
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {formatPrice(packages.reduce((sum, p) => sum + p.price, 0) / (packages.length || 1))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Giá trung bình
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Packages Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên gói</TableCell>
                <TableCell>Thời hạn</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Số buổi</TableCell>
                <TableCell>Huấn luyện viên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {pkg.name}
                      </Typography>
                      {pkg.description && (
                        <Typography variant="caption" color="text.secondary">
                          {pkg.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{pkg.durationMonths} tháng</TableCell>
                  <TableCell>{formatPrice(pkg.price)}</TableCell>
                  <TableCell>
                    {pkg.maxSessions ? `${pkg.maxSessions} buổi` : 'Không giới hạn'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pkg.allowTrainer ? 'Có' : 'Không'}
                      color={pkg.allowTrainer ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={pkg.status}
                      color={pkg.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(pkg)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(pkg.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {packages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Chưa có gói tập nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPackage ? 'Chỉnh sửa gói tập' : 'Tạo gói tập mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên gói"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Thời hạn (tháng)</InputLabel>
                <Select
                  value={formData.durationMonths}
                  onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: Number(e.target.value) }))}
                  label="Thời hạn (tháng)"
                >
                  <MenuItem value={1}>1 tháng</MenuItem>
                  <MenuItem value={3}>3 tháng</MenuItem>
                  <MenuItem value={6}>6 tháng</MenuItem>
                  <MenuItem value={12}>12 tháng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giá (VND)"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Số buổi tối đa"
                type="number"
                fullWidth
                value={formData.maxSessions}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSessions: e.target.value === '' ? '' : Number(e.target.value) }))}
                helperText="Để trống nếu không giới hạn"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Quyền lợi"
                fullWidth
                multiline
                rows={3}
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                helperText="Mô tả các quyền lợi của gói tập"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowTrainer}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowTrainer: e.target.checked }))}
                  />
                }
                label="Bao gồm huấn luyện viên"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                  label="Trạng thái"
                >
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Tạm dừng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !formData.name || formData.price <= 0}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? 'Đang lưu...' : (editingPackage ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPackages;