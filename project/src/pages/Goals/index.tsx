import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext";

type GoalStatus = "Not Started" | "In Progress" | "Completed" | "At Risk";

type Goal = {
  _id: string;
  employee_id: string;
  employee_name: string;
  title: string;
  description: string;
  due_date: string;
  status: GoalStatus;
  progress: number;
  weight: number;
  created_at: string;
};

const STATUS_COLORS: Record<GoalStatus, { bg: string; text: string }> = {
  "Not Started": { bg: "#94a3b820", text: "#64748b" },
  "In Progress": { bg: "#0ea5e920", text: "#0ea5e9" },
  Completed: { bg: "#10b98120", text: "#10b981" },
  "At Risk": { bg: "#ef444420", text: "#dc2626" },
};

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    status: "Not Started" as GoalStatus,
    progress: 0,
    weight: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user?._id) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/goals?limit=100&employee_id=${user?._id ?? ""}`);
      setGoals(res.data?.items || []);
    } catch (err: any) {
      const msg = typeof err?.response?.data?.detail === "string"
        ? err.response.data.detail
        : err?.message || "Failed to load goals";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        due_date: goal.due_date,
        status: goal.status,
        progress: goal.progress,
        weight: goal.weight,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: "",
        description: "",
        due_date: "",
        status: "Not Started",
        progress: 0,
        weight: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async () => {
    if (!formData.title || !formData.due_date) {
      alert("Please fill in title and due date");
      return;
    }

    setSubmitting(true);
    try {
      if (editingGoal) {
        // Update existing goal
        const res = await apiClient.patch(`/goals/${editingGoal._id}`, {
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          status: formData.status,
          progress: formData.progress,
          weight: formData.weight,
        });
        setGoals(goals.map(g => g._id === editingGoal._id ? res.data : g));
      } else {
        // Create new goal
        const res = await apiClient.post("/goals", {
          employee_id: user?._id,
          employee_name: user?.name,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          status: formData.status,
          progress: formData.progress,
          weight: formData.weight,
        });
        setGoals([res.data, ...goals]);
      }
      handleCloseDialog();
    } catch (err: any) {
      const msg = typeof err?.response?.data?.detail === "string"
        ? err.response.data.detail
        : err?.message || "Failed to save goal";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await apiClient.delete(`/goals/${goalId}`);
      setGoals(goals.filter(g => g._id !== goalId));
    } catch (err: any) {
      const msg = typeof err?.response?.data?.detail === "string"
        ? err.response.data.detail
        : err?.message || "Failed to delete goal";
      alert(msg);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
            My Goals
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Define and track your own professional goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Goal
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : goals.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="textSecondary">No goals yet. Create one to get started!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Goal</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Weight</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#0f172a" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {goals.map((goal) => (
                <TableRow key={goal._id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {goal.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                        {goal.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(goal.due_date).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={goal.status}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[goal.status].bg,
                        color: STATUS_COLORS[goal.status].text,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={goal.progress}
                        sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#f1f5f9" }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 30 }}>
                        {goal.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${goal.weight}%`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(goal)}
                        sx={{ color: "#0ea5e9" }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGoal(goal._id)}
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Goal Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingGoal ? "Edit Goal" : "Add New Goal"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Goal Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete AWS Certification"
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about this goal..."
            />
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as GoalStatus })}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="At Risk">At Risk</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Progress: {formData.progress}%
              </Typography>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                style={{ width: "100%" }}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Weight: {formData.weight}%
              </Typography>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                style={{ width: "100%" }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: "#64748b" }}>
            Cancel
          </Button>
          <Button variant="contained" disabled={submitting} onClick={handleSaveGoal}>
            {submitting ? "Saving..." : editingGoal ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
