import React, { useState } from "react";
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
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  MOCK_USERS,
  MOCK_REVIEWS,
  MOCK_DEVELOPMENT_PLANS,
} from "../../mock/data";

type EmployeeRow = {
  id: string;
  name: string;
  title: string;
  department: string;
  reviewStatus: string;
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
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(
    null,
  );
  const [createReviewOpen, setCreateReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    employeeId: "",
    period: "H1 2025",
    notes: "",
  });

  const employees = MOCK_USERS.filter((u) => u.role === "Employee").map((u) => {
    const review = MOCK_REVIEWS.find((r) => r.employeeId === u.id);
    const plan = MOCK_DEVELOPMENT_PLANS.find((p) => p.employeeId === u.id);
    return {
      id: u.id,
      name: u.name,
      title: u.title,
      department: u.department,
      reviewStatus: review?.status || "No Review",
      reviewScore: review?.overallScore || null,
      planProgress: plan?.overallProgress ?? null,
      avatar: u.avatar,
    };
  });

  const departments = [
    "All",
    ...Array.from(new Set(employees.map((e) => e.department))),
  ];
  const statuses = [
    "All",
    "Completed",
    "Acknowledged",
    "In Progress",
    "Draft",
    "No Review",
  ];

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    const matchStatus =
      statusFilter === "All" || e.reviewStatus === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Employee",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            height: "100%",
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#1a3a5c",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {params.row.avatar}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}
            >
              {params.value}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
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
            Team Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Manage employee reviews, track performance, and monitor development
            plans
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
            label: "Total Employees",
            value: employees.length,
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
            value: employees.filter((e) =>
              ["Draft", "No Review"].includes(e.reviewStatus),
            ).length,
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
        </Box>
      </Paper>

      <Paper sx={{ height: 500 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          rowHeight={60}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc" },
            "& .MuiDataGrid-cell": { borderColor: "#f1f5f9" },
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
                onClick={() => {
                  setNewReview((p) => ({
                    ...p,
                    employeeId: selectedEmployee.id,
                  }));
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
                onChange={(e) =>
                  setNewReview((p) => ({ ...p, employeeId: e.target.value }))
                }
              >
                {MOCK_USERS.filter((u) => u.role === "Employee").map((u) => (
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
                {["H1 2025", "H2 2025", "H1 2024", "H2 2024"].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Initial Notes"
              multiline
              rows={3}
              fullWidth
              value={newReview.notes}
              onChange={(e) =>
                setNewReview((p) => ({ ...p, notes: e.target.value }))
              }
            />
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
            onClick={() => setCreateReviewOpen(false)}
          >
            Create Review
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
