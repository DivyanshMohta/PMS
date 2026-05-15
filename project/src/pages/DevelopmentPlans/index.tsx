import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import GroupsIcon from "@mui/icons-material/Groups";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../context/AuthContext";
import {
  MOCK_DEVELOPMENT_PLANS,
  DevelopmentPlan,
  TrainingRecord,
} from "../../mock/data";

const TYPE_ICON: Record<string, React.ReactNode> = {
  Course: <AutoStoriesIcon sx={{ fontSize: 18 }} />,
  Certification: <WorkspacePremiumIcon sx={{ fontSize: 18 }} />,
  Workshop: <SchoolIcon sx={{ fontSize: 18 }} />,
  Mentoring: <GroupsIcon sx={{ fontSize: 18 }} />,
};

const TYPE_COLOR: Record<string, string> = {
  Course: "#0ea5e9",
  Certification: "#f59e0b",
  Workshop: "#10b981",
  Mentoring: "#8b5cf6",
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#10b98120", color: "#10b981" },
  Completed: { bg: "#1a3a5c20", color: "#1a3a5c" },
  "On Hold": { bg: "#f59e0b20", color: "#f59e0b" },
  Planned: { bg: "#94a3b820", color: "#64748b" },
  "In Progress": { bg: "#0ea5e920", color: "#0ea5e9" },
};

