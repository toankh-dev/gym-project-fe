import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Grid,
  Pagination,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  TrendingUp as StatsIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { paymentApi } from '../../services/api.service';

interface Payment {
  id: number;
  memberId: number;
  memberName?: string;
  subscriptionId?: number;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT';
  paymentType: 'SUBSCRIPTION' | 'PERSONAL_TRAINING' | 'MERCHANDISE' | 'OTHER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  notes?: string;
  processedBy?: number;
  createdAt: string;
}

interface PaymentStatistics {
  totalRevenue: number;
  totalPayments: number;
  averagePayment: number;
  successRate: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
}

const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Form states
  const [editForm, setEditForm] = useState({
    status: '',
    notes: ''
  });

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters
      });

      const response = await paymentApi.getPayments(`?${queryParams}`);
      const paymentsData = (response as any).data;
      setPayments(paymentsData.payments || paymentsData || []);
      setTotalPages(paymentsData.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await paymentApi.getStatistics();
      setStatistics((response as any).data as PaymentStatistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert('Failed to fetch payment statistics');
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setEditForm({
      status: payment.status,
      notes: payment.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;

    try {
      await paymentApi.updateStatus(selectedPayment.id, editForm);
      setEditDialogOpen(false);
      fetchPayments();
      alert('Payment status updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment status');
    }
  };

  const handleShowStatistics = async () => {
    await fetchStatistics();
    setStatsDialogOpen(true);
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payment Management
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1 }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="MOBILE_PAYMENT">Mobile Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<StatsIcon />}
          onClick={handleShowStatistics}
        >
          View Statistics
        </Button>
      </Box>

      {/* Payments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Records
          </Typography>

          {loading ? (
            <Typography>Loading payments...</Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Member</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>
                          {payment.memberName || `Member #${payment.memberId}`}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.paymentType}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={getStatusColor(payment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewPayment(payment)}
                              size="small"
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Status">
                            <IconButton
                              onClick={() => handleEditPayment(payment)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Payment ID</Typography>
                  <Typography>{selectedPayment.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Transaction ID</Typography>
                  <Typography>{selectedPayment.transactionId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Member ID</Typography>
                  <Typography>{selectedPayment.memberId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Amount</Typography>
                  <Typography>{formatCurrency(selectedPayment.amount)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Payment Method</Typography>
                  <Typography>{selectedPayment.paymentMethod}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Payment Type</Typography>
                  <Typography>{selectedPayment.paymentType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={selectedPayment.status}
                    color={getStatusColor(selectedPayment.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography>{formatDate(selectedPayment.createdAt)}</Typography>
                </Grid>
                {selectedPayment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Notes</Typography>
                    <Typography>{selectedPayment.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Status Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Dialog */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Statistics</DialogTitle>
        <DialogContent>
          {statistics && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Revenue</Typography>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(statistics.totalRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Total Payments</Typography>
                      <Typography variant="h4" color="primary">
                        {statistics.totalPayments}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Average Payment</Typography>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(statistics.averagePayment)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Success Rate</Typography>
                      <Typography variant="h4" color="success.main">
                        {statistics.successRate.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Payment Methods Distribution
              </Typography>
              {statistics.paymentMethods.map((method) => (
                <Box key={method.method} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {method.method}: {method.count} payments ({method.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPayments;