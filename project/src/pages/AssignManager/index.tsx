import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import apiClient from '../../api/client';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  title: string;
  manager_id?: string;
}

export default function AssignManagerPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSnack, setOpenSnack] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch all users (limit=100 is the backend max)
      const res = await apiClient.get('/users?limit=100');
      const allUsers = res.data?.items || [];

      // Filter managers
      const mgrs = allUsers.filter((u: User) => u.role === 'Manager');
      setManagers(mgrs);

      // Filter non-HR users (employees and managers)
      const emps = allUsers.filter((u: User) => u.role !== 'HR');
      setEmployees(emps);

      setError(null);
    } catch (err: any) {
      const errorMsg = typeof err?.response?.data?.detail === 'string' 
        ? err.response.data.detail 
        : (err?.message || 'Failed to fetch users');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleManagerChange(employeeId: string, newManagerId: string) {
    try {
      const payload = { manager_id: newManagerId || null };
      await apiClient.patch(`/users/${employeeId}`, payload);
      
      // Update local state
      setEmployees(prev =>
        prev.map(emp =>
          emp._id === employeeId ? { ...emp, manager_id: newManagerId } : emp
        )
      );

      setSuccess('Manager assigned successfully');
      setError(null);
      setOpenSnack(true);
    } catch (err: any) {
      const errorMsg = typeof err?.response?.data?.detail === 'string' 
        ? err.response.data.detail 
        : (err?.message || 'Failed to update manager');
      setError(errorMsg);
      setSuccess(null);
      setOpenSnack(true);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Assign Manager
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Employee Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp._id} hover>
                <TableCell>{emp.name}</TableCell>
                <TableCell>{emp.email}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell>
                  <Select
                    value={emp.manager_id || ''}
                    onChange={(e) => handleManagerChange(emp._id, e.target.value)}
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">None</MenuItem>
                    {managers.map((mgr) => (
                      <MenuItem key={mgr._id} value={mgr._id}>
                        {mgr.name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {employees.length === 0 && !loading && (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
          <Typography color="textSecondary">No employees found</Typography>
        </Paper>
      )}

      <Snackbar
        open={openSnack}
        autoHideDuration={4000}
        onClose={() => setOpenSnack(false)}
      >
        <Alert severity={error ? 'error' : 'success'} onClose={() => setOpenSnack(false)}>
          {success || error || ''}
        </Alert>
      </Snackbar>
    </Box>
  );
}
