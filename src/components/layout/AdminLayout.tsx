import Menu from "@mui/icons-material/Menu";
import MenuOpen from "@mui/icons-material/MenuOpen";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import AnalyticsOutlined from "@mui/icons-material/AnalyticsOutlined";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import PolicyOutlined from "@mui/icons-material/PolicyOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import Download from "@mui/icons-material/Download";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  LinearProgress,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminData } from "../../context/AdminDataContext";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Home", to: "/", icon: <HomeOutlined /> },
  { label: "Transactions", to: "/admin/transactions", icon: <CreditCardOutlined /> },
  { label: "Policies", to: "/admin/policies", icon: <PolicyOutlined /> },
  { label: "Fraud & Audit", to: "/admin/fraud", icon: <SecurityOutlined /> },
  { label: "Analytics", to: "/admin/analytics", icon: <AnalyticsOutlined /> },
  { label: "Exports", to: "/admin/exports", icon: <Download /> },
  { label: "Employees", to: "/admin/employees", icon: <GroupOutlined /> },
  { label: "Roles", to: "/admin/roles", icon: <AdminPanelSettingsOutlined /> },
  { label: "Alerts", to: "/admin/alerts", icon: <CampaignOutlined /> },
  { label: "Billing", to: "/admin/billing", icon: <DashboardOutlined /> },
];

const drawerWidthExpanded = 254;
const drawerWidthCollapsed = 82;

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isBootstrapping } = useAdminData();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const currentWidth = isDesktop ? (collapsed ? drawerWidthCollapsed : drawerWidthExpanded) : 0;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8f9ff" }}>
      <AppBar
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${currentWidth}px)` },
          ml: { md: `${currentWidth}px` },
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {isBootstrapping ? <LinearProgress /> : null}
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton color="primary" onClick={() => (isDesktop ? setCollapsed((prev) => !prev) : setMobileOpen((prev) => !prev))}>
              {collapsed ? <Menu /> : <MenuOpen />}
            </IconButton>
            <IconButton color="primary" sx={{ display: { xs: "none", md: "inline-flex" } }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>A</Avatar>
            </IconButton>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                allpay Admin Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Finance control plane for UPI spend operations
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" }, maxWidth: 220 }} noWrap>
              {user?.email}
            </Typography>
            <Chip size="small" color="success" label="2FA Enabled" />
            <Chip size="small" color="info" label="Session 30m" />
            <IconButton
              color="default"
              onClick={() => {
                signOut();
                navigate("/", { replace: true });
              }}
              aria-label="Log out"
            >
              <LogoutOutlined />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: currentWidth || drawerWidthExpanded,
          flexShrink: 0,
          display: { xs: "block", md: "block" },
          [`& .MuiDrawer-paper`]: {
            width: currentWidth || drawerWidthExpanded,
            boxSizing: "border-box",
            borderRight: "1px solid #e2e8f0",
            overflowX: "hidden",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: collapsed ? 1.5 : 2, py: 1.2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", textAlign: collapsed ? "center" : "left" }}>
            AP
          </Typography>
          {!collapsed ? (
            <Typography variant="caption" color="text.secondary">
              Admin workspace
            </Typography>
          ) : null}
        </Box>
        <List sx={{ px: 1 }}>
          {navItems.map((item) => {
            const selected = location.pathname === item.to;
            return (
              <ListItemButton
                key={item.label}
                component={RouterLink}
                to={item.to}
                selected={selected}
                onClick={() => setMobileOpen(false)}
                sx={{ mb: 0.5, borderRadius: 2, minHeight: 42, px: collapsed ? 1.25 : 1.5 }}
              >
                <ListItemIcon sx={{ minWidth: 34, mr: collapsed ? 0 : 0.5 }}>{item.icon}</ListItemIcon>
                {!collapsed ? <ListItemText primary={item.label} /> : null}
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
