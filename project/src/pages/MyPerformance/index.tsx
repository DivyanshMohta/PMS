import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Divider,
  Rating,
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
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditIcon from "@mui/icons-material/Edit";
import { LineChart } from "@mui/x-charts";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import {
  MOCK_REVIEWS,
  MOCK_FEEDBACK,
  PERFORMANCE_HISTORY,
} from "../../mock/data";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Draft: { bg: "#94a3b820", text: "#64748b" },
  "In Progress": { bg: "#0ea5e920", text: "#0ea5e9" },
  Completed: { bg: "#10b98120", text: "#10b981" },
  Acknowledged: { bg: "#1a3a5c20", text: "#1a3a5c" },
};

export default function MyPerformancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [employeeGoals, setEmployeeGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 2) {
      fetchEmployeeGoals();
    }
  }, [tab, user]);

  const fetchEmployeeGoals = async () => {
    setGoalsLoading(true);
    setGoalsError(null);
    try {
      const res = await apiClient.get("/goals?limit=100");
      setEmployeeGoals(res.data?.items || []);
    } catch (err: any) {
      const msg = typeof err?.response?.data?.detail === "string"
        ? err.response.data.detail
        : err?.message || "Failed to load goals";
      setGoalsError(msg);
    } finally {
      setGoalsLoading(false);
    }
  };

  const myReviews = MOCK_REVIEWS.filter(
    (r) => r.employeeId === (user?.id || "u4"),
  );
  const latestReview = myReviews[0];

  const sentimentColors = {
    positive: "#10b981",
    neutral: "#64748b",
    constructive: "#f59e0b",
  };
  const sentimentLabels = {
    positive: "Positive",
    neutral: "Neutral",
    constructive: "Constructive",
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
          My Performance
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b" }}>
          Track your reviews, goals, and continuous feedback
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTab-root": { fontWeight: 600, fontSize: 13 },
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Tab label="Current Review" />
        <Tab label="Review History" />
        <Tab label="My Goals" />
        <Tab label="Feedback Log" />
      </Tabs>

      {/* Current Review Tab — empty state */}
      {tab === 0 && !latestReview && (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 500 }}>
            No performance review found.
          </Typography>
          <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1 }}>
            Your manager hasn't created a review for you yet.
          </Typography>
        </Paper>
      )}

      {/* Current Review Tab */}
      {tab === 0 && latestReview && (
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#0f172a" }}
                  >
                    {latestReview.period} Performance Review
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Reviewer: {latestReview.reviewerName}
                  </Typography>
                </Box>
                <Chip
                  label={latestReview.status}
                  sx={{
                    ...STATUS_COLORS[latestReview.status],
                    fontWeight: 600,
                  }}
                />
              </Box>
              {latestReview.overallScore > 0 && (
                <Box
                  sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      minWidth: 100,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 800, color: "#1a3a5c" }}
                    >
                      {latestReview.overallScore}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Overall Score
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 0.5,
                      }}
                    >
                      <Rating
                        value={latestReview.overallScore / 1}
                        readOnly
                        precision={0.5}
                        size="small"
                        max={5}
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#475569", fontStyle: "italic" }}
                  >
                    Excellent performance this period. Demonstrates strong
                    technical leadership and mentorship.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}
              >
                Goals Progress
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {latestReview.goals.map((g) => (
                  <Box key={g.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#0f172a" }}
                      >
                        {g.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Weight: {g.weight}%
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#94a3b8", display: "block", mb: 0.75 }}
                    >
                      {g.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={g.progress}
                        sx={{
                          flex: 1,
                          height: 7,
                          borderRadius: 4,
                          bgcolor: "#f1f5f9",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: g.progress === 100 ? "#10b981" : "#0ea5e9",
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: "#475569", minWidth: 32 }}
                      >
                        {g.progress}%
                      </Typography>
                      <Chip
                        label={g.status}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          fontWeight: 600,
                          bgcolor:
                            g.status === "Completed"
                              ? "#10b98120"
                              : "#0ea5e920",
                          color:
                            g.status === "Completed" ? "#10b981" : "#0ea5e9",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}
              >
                Competency Scores
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {latestReview.competencyScores.map((c) => (
                  <Box key={c.competencyId}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#0f172a", fontSize: 13 }}
                      >
                        {c.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Chip
                          label={`Current: ${c.current}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            bgcolor: "#0ea5e920",
                            color: "#0ea5e9",
                            fontWeight: 600,
                          }}
                        />
                        <Chip
                          label={`Target: ${c.target}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            bgcolor: "#1a3a5c20",
                            color: "#1a3a5c",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: "relative",
                        height: 6,
                        bgcolor: "#f1f5f9",
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          height: "100%",
                          width: `${(c.target / 4) * 100}%`,
                          bgcolor: "#1a3a5c20",
                          borderRadius: 3,
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          height: "100%",
                          width: `${(c.current / 4) * 100}%`,
                          bgcolor: "#0ea5e9",
                          borderRadius: 3,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Review History Tab */}
      {tab === 1 && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}
              >
                Performance Score Trend
              </Typography>
              <LineChart
                height={280}
                series={[
                  {
                    data: PERFORMANCE_HISTORY.map((h) => h.score),
                    label: "Score",
                    color: "#1a3a5c",
                    area: true,
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
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#0f172a", mb: 2 }}
              >
                Past Reviews
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {myReviews.map((r) => (
                  <Box
                    key={r.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#0f172a" }}
                      >
                        {r.period}
                      </Typography>
                      <Chip
                        label={r.status}
                        size="small"
                        sx={{
                          ...STATUS_COLORS[r.status],
                          fontWeight: 600,
                          height: 20,
                          fontSize: 10,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {r.overallScore > 0 ? (
                        <>
                          <Rating
                            value={r.overallScore}
                            readOnly
                            precision={0.5}
                            size="small"
                            max={5}
                          />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: "#1a3a5c" }}
                          >
                            {r.overallScore}/5
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Score pending
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Goals Tab — loading */}
      {tab === 2 && goalsLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Goals Tab — error */}
      {tab === 2 && goalsError && !goalsLoading && (
        <Alert severity="error">{goalsError}</Alert>
      )}

      {/* Goals Tab — empty state */}
      {tab === 2 && !goalsLoading && employeeGoals.length === 0 && (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 500 }}>
            No goals yet.
          </Typography>
          <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 1 }}>
            Add your first goal to track your professional development.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/goals")}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Add Your First Goal
          </Button>
        </Paper>
      )}

      {/* Goals Tab */}
      {tab === 2 && !goalsLoading && employeeGoals.length > 0 && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/goals")}
              sx={{ borderRadius: 2 }}
            >
              Add Goal
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Goal</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Progress</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Weight</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>Manager Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeGoals.map((goal) => (
                  <TableRow key={goal._id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a" }}>
                          {goal.title}
                        </Typography>
                        {goal.description && (
                          <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                            {goal.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={goal.status}
                        size="small"
                        sx={{
                          bgcolor: goal.status === "Completed" ? "#10b98120" : "#0ea5e920",
                          color: goal.status === "Completed" ? "#10b981" : "#0ea5e9",
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={goal.progress || 0}
                          sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "#f1f5f9" }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 30 }}>
                          {goal.progress || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(goal.due_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${goal.weight}%`} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {goal.manager_rating ? (
                        <Box>
                          <Rating value={goal.manager_rating} readOnly size="small" />
                          {goal.manager_feedback && (
                            <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                              {goal.manager_feedback}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Pending
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Feedback Log Tab */}
      {tab === 3 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {MOCK_FEEDBACK.map((f) => (
            <Paper key={f.id} sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: sentimentColors[f.sentiment] + "20",
                    color: sentimentColors[f.sentiment],
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {f.from
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#0f172a" }}
                    >
                      {f.from}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip
                        label={sentimentLabels[f.sentiment]}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          fontWeight: 600,
                          bgcolor: sentimentColors[f.sentiment] + "15",
                          color: sentimentColors[f.sentiment],
                        }}
                      />
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        {f.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  >
                    &ldquo;{f.message}&rdquo;
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
