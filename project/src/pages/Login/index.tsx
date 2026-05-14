import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, Divider,
  InputAdornment, IconButton, Chip, CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../context/AuthContext';

const DEMO_ACCOUNTS = [
  { email: 'admin@hrms.com', password: 'admin123', role: 'Admin' },
  { email: 'hr@hrms.com', password: 'hr123', role: 'HR' },
  { email: 'manager@hrms.com', password: 'manager123', role: 'Manager' },
  { email: 'employee@hrms.com', password: 'employee123', role: 'Employee' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Invalid email or password. Try a demo account below.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const roleColors: Record<string, string> = { Admin: '#ef4444', HR: '#f59e0b', Manager: '#10b981', Employee: '#0ea5e9' };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0ea5e9 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(14,165,233,0.08)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: '50%', background: 'rgba(26,58,92,0.3)', pointerEvents: 'none' }} />

      <Box sx={{ width: '100%', maxWidth: 480, px: 2, zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>H</Typography>
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1 }}>HRMS</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Performance Platform</Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
            Employee Performance & Development Management
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#0f172a' }}>Welcome back</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>Sign in to access your dashboard</Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
              }}
            />
            <TextField
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                      {showPass ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit" variant="contained" fullWidth size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5, fontSize: 15, fontWeight: 600, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', px: 1 }}>Demo Accounts</Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <Chip
                key={acc.role}
                label={acc.role}
                onClick={() => fillDemo(acc.email, acc.password)}
                size="small"
                sx={{
                  cursor: 'pointer', fontWeight: 600, fontSize: 12,
                  bgcolor: roleColors[acc.role] + '15',
                  color: roleColors[acc.role],
                  border: `1px solid ${roleColors[acc.role]}30`,
                  '&:hover': { bgcolor: roleColors[acc.role] + '25' },
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1, textAlign: 'center' }}>
            Click a role to auto-fill credentials
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
