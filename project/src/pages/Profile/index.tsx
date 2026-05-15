import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  HR:       { bg: "#f59e0b20", color: "#f59e0b" },
  Manager:  { bg: "#10b98120", color: "#10b981" },
  Employee: { bg: "#0ea5e920", color: "#0ea5e9" },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name ?? "");
  const [email, setEmail]     = useState(user?.email ?? "");
  const [title, setTitle]     = useState(user?.title ?? "");

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleStyle = ROLE_COLORS[user?.role ?? "Employee"];

  const handleEdit = () => {
    // Reset fields from current user state
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setTitle(user?.title ?? "");
    setError(null);
    setSuccess(false);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(false);

    const updates = {
      name: name.trim(),
      email: email.trim(),
      title: title.trim() || user!.title,
    };

    // 1. Save to localStorage immediately — always works
    updateUser(updates);
    setSuccess(true);
    setEditing(false);
    setSaving(false);

    // 2. Try syncing to backend silently (fire-and-forget)
    //    Won't block or show errors to user if it fails
    apiClient.patch("/profile/me", updates).catch(() => {
      // Backend unavailable or mock auth in use — localStorage is the source of truth
    });
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
          My Profile
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          View and manage your personal information
        </Typography>
      </Box>

      {/* Profile card */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {/* Hero banner */}
        <Box
          sx={{
            height: 100,
            background: "linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 60%, #0ea5e9 100%)",
          }}
        />

        {/* Avatar + header info */}
        <Box sx={{ px: 4, pb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2.5, mt: "-44px", mb: 2.5 }}>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                fontSize: 28,
                fontWeight: 800,
                bgcolor: "#1a3a5c",
                border: "4px solid #fff",
                boxShadow: "0 2px 12px rgba(26,58,92,0.2)",
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ mb: 0.5, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {user.title}
              </Typography>
            </Box>
            <Chip
              label={user.role}
              size="small"
              sx={{
                mb: 0.5,
                fontWeight: 700,
                fontSize: 12,
                bgcolor: roleStyle.bg,
                color: roleStyle.color,
              }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Alerts */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Profile updated successfully!
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Info grid */}
          <Grid container spacing={2.5}>
            {/* Name */}
            <Grid item xs={12} sm={6}>
              <InfoRow
                icon={<PersonIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                label="Full Name"
                editing={editing}
                value={name}
                displayValue={user.name}
                onChange={setName}
                placeholder="Enter your full name"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <InfoRow
                icon={<EmailIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                label="Email Address"
                editing={editing}
                value={email}
                displayValue={user.email}
                onChange={setEmail}
                placeholder="Enter your email"
                type="email"
              />
            </Grid>

            {/* Designation */}
            <Grid item xs={12} sm={6}>
              <InfoRow
                icon={<WorkIcon sx={{ fontSize: 18, color: "#64748b" }} />}
                label="Designation"
                editing={editing}
                value={title}
                displayValue={user.title}
                onChange={setTitle}
                placeholder="Enter your designation"
              />
            </Grid>

            {/* Department — read-only always */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <BusinessIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Department
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>
                  {user.department}
                </Typography>
              </Box>
            </Grid>

            {/* Role — read-only always */}
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <BadgeIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Role
                  </Typography>
                </Box>
                <Chip
                  label={user.role}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    bgcolor: roleStyle.bg,
                    color: roleStyle.color,
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Action buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{
                  borderRadius: 2,
                  bgcolor: "#1a3a5c",
                  "&:hover": { bgcolor: "#2d5f8a" },
                  px: 3,
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{ borderRadius: 2, color: "#64748b", borderColor: "#e2e8f0" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#1a3a5c",
                    "&:hover": { bgcolor: "#2d5f8a" },
                    px: 3,
                  }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

// ── Helper sub-component ──────────────────────────────────────────────────────
interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  editing: boolean;
  value: string;
  displayValue: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

function InfoRow({ icon, label, editing, value, displayValue, onChange, placeholder, type = "text" }: InfoRowProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: editing ? "#fff" : "#f8fafc",
        border: editing ? "1.5px solid #1a3a5c" : "1px solid #e2e8f0",
        transition: "all 0.2s ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        {icon}
        <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </Typography>
      </Box>
      {editing ? (
        <TextField
          variant="standard"
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          InputProps={{ disableUnderline: false }}
          sx={{
            "& .MuiInput-root": { fontSize: 15, fontWeight: 600, color: "#0f172a" },
          }}
        />
      ) : (
        <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>
          {displayValue}
        </Typography>
      )}
    </Box>
  );
}
