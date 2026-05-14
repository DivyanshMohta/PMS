import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Tooltip,
  InputBase,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 256;

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/",
    roles: ["Admin", "HR", "Manager", "Employee"],
  },
  {
    label: "My Performance",
    icon: <AssessmentIcon />,
    path: "/my-performance",
    roles: ["Admin", "HR", "Manager", "Employee"],
  },
  {
    label: "Team Management",
    icon: <GroupIcon />,
    path: "/team",
    roles: ["Admin", "HR", "Manager"],
  },
  {
    label: "Development Plans",
    icon: <SchoolIcon />,
    path: "/development",
    roles: ["Admin", "HR", "Manager", "Employee"],
  },
  {
    label: "Competency Dictionary",
    icon: <MenuBookIcon />,
    path: "/competencies",
    roles: ["Admin"],
  },
];

export default function DashboardLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchVal, setSearchVal] = useState("");

  const visibleNav = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => hasRole(r as never)),
  );

  const roleColor: Record<string, string> = {
    Admin: "#ef4444",
    HR: "#f59e0b",
    Manager: "#10b981",
    Employee: "#0ea5e9",
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: "linear-gradient(135deg, #1a3a5c 0%, #2d5f8a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
            H
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#0f172a", lineHeight: 1 }}
          >
            HRMS
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            Performance Platform
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mx: 2, mb: 1 }} />
      <List sx={{ px: 1.5, flex: 1 }}>
        {visibleNav.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, rgba(26,58,92,0.1) 0%, rgba(45,95,138,0.08) 100%)",
                    borderLeft: "3px solid #1a3a5c",
                    pl: "13px",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ minWidth: 36, color: active ? "#1a3a5c" : "#64748b" }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        color: active ? "#1a3a5c" : "#475569",
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "#f8fafc",
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#1a3a5c",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user?.avatar}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "#0f172a",
                display: "block",
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 600,
                bgcolor: roleColor[user?.role || "Employee"] + "20",
                color: roleColor[user?.role || "Employee"],
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: "#fff",
              border: "none",
              boxShadow: "1px 0 0 #e2e8f0",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main */}
      <Box
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            borderBottom: "1px solid #e2e8f0",
            zIndex: theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ color: "#475569" }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f1f5f9",
                borderRadius: 2,
                px: 2,
                py: 0.75,
                gap: 1,
                flex: 1,
                maxWidth: 400,
              }}
            >
              <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
              <InputBase
                placeholder="Search employees, reviews..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                sx={{
                  fontSize: 14,
                  color: "#0f172a",
                  "& input::placeholder": { color: "#94a3b8" },
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Notifications">
              <IconButton sx={{ color: "#475569" }}>
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                borderRadius: 2,
                px: 1,
                py: 0.5,
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
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
                {user?.avatar}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "#0f172a",
                    display: "block",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontSize: 11 }}
                >
                  {user?.title}
                </Typography>
              </Box>
              <KeyboardArrowDownIcon sx={{ color: "#94a3b8", fontSize: 16 }} />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} /> My Profile
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                  setAnchorEl(null);
                }}
                sx={{ color: "#ef4444" }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
