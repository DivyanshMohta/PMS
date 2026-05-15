import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Rating,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  MOCK_USERS,
  MOCK_REVIEWS,
  MOCK_DEVELOPMENT_PLANS,
  type Review,
} from "../../mock/data";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

type EmployeeRow = {
  id: string;
  originalId: string;
  name: string;
  title: string;
  department: string;
  reviewStatus: string;
  reviewPeriod: string;
  reviewScore: number | null;
  planProgress: number | null;
  avatar: string;
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Completed: { bg: "#10b98120", color: "#10b981" },
  Acknowledged: { bg: "#1a3a5c20", color: "#1a3a5c" },
  "In Progress": { bg: "#0ea5e920", color: "#0ea5e9" },
  Draft: { bg: "#94a3b820", color: "#64748b" },
  "No Review": { bg: "#f1f5f9", color: "#94a3b8" },
};

export default function TeamManagementPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [createReviewOpen, setCreateReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false, message: "", severity: "success",
  });
  const [newReview, setNewReview] = useState<{
    employeeId: string;
    period: string;
    notes: string;
    goals: { id: string; title: string; score: number }[];
  }>({ employeeId: "", period: "Mid-Year", notes: "", goals: [] });

  // Local reviews state — starts from mock data, updated when new reviews are created
  const [localReviews, setLocalReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('hrms_reviews_fallback');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [...MOCK_REVIEWS];
  });
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [employeeGoals, setEmployeeGoals] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periods = ["Mid-Year", "Annual"];

  useEffect(() => {
    // Fetch real reviews from the backend and merge with mock data
    apiClient.get("/reviews?limit=100").then((res) => {
      if (res.data?.items) {
        const backendReviews = res.data.items.map((item: any) => ({
          id: item._id,
          employeeId: item.employee_id,
          employeeName: item.employee_name,
          reviewerId: item.reviewer_id,
          reviewerName: item.reviewer_name,
          period: item.period,
          status: item.status,
          overallScore: item.overall_score,
          goals: item.goals || [],
          competencyScores: item.competency_scores || [],
        }));
        
        setLocalReviews((prev) => {
          const merged = [...backendReviews];
          prev.forEach((mockReview) => {
            if (!merged.find(r => r.employeeId === mockReview.employeeId && r.period === mockReview.period)) {
              merged.push(mockReview);
            }
          });
          localStorage.setItem('hrms_reviews_fallback', JSON.stringify(merged));
          return merged;
        });
      }
    }).catch((err) => {
      console.error("Failed to load backend reviews:", err);
      // Fallback already loaded from localStorage
    });

    // Fetch employees from backend
    fetchEmployees();
  }, [user]);

  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/users?limit=100');
      const allUsers = res.data?.items || [];
      
      // Filter based on user role
      let filteredUsers = allUsers;
      if (user?.role === 'Manager') {
        // Manager sees only their direct reports
        filteredUsers = allUsers.filter((u: any) => u.manager_id === user._id);
      } else {
        // HR sees all employees, managers see direct reports
        filteredUsers = allUsers.filter((u: any) => u.role === 'Employee' || u.role === 'Manager');
      }

      // Map to EmployeeRow format with review/plan data
      const mapped = filteredUsers.flatMap((u: any) => {
        const plan = MOCK_DEVELOPMENT_PLANS.find((p) => p.employeeId === u._id);
        
        return periods.map((period) => {
          const review = localReviews.find((r) => r.employeeId === u._id && r.period === period);
          
          return {
            id: `${u._id}_${period}`,
            originalId: u._id,
            name: u.name,
            title: u.title,
            department: u.department,
            reviewStatus: review?.status || "No Review",
            reviewPeriod: period,
            reviewScore: review?.overallScore || null,
            planProgress: plan?.overallProgress ?? null,
            avatar: (u.name?.split(' ').map((n: string) => n[0]).join('') || 'U').toUpperCase(),
          };
        });
      });
      setEmployees(mapped);
    } catch (err: any) {
      const msg = typeof err?.response?.data?.detail === 'string' 
        ? err.response.data.detail 
        : (err?.message || 'Failed to fetch employees');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmployeeGoals(employeeId: string) {
    try {
      const res = await apiClient.get(`/goals?employee_id=${employeeId}&limit=100`);
      const goals = res.data?.items || [];
      setEmployeeGoals((prev) => ({
        ...prev,
        [employeeId]: goals,
      }));
      return goals;
    } catch (err: any) {
      console.error("Failed to fetch employee goals:", err);
      return [];
    }
  }

  const handleCreateReview = async () => {
    if (!newReview.employeeId) {
      setSnackbar({ open: true, message: "Please select an employee.", severity: "error" });
      return;
    }
    setSubmitting(true);

    // Get the selected employee from the employees array (to get originalId)
    const selectedEmp = employees.find((e) => e.id === newReview.employeeId);
    if (!selectedEmp) {
      setSnackbar({ open: true, message: "Employee not found.", severity: "error" });
      setSubmitting(false);
      return;
    }

    const reviewer = user;

    const avgScore = newReview.goals.length > 0
      ? newReview.goals.reduce((acc, curr) => acc + curr.score, 0) / newReview.goals.length
      : 0;
    const finalScore = Number(avgScore.toFixed(1));

    const mappedGoals = newReview.goals.map(g => ({
      id: g.id,
      title: g.title,
      description: `Manager Rating: ${g.score} stars`,
      progress: 100,
      dueDate: new Date().toISOString().split('T')[0],
      status: "Completed" as const,
      weight: 0
    }));

    // Build a local review object to add to state immediately
    const localEntry: Review = {
      id: `r_local_${Date.now()}`,
      employeeId: selectedEmp.originalId,
      employeeName: selectedEmp.name,
      reviewerId: reviewer?.id ?? "unknown",
      reviewerName: reviewer?.name ?? "Unknown",
      period: newReview.period,
      status: "Completed",
      overallScore: finalScore,
      goals: mappedGoals,
      competencyScores: [],
    };

    // 1. Save goal ratings to backend (PATCH each goal)
    try {
      for (const goal of newReview.goals) {
        if (goal.score > 0) {
          await apiClient.patch(`/goals/${goal.id}`, {
            manager_rating: goal.score,
            manager_feedback: newReview.notes,
          });
        }
      }

      // 2. Save review to backend
      await apiClient.post("/reviews", {
        employee_id: selectedEmp.originalId,
        employee_name: selectedEmp.name,
        reviewer_id: reviewer?.id ?? "",
        reviewer_name: reviewer?.name ?? "",
        period: newReview.period,
        status: "Completed",
        overall_score: finalScore,
        goals: newReview.goals.map(g => ({
          id: g.id,
          title: g.title,
          description: `Manager Rating: ${g.score} stars`,
          progress: 100,
          due_date: new Date().toISOString().split('T')[0],
          status: "Completed",
          weight: 0
        })),
        competency_scores: [],
        notes: newReview.notes,
      });

      // 3. Update local state for immediate UI feedback only if backend succeeds
      setLocalReviews((prev) => {
        const next = [localEntry, ...prev];
        localStorage.setItem('hrms_reviews_fallback', JSON.stringify(next));
        return next;
      });
      
      // 3. Refresh employees list to show updated review status
      await fetchEmployees();
      
      setCreateReviewOpen(false);
      setNewReview({ employeeId: "", period: "Mid-Year", notes: "", goals: [] });
      setSnackbar({ open: true, message: `Review saved to hrms_db for ${selectedEmp.name}`, severity: "success" });
      setSubmitting(false);

    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = detail ? JSON.stringify(detail) : err?.message;
      console.error("[Review] Backend save failed:", msg);
      
      // FALLBACK: If DB fails, save locally so the app keeps working!
      setLocalReviews((prev) => {
        const next = [localEntry, ...prev];
        localStorage.setItem('hrms_reviews_fallback', JSON.stringify(next));
        return next;
      });
      
      // Refresh employees list even on fallback
      await fetchEmployees();
      
      setCreateReviewOpen(false);
      setNewReview({ employeeId: "", period: "Mid-Year", notes: "", goals: [] });
      setSnackbar({ 
        open: true, 
        message: `Saved Locally (Database Error: ${msg})`, 
        severity: "warning" 
      });
      setSubmitting(false);
    }
  };


  const departments = [
    "All",
    ...Array.from(new Set(employees.map((e) => e.department))),
  ];
  const statuses = [
    "All",
    "Completed",
    "Acknowledged",
    "In Progress",
    "No Review",
  ];

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    const matchStatus =
      statusFilter === "All" || e.reviewStatus === statusFilter;
    const matchPeriod = 
      periodFilter === "All" || e.reviewPeriod === periodFilter;
    return matchSearch && matchDept && matchStatus && matchPeriod;
  });

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Employee",
      flex: 1,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "#1a3a5c",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {params.row.avatar}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#0f172a",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {params.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {params.row.title}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      width: 140,
      renderCell: (p) => (
        <Chip
          label={p.value}
          size="small"
          sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: 12 }}
        />
      ),
    },
    {
      field: "reviewPeriod",
      headerName: "Period",
      width: 100,
      renderCell: (p: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
          {p.value}
        </Typography>
      ),
    },
    {
      field: "reviewStatus",
      headerName: "Review Status",
      width: 150,
      renderCell: (p: GridRenderCellParams) => {
        const s = STATUS_STYLE[p.value as string] || STATUS_STYLE["No Review"];
        return (
          <Chip
            label={p.value}
            size="small"
            sx={{
              bgcolor: s.bg,
              color: s.color,
              fontWeight: 600,
              fontSize: 12,
            }}
          />
        );
      },
    },
    {
      field: "reviewScore",
      headerName: "Score",
      width: 100,
      renderCell: (p: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: p.value ? "#1a3a5c" : "#94a3b8" }}
        >
          {p.value ? `${p.value}/5` : "—"}
        </Typography>
      ),
    },
    {
      field: "planProgress",
      headerName: "Dev Plan",
      width: 160,
      renderCell: (p: GridRenderCellParams) =>
        p.value !== null ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={p.value as number}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: "#f1f5f9",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#0ea5e9",
                  borderRadius: 3,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#475569", minWidth: 30 }}
            >
              {p.value}%
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            No plan
          </Typography>
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (p: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            height: "100%",
            alignItems: "center",
          }}
        >
          <Tooltip title="View Profile">
            <IconButton
              size="small"
              onClick={() => setSelectedEmployee(p.row as EmployeeRow)}
              sx={{
                color: "#64748b",
                "&:hover": { color: "#1a3a5c", bgcolor: "#1a3a5c10" },
              }}
            >
              <VisibilityIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Create Review">
            <IconButton
              size="small"
              onClick={() => {
                setNewReview((prev) => ({ ...prev, employeeId: p.row.id }));
                setCreateReviewOpen(true);
              }}
              sx={{
                color: "#64748b",
                "&:hover": { color: "#10b981", bgcolor: "#10b98110" },
              }}
            >
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    
    <Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && !loading && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#fee2e2', borderLeft: '4px solid #dc2626' }}>
          <Typography sx={{ color: '#991b1b' }}>Error: {error}</Typography>
        </Paper>
      )}

      {!loading && !error && (
      <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
            {user?.role === 'Manager' ? 'My Team' : 'Team Management'}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {user?.role === 'Manager' 
              ? 'View your direct reports and manage their performance'
              : 'Manage employee reviews, track performance, and monitor development plans'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateReviewOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          New Review
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: user?.role === 'Manager' ? 'Direct Reports' : 'Total Employees',
            value: [...new Set(employees.map(e => e.originalId))].length,
            color: "#1a3a5c",
          },
          {
            label: "Reviews Completed",
            value: employees.filter((e) =>
              ["Completed", "Acknowledged"].includes(e.reviewStatus),
            ).length,
            color: "#10b981",
          },
          {
            label: "In Progress",
            value: employees.filter((e) => e.reviewStatus === "In Progress")
              .length,
            color: "#0ea5e9",
          },
          {
            label: "Pending Start",
            value: employees.filter((e) => e.reviewStatus === "No Review").length,
            color: "#f59e0b",
          },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                border: `2px solid ${s.color}20`,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, color: s.color }}>
                {s.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#64748b", fontWeight: 500 }}
              >
                {s.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <FilterListIcon sx={{ color: "#94a3b8" }} />
          <TextField
            size="small"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={deptFilter}
              label="Department"
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              {departments.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Review Status</InputLabel>
            <Select
              value={statusFilter}
              label="Review Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={periodFilter}
              label="Period"
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              {["All", ...periods].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          rowHeight={72}
          pageSizeOptions={[5, 10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
            "& .MuiDataGrid-cell": {
              borderColor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-row": { alignItems: "center" },
          }}
        />
      </Paper>

      {/* Employee Detail Dialog */}
      <Dialog
        open={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        maxWidth="sm"
        fullWidth
        paperprops={{ sx: { borderRadius: 3 } }}
      >
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "#1a3a5c",
                    fontWeight: 700,
                  }}
                >
                  {selectedEmployee.avatar}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, lineHeight: 1.2 }}
                  >
                    {selectedEmployee.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {selectedEmployee.title} • {selectedEmployee.department}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Review Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedEmployee.reviewStatus}
                      size="small"
                      sx={{
                        ...STATUS_STYLE[selectedEmployee.reviewStatus],
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Performance Score
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1a3a5c", mt: 0.5 }}
                  >
                    {selectedEmployee.reviewScore
                      ? `${selectedEmployee.reviewScore}/5`
                      : "—"}
                  </Typography>
                </Grid>
                {selectedEmployee.planProgress !== null && (
                  <Grid item xs={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Development Plan Progress
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.75,
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={selectedEmployee.planProgress}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#f1f5f9",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#0ea5e9",
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#0ea5e9" }}
                      >
                        {selectedEmployee.planProgress}%
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setSelectedEmployee(null)}
                sx={{ color: "#64748b" }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={async () => {
                  const empId = selectedEmployee.id; // Use formatted ID (with period) that dropdown expects
                  const originalId = selectedEmployee.originalId;
                  const goals = employeeGoals[originalId] || await fetchEmployeeGoals(originalId);
                  const initialGoals = goals.map((g: any) => ({
                    id: g._id,
                    title: g.title,
                    score: 0
                  })) || [];
                  
                  setNewReview({
                    employeeId: empId,
                    period: selectedEmployee.reviewPeriod,
                    notes: "",
                    goals: initialGoals
                  });
                  setSelectedEmployee(null);
                  setCreateReviewOpen(true);
                }}
              >
                Create Review
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Review Dialog */}
      <Dialog
        open={createReviewOpen}
        onClose={() => setCreateReviewOpen(false)}
        maxWidth="sm"
        fullWidth
        paperprops={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Create Performance Review
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={newReview.employeeId}
                label="Employee"
                onChange={async (e) => {
                  const empId = e.target.value;
                  const selectedEmp = employees.find(u => u.id === empId);
                  if (selectedEmp) {
                    const goals = employeeGoals[selectedEmp.originalId] || await fetchEmployeeGoals(selectedEmp.originalId);
                    const initialGoals = goals.map((g: any) => ({
                      id: g._id,
                      title: g.title,
                      score: 0
                    })) || [];
                    setNewReview((p) => ({ ...p, employeeId: empId, goals: initialGoals }));
                  }
                }}
              >
                {employees.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name} — {u.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Review Period</InputLabel>
              <Select
                value={newReview.period}
                label="Review Period"
                onChange={(e) =>
                  setNewReview((p) => ({ ...p, period: e.target.value }))
                }
              >
                {periods.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Initial Notes"
              multiline
              rows={2}
              fullWidth
              value={newReview.notes}
              onChange={(e) =>
                setNewReview((p) => ({ ...p, notes: e.target.value }))
              }
            />

            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Employee Goals & Ratings</Typography>
              </Box>
              
              {newReview.goals.map((goal, idx) => (
                <Box key={goal.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                    {goal.title}
                  </Typography>
                  <Rating 
                    value={goal.score}
                    onChange={(_, val) => {
                      const updated = [...newReview.goals];
                      updated[idx].score = val || 0;
                      setNewReview(p => ({ ...p, goals: updated }));
                    }}
                  />
                </Box>
              ))}
              {newReview.goals.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  No projects added yet. Click "Add Project" to include them in the review.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setCreateReviewOpen(false)}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={handleCreateReview}
          >
            {submitting ? "Creating…" : "Create Review"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Success / Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Box>
      )}
    </Box>
  );
}
