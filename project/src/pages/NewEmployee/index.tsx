import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, MenuItem, Stack, Alert } from '@mui/material';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

const roles = ['Employee', 'Manager', 'HR'];

export default function NewEmployeePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: '',
    title: '',
    manager_id: '',
    password: 'ChangeMe123!',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function update(k: string, v: any) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        title: form.title,
        manager_id: form.manager_id || null,
        password: form.password,
      };
      await apiClient.post('/users', payload);
      setSuccess('Employee created successfully');
      setTimeout(() => navigate('/team'), 900);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        New Employee
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <TextField
              label="Full name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            >
              {roles.map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Department"
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
            />
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
            <TextField
              label="Manager ID"
              value={form.manager_id}
              onChange={(e) => update('manager_id', e.target.value)}
              helperText="Optional – paste manager user id"
            />

            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                Create
              </Button>
              <Button variant="outlined" onClick={() => navigate('/team')}>Cancel</Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
