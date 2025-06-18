import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar, IconButton,
  Button, Select, MenuItem, CircularProgress,
  Snackbar, Alert, Badge, Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  BarChart as ChartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Color scheme
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, usersRes, ordersRes] = await Promise.all([
          axios.get('/api/admin/dashboard'),
          axios.get('/api/admin/users'),
          axios.get('/api/admin/orders')
        ]);
        
        setDashboardData(dashboardRes.data);
        setUsers(usersRes.data);
        setOrders(ordersRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle user status toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await axios.patch(`/api/admin/users/${userId}/status`);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, active: !user.active } : user
      ));
      showSnackbar(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`, 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  // Handle order status update
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      showSnackbar('Order status updated successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      showSnackbar('User deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    
    try {
      await axios.delete(`/api/admin/orders/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      showSnackbar('Order deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete order', 'error');
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      
      {/* Navigation Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Button 
          onClick={() => setSelectedTab('dashboard')} 
          color={selectedTab === 'dashboard' ? 'primary' : 'inherit'}
        >
          Dashboard
        </Button>
        <Button 
          onClick={() => setSelectedTab('users')} 
          color={selectedTab === 'users' ? 'primary' : 'inherit'}
          sx={{ ml: 2 }}
        >
          Users
        </Button>
        <Button 
          onClick={() => setSelectedTab('orders')} 
          color={selectedTab === 'orders' ? 'primary' : 'inherit'}
          sx={{ ml: 2 }}
        >
          Orders
        </Button>
      </Box>

      {/* Dashboard Tab */}
      {selectedTab === 'dashboard' && dashboardData && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary">Total Users</Typography>
                      <Typography variant="h5">{dashboardData.totalUsers}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {dashboardData.activeUsers} active
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                      <OrdersIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary">Total Orders</Typography>
                      <Typography variant="h5">{dashboardData.totalOrders}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <RevenueIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary">Total Revenue</Typography>
                      <Typography variant="h5">
                        ${dashboardData.totalRevenue.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <ChartIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary">Analytics</Typography>
                      <Typography variant="h5">Reports</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Monthly Revenue Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Monthly Revenue</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="_id" 
                        tickFormatter={(value) => `${value.month}/${value.year}`}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Revenue']}
                        labelFormatter={(value) => `Month: ${value.month}/${value.year}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        name="Revenue" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Orders by Status Chart */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Orders by Status</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                      >
                        {dashboardData.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Orders']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Orders */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Orders</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.recentOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order.orderId}</TableCell>
                        <TableCell>
                          {order.user?.name || 'Unknown User'}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status} 
                            color={
                              order.status === 'delivered' ? 'success' : 
                              order.status === 'cancelled' ? 'error' : 'primary'
                            } 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => navigate(`/admin/orders/${order._id}`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar src={user.avatar} sx={{ mr: 2 }} />
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isAdmin ? 'Admin' : 'User'} 
                          color={user.isAdmin ? 'primary' : 'default'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={user.active ? 'success' : 'error'}
                          badgeContent={user.active ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleToggleUserStatus(user._id, user.active)}>
                          {user.active ? <CloseIcon color="error" /> : <CheckIcon color="success" />}
                        </IconButton>
                        <IconButton onClick={() => navigate(`/admin/users/${user._id}`)}>
                          <EditIcon color="primary" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteUser(user._id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Orders Tab */}
      {selectedTab === 'orders' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Order Management</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderId}</TableCell>
                      <TableCell>
                        {order.user?.name || 'Unknown User'}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => navigate(`/admin/orders/${order._id}`)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteOrder(order._id)}>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;