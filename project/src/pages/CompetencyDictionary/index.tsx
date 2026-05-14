import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import { MOCK_COMPETENCIES, Competency } from "../../mock/data";

const CATEGORY_COLOR: Record<string, string> = {
  Technical: "#0ea5e9",
  Core: "#10b981",
  Leadership: "#1a3a5c",
};

const LEVEL_COLORS = ["#94a3b8", "#f59e0b", "#0ea5e9", "#10b981"];

function CompetencyCard({
  comp,
  onEdit,
  onDelete,
}: {
  comp: Competency;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
            >
              {comp.name}
            </Typography>
            <Chip
              label={comp.category}
              size="small"
              sx={{
                bgcolor: CATEGORY_COLOR[comp.category] + "20",
                color: CATEGORY_COLOR[comp.category],
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={onEdit}
                sx={{
                  color: "#64748b",
                  "&:hover": { color: "#1a3a5c", bgcolor: "#1a3a5c10" },
                }}
              >
                <EditIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  color: "#64748b",
                  "&:hover": { color: "#ef4444", bgcolor: "#ef444410" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: "#64748b", mb: 2, fontSize: 13, lineHeight: 1.6 }}
        >
          {comp.description}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            display: "block",
            mb: 1,
          }}
        >
          Proficiency Levels
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          {comp.levels.map((l) => (
            <Box
              key={l.level}
              sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: LEVEL_COLORS[l.level - 1] + "20",
                  color: LEVEL_COLORS[l.level - 1],
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, fontSize: 11 }}
                >
                  {l.level}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "#0f172a", display: "block" }}
                >
                  {l.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  {l.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {comp.applicableRoles[0] !== "All" && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  display: "block",
                  mb: 0.75,
                }}
              >
                Applicable Roles
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {comp.applicableRoles.map((r) => (
                  <Chip
                    key={r}
                    label={r}
                    size="small"
                    sx={{
                      bgcolor: "#f1f5f9",
                      color: "#475569",
                      fontSize: 10,
                      height: 20,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const EMPTY_COMPETENCY: Omit<Competency, "id"> = {
  name: "",
  category: "Core",
  description: "",
  levels: [
    { level: 1, label: "Foundational", description: "" },
    { level: 2, label: "Developing", description: "" },
    { level: 3, label: "Proficient", description: "" },
    { level: 4, label: "Expert", description: "" },
  ],
  applicableRoles: ["All"],
};

export default function CompetencyDictionaryPage() {
  const [competencies, setCompetencies] =
    useState<Competency[]>(MOCK_COMPETENCIES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Competency | null>(null);
  const [formData, setFormData] =
    useState<Omit<Competency, "id">>(EMPTY_COMPETENCY);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const categories = ["All", "Technical", "Core", "Leadership"];
  const filtered = competencies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || c.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setEditTarget(null);
    setFormData(EMPTY_COMPETENCY);
    setDialogOpen(true);
  };

  const openEdit = (comp: Competency) => {
    setEditTarget(comp);
    setFormData({
      name: comp.name,
      category: comp.category,
      description: comp.description,
      levels: [...comp.levels],
      applicableRoles: [...comp.applicableRoles],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editTarget) {
      setCompetencies((prev) =>
        prev.map((c) =>
          c.id === editTarget.id ? { ...formData, id: editTarget.id } : c,
        ),
      );
    } else {
      setCompetencies((prev) => [
        ...prev,
        { ...formData, id: `c${Date.now()}` },
      ]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCompetencies((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

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
            Competency Dictionary
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Define and manage organizational competencies with 4-level
            proficiency frameworks
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2 }}
        >
          Add Competency
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categories
          .filter((c) => c !== "All")
          .map((cat) => (
            <Grid item xs={6} sm={4} key={cat}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  border: `2px solid ${CATEGORY_COLOR[cat]}30`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: CATEGORY_COLOR[cat] },
                }}
                onClick={() =>
                  setCategoryFilter(cat === categoryFilter ? "All" : cat)
                }
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: CATEGORY_COLOR[cat] }}
                >
                  {competencies.filter((c) => c.category === cat).length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  {cat} Competencies
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
            placeholder="Search competencies..."
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
          <Box sx={{ display: "flex", gap: 1 }}>
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => setCategoryFilter(c)}
                sx={{
                  cursor: "pointer",
                  fontWeight: 600,
                  bgcolor:
                    categoryFilter === c
                      ? (CATEGORY_COLOR[c] || "#1a3a5c") + "20"
                      : "#f1f5f9",
                  color:
                    categoryFilter === c
                      ? CATEGORY_COLOR[c] || "#1a3a5c"
                      : "#64748b",
                  border:
                    categoryFilter === c
                      ? `1px solid ${CATEGORY_COLOR[c] || "#1a3a5c"}40`
                      : "1px solid transparent",
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={2.5}>
        {filtered.map((comp) => (
          <Grid item xs={12} md={6} lg={4} key={comp.id}>
            <CompetencyCard
              comp={comp}
              onEdit={() => openEdit(comp)}
              onDelete={() => setDeleteConfirm(comp.id)}
            />
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                No competencies match your filters
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        paperprops={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editTarget ? "Edit Competency" : "Add New Competency"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Competency Name"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  <MenuItem value="Technical">Technical</MenuItem>
                  <MenuItem value="Core">Core</MenuItem>
                  <MenuItem value="Leadership">Leadership</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1.5, color: "#0f172a" }}
              >
                Proficiency Level Descriptions
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {formData.levels.map((lvl, i) => (
                  <Box
                    key={i}
                    sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 40,
                        borderRadius: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: LEVEL_COLORS[i] + "20",
                        color: LEVEL_COLORS[i],
                        flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                        {lvl.level}
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      label={lvl.label}
                      fullWidth
                      value={lvl.description}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          levels: p.levels.map((l, j) =>
                            j === i ? { ...l, description: e.target.value } : l,
                          ),
                        }))
                      }
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name || !formData.description}
          >
            {editTarget ? "Save Changes" : "Add Competency"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
        paperprops={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#ef4444" }}>
          Delete Competency?
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This will permanently remove the competency from the dictionary. All
            associated review scores will be unlinked.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
