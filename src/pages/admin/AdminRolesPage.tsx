import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import {
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAdminData } from "../../context/AdminDataContext";

export const AdminRolesPage = () => {
  const { admins, upsertAdmin, toggleAdminActive } = useAdminData();
  const [newAdmin, setNewAdmin] = useState({
    id: "",
    name: "",
    email: "",
    role: "finance_manager",
    active: true,
    twoFactor: true,
  });

  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <AdminPanelSettingsOutlined color="primary" />
            <Typography variant="h5" fontWeight={800}>
              Admin Role Management and Multi-user Access
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Roles supported: Super Admin, Finance Manager, HR Manager, Auditor. 2FA is mandatory for all admin users.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Create / modify admin user
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField label="ID" value={newAdmin.id} onChange={(e) => setNewAdmin({ ...newAdmin, id: e.target.value })} />
            <TextField label="Name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
            <TextField label="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
            <TextField
              select
              SelectProps={{ native: true }}
              label="Role"
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            >
              <option value="super_admin">Super Admin</option>
              <option value="finance_manager">Finance Manager</option>
              <option value="hr_manager">HR Manager</option>
              <option value="auditor">Auditor</option>
            </TextField>
            <Button
              variant="contained"
              onClick={() =>
                upsertAdmin({
                  id: newAdmin.id || `ADM-${Date.now()}`,
                  name: newAdmin.name,
                  email: newAdmin.email,
                  role: newAdmin.role as "super_admin" | "finance_manager" | "hr_manager" | "auditor",
                  active: true,
                  twoFactor: true,
                })
              }
            >
              Save admin
            </Button>
          </Stack>
          <FormControlLabel control={<Switch checked disabled />} label="Mandatory 2FA (TOTP/SMS OTP) enabled" />
          <FormControlLabel control={<Switch checked disabled />} label="Session timeout after 30 min inactivity enabled" />
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Active admin users
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>2FA</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>
                    <Chip icon={<LockOutlined />} size="small" color={admin.twoFactor ? "success" : "error"} label={admin.twoFactor ? "Enabled" : "Disabled"} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={admin.active ? "Active" : "Deactivated"} color={admin.active ? "primary" : "default"} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => toggleAdminActive(admin.id)}>
                      {admin.active ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Stack>
  );
};