function TrainingCard({ t }: { t: TrainingRecord }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e2e8f0",
        bgcolor: "#fafafa",
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: TYPE_COLOR[t.type] + "20",
            color: TYPE_COLOR[t.type],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {TYPE_ICON[t.type]}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}
            >
              {t.title}
            </Typography>
            <Chip
              label={t.status}
              size="small"
              sx={{
                ...STATUS_STYLE[t.status],
                fontWeight: 600,
                height: 20,
                fontSize: 10,
                flexShrink: 0,
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {t.provider} • {t.type}
          </Typography>
          {t.completedDate && (
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Chip
                label={`Completed: ${t.completedDate}`}
                size="small"
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  fontSize: 10,
                  height: 18,
                }}
              />
              {t.score && (
                <Chip
                  label={`Score: ${t.score}%`}
                  size="small"
                  sx={{
                    bgcolor: "#10b98115",
                    color: "#10b981",
                    fontSize: 10,
                    height: 18,
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function PlanCard({
  plan,
  onClick,
}: {
  plan: DevelopmentPlan;
  onClick: () => void;
}) {
  const completedMilestones = plan.milestones.filter((m) => m.completed).length;
  const completedTrainings = plan.trainings.filter(
    (t) => t.status === "Completed",
  ).length;

  return (
    <Card
      sx={{
        height: "100%",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 4 },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#0f172a", fontSize: 16, mb: 0.5 }}
            >
              {plan.title}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a3a5c", mb: 0.5 }}>
              {plan.employeeName}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Target: {plan.targetRole}
            </Typography>
          </Box>
          <Chip
            label={plan.status}
            size="small"
            sx={{ ...STATUS_STYLE[plan.status], fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#475569" }}
            >
              Overall Progress
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: "#1a3a5c" }}
            >
              {plan.overallProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={plan.overallProgress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#f1f5f9",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#1a3a5c",
                borderRadius: 4,
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              p: 1.5,
              bgcolor: "#f8fafc",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
              {completedMilestones}/{plan.milestones.length}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Milestones
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              p: 1.5,
              bgcolor: "#f8fafc",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0ea5e9" }}>
              {completedTrainings}/{plan.trainings.length}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Trainings
            </Typography>
          </Box>
          <Box
            sx={{
              textAlign: "center",
              flex: 1,
              p: 1.5,
              bgcolor: "#f8fafc",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", display: "block" }}
            >
              End Date
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: "#475569" }}
            >
              {plan.endDate}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DevelopmentPlansPage() {
  const { user, hasRole } = useAuth();
  const [tab, setTab] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlan | null>(
    null,
  );
  const [plansState, setPlansState] = useState<DevelopmentPlan[]>(MOCK_DEVELOPMENT_PLANS);
  const [editingPlan, setEditingPlan] = useState<DevelopmentPlan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    employeeId: "",
    title: "",
    targetRole: "",
    endDate: "",
  });
  const plans = hasRole("HR", "Manager")
    ? plansState
    : plansState.filter((p) => p.employeeId === (user?.id || "u4"));

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
            Development Plans
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Track growth paths, training records, certifications, and milestones
          </Typography>
        </Box>
        {hasRole("HR", "Manager") && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            New Plan
          </Button>
        )}
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          borderBottom: "1px solid #e2e8f0",
          "& .MuiTab-root": { fontWeight: 600, fontSize: 13 },
        }}
      >
        <Tab label="All Plans" />
        <Tab label="Trainings & Certifications" />
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2.5}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} key={plan.id}>
              <PlanCard plan={plan} onClick={() => setSelectedPlan(plan)} />
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 1 && (
        <Box>
          {plans.map((plan) => (
            <Paper key={plan.id} sx={{ p: 3, mb: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, color: "#0f172a" }}
                  >
                    {plan.employeeName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {plan.title}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    label={`${plan.trainings.filter((t) => t.status === "Completed").length} Completed`}
                    size="small"
                    sx={{
                      bgcolor: "#10b98120",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`${plan.trainings.filter((t) => t.status === "In Progress").length} In Progress`}
                    size="small"
                    sx={{
                      bgcolor: "#0ea5e920",
                      color: "#0ea5e9",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
              <Grid container spacing={1.5}>
                {plan.trainings.map((t) => (
                  <Grid item xs={12} sm={6} key={t.id}>
                    <TrainingCard t={t} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Box>
      )}

      {/* Plan Detail Dialog */}
      <Dialog
        open={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        maxWidth="md"
        fullWidth
        paperprops={{ sx: { borderRadius: 3 } }}
      >
        {selectedPlan && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedPlan.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {selectedPlan.employeeName} • Target:{" "}
                    {selectedPlan.targetRole}
                  </Typography>
                </Box>
                <Chip
                  label={selectedPlan.status}
                  size="small"
                  sx={{ ...STATUS_STYLE[selectedPlan.status], fontWeight: 600 }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.75,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Overall Progress
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#1a3a5c" }}
                  >
                    {selectedPlan.overallProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={selectedPlan.overallProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "#f1f5f9",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#1a3a5c",
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5 }}
                  >
                    Milestones
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {selectedPlan.milestones.map((m) => (
                      <Box
                        key={m.id}
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        {m.completed ? (
                          <CheckCircleIcon
                            sx={{
                              color: "#10b981",
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{
                              color: "#cbd5e1",
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: m.completed ? "#64748b" : "#0f172a",
                              textDecoration: m.completed
                                ? "line-through"
                                : "none",
                              fontSize: 13,
                            }}
                          >
                            {m.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#94a3b8" }}
                          >
                            Due: {m.dueDate}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#0f172a", mb: 1.5 }}
                  >
                    Training Records
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                  >
                    {selectedPlan.trainings.map((t) => (
                      <TrainingCard key={t.id} t={t} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setSelectedPlan(null)}
                sx={{ color: "#64748b" }}
              >
                Close
              </Button>
              {/* <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  // Open create/edit dialog prefilled with selected plan
                  setEditingPlan(selectedPlan);
                  setNewPlan({
                    employeeId: selectedPlan.employeeId,
                    title: selectedPlan.title,
                    targetRole: selectedPlan.targetRole,
                    endDate: selectedPlan.endDate,
                  });
                  setSelectedPlan(null);
                  setCreateOpen(true);
                }}
              >
                Edit Plan
              </Button> */}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Plan Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        paperprops={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Create Development Plan
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={newPlan.employeeId}
                label="Employee"
                onChange={(e) =>
                  setNewPlan((p) => ({ ...p, employeeId: e.target.value }))
                }
              >
                {MOCK_DEVELOPMENT_PLANS.map((p) => (
                  <MenuItem key={p.id} value={p.employeeId}>
                    {p.employeeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Plan Title"
              fullWidth
              value={newPlan.title}
              onChange={(e) =>
                setNewPlan((p) => ({ ...p, title: e.target.value }))
              }
            />
            <TextField
              label="Target Role"
              fullWidth
              value={newPlan.targetRole}
              onChange={(e) =>
                setNewPlan((p) => ({ ...p, targetRole: e.target.value }))
              }
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newPlan.endDate}
              onChange={(e) =>
                setNewPlan((p) => ({ ...p, endDate: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setCreateOpen(false);
              setEditingPlan(null);
            }}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          {editingPlan ? (
            <Button
              variant="contained"
              onClick={() => {
                // Update plan in local state
                setPlansState((prev) => prev.map((p) => (p.id === editingPlan.id ? { ...p, employeeId: newPlan.employeeId, title: newPlan.title, targetRole: newPlan.targetRole, endDate: newPlan.endDate } : p)));
                setCreateOpen(false);
                setEditingPlan(null);
              }}
            >
              Update Plan
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                // Create new plan in local state (mocked)
                const id = `plan_${Date.now()}`;
                setPlansState((prev) => [
                  ...prev,
                  {
                    id,
                    employeeId: newPlan.employeeId,
                    employeeName: MOCK_DEVELOPMENT_PLANS.find((p) => p.employeeId === newPlan.employeeId)?.employeeName || "Unknown",
                    title: newPlan.title,
                    targetRole: newPlan.targetRole,
                    startDate: new Date().toISOString().split("T")[0],
                    endDate: newPlan.endDate,
                    status: "Active",
                    overallProgress: 0,
                    milestones: [],
                    trainings: [],
                  },
                ]);
                setCreateOpen(false);
              }}
            >
              Create Plan
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
