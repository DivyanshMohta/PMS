import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import StarIcon from "@mui/icons-material/Star";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { RadarChart, BarChart } from "@mui/x-charts";
import { useAuth } from "../../context/AuthContext";
import {
  MOCK_REVIEWS,
  MOCK_DEVELOPMENT_PLANS,
  PERFORMANCE_HISTORY,
  MOCK_USERS,
} from "../../mock/data";

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: color + "12",
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: color + "18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                color: "#10b981",
                bgcolor: "#10b98115",
                px: 1,
                py: 0.3,
                borderRadius: 4,
              }}
            >
              <ArrowUpwardIcon sx={{ fontSize: 13 }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontSize: 11 }}
              >
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#0f172a", mb: 0.3 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
          {sub}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("H2 2024");

  const myReview =
    MOCK_REVIEWS.find(
      (r) => r.employeeId === user?.id && r.period === selectedPeriod,
    ) || MOCK_REVIEWS[0];
  const myPlan =
    MOCK_DEVELOPMENT_PLANS.find((p) => p.employeeId === user?.id) ||
    MOCK_DEVELOPMENT_PLANS[0];

  const completedReviews = MOCK_REVIEWS.filter(
    (r) => r.status === "Completed" || r.status === "Acknowledged",
  ).length;
  const inProgress = MOCK_REVIEWS.filter(
    (r) => r.status === "In Progress",
  ).length;
  const activeEmployees = MOCK_USERS.filter(
    (u) => u.role === "Employee",
  ).length;

  const radarSeries = [
    {
      label: "Current Level",
      data: myReview.competencyScores.map((c) => c.current),
      color: "#0ea5e9",
    },
    {
      label: "Target Level",
      data: myReview.competencyScores.map((c) => c.target),
      color: "#1a3a5c",
    },
  ];

  const recentActivity = [
    {
      user: "Sarah Williams",
      action: "completed review for James Okafor",
      time: "2h ago",
      color: "#10b981",
    },
    {
      user: "HR Team",
      action: "launched H2 2024 review cycle",
      time: "1d ago",
      color: "#0ea5e9",
    },
    {
      user: "James Okafor",
      action: "updated development plan milestones",
      time: "2d ago",
      color: "#f59e0b",
    },
    {
      user: "Priya Sharma",
      action: "enrolled in TypeScript Deep Dive",
      time: "3d ago",
      color: "#8b5cf6",
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
            {user?.name?.split(" ")[0]}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Here's what's happening with your team today
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Review Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Review Period"
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value="H2 2024">H2 2024</MenuItem>
            <MenuItem value="H1 2024">H1 2024</MenuItem>
            <MenuItem value="H2 2023">H2 2023</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {hasRole("Admin", "HR", "Manager") && (
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Active Employees"
              value={String(activeEmployees)}
              sub="Across all departments"
              icon={<GroupIcon />}
              color="#1a3a5c"
              trend="+2 this month"
            />
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sm={6}
          lg={hasRole("Admin", "HR", "Manager") ? 3 : 4}
        >
          <StatCard
            title="Reviews Completed"
            value={String(completedReviews)}
            sub={selectedPeriod}
            icon={<AssignmentIcon />}
            color="#10b981"
            trend="75%"
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          lg={hasRole("Admin", "HR", "Manager") ? 3 : 4}
        >
          <StatCard
            title="In Progress"
            value={String(inProgress)}
            sub="Awaiting submission"
            icon={<TrendingUpIcon />}
            color="#f59e0b"
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          lg={hasRole("Admin", "HR", "Manager") ? 3 : 4}
        >
          <StatCard
            title="Avg. Score"
            value="4.0"
            sub={`Team average ${selectedPeriod}`}
            icon={<StarIcon />}
            color="#0ea5e9"
            trend="+0.4"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {/* Radar Chart */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a" }}
              >
                Competency Mapping
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Current skill level vs. target role level
              </Typography>
            </Box>
            <RadarChart
              height={300}
              series={radarSeries}
              radar={{
                max: 4,
                metrics: myReview.competencyScores.map((c) => c.name),
              }}
              sx={{ "& .MuiChartsLegend-root": { mt: 1 } }}
            />
          </Paper>
        </Grid>

        {/* Performance History Bar Chart */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a" }}
              >
                Performance Score History
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Trend over review periods
              </Typography>
            </Box>
            <BarChart
              height={300}
              series={[
                {
                  data: PERFORMANCE_HISTORY.map((h) => h.score),
                  label: "Overall Score",
                  color: "#1a3a5c",
                },
              ]}
              xAxis={[
                {
                  data: PERFORMANCE_HISTORY.map((h) => h.period),
                  scaleType: "band",
                },
              ]}
              yAxis={[{ min: 0, max: 5 }]}
            />
          </Paper>
        </Grid>

        {/* Active Goals */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}
            >
              Active Goals
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {myReview.goals.map((goal) => (
                <Box key={goal.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.75,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#0f172a", flex: 1, mr: 1 }}
                    >
                      {goal.title}
                    </Typography>
                    <Chip
                      label={goal.status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 600,
                        bgcolor:
                          goal.status === "Completed"
                            ? "#10b98120"
                            : goal.status === "In Progress"
                              ? "#0ea5e920"
                              : goal.status === "At Risk"
                                ? "#ef444420"
                                : "#94a3b820",
                        color:
                          goal.status === "Completed"
                            ? "#10b981"
                            : goal.status === "In Progress"
                              ? "#0ea5e9"
                              : goal.status === "At Risk"
                                ? "#ef4444"
                                : "#94a3b8",
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#f1f5f9",
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            goal.progress === 100 ? "#10b981" : "#0ea5e9",
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", minWidth: 32, fontWeight: 600 }}
                    >
                      {goal.progress}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Development Plan Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a" }}
              >
                Development Plan
              </Typography>
              <Chip
                label={myPlan.status}
                size="small"
                sx={{ bgcolor: "#10b98120", color: "#10b981", fontWeight: 600 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#0f172a" }}
              >
                {myPlan.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Target: {myPlan.targetRole}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}
              >
                <LinearProgress
                  variant="determinate"
                  value={myPlan.overallProgress}
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "#f1f5f9",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#1a3a5c",
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#1a3a5c", minWidth: 36 }}
                >
                  {myPlan.overallProgress}%
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "#475569",
                mb: 1.5,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Milestones
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {myPlan.milestones.slice(0, 4).map((m) => (
                <Box
                  key={m.id}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 8,
                      color: m.completed ? "#10b981" : "#94a3b8",
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      color: m.completed ? "#64748b" : "#0f172a",
                      textDecoration: m.completed ? "line-through" : "none",
                      fontSize: 13,
                    }}
                  >
                    {m.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#94a3b8", whiteSpace: "nowrap" }}
                  >
                    {m.dueDate}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}
            >
              Recent Activity
            </Typography>
            <List disablePadding>
              {recentActivity.map((item, i) => (
                <React.Fragment key={i}>
                  <ListItem disableGutters sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: item.color + "20",
                          color: item.color,
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {item.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 14,
                            color: "#0f172a",
                            fontWeight: 600,
                          }}
                        >
                          <strong>{item.user}</strong> {item.action}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          component="span"
                          sx={{ fontSize: 12, color: "#94a3b8" }}
                        >
                          {item.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {i < recentActivity.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
