import CloudUpload from "@mui/icons-material/CloudUpload";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useAdminData } from "../../context/AdminDataContext";

export const AdminEmployeesPage = () => {
  const { employees, addEmployeesFromCsv, inviteEmployee, manageDepartment, isSaving, errorMessage } = useAdminData();
  const [csv, setCsv] = useState("employee ID,name,email,department,role\nEMP-9001,New User,new.user@allpay.in,Finance,employee");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDepartment, setInviteDepartment] = useState("Finance");
  const [department, setDepartment] = useState("New Department");
  const [departmentNext, setDepartmentNext] = useState("Renamed Department");
  const [info, setInfo] = useState("");

  const departments = useMemo(() => Array.from(new Set(employees.map((emp) => emp.department))), [employees]);

  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <GroupOutlined color="primary" />
            <Typography variant="h5" fontWeight={800}>
              Employee Management
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Add new joiners, deactivate leavers, and manage departments while retaining historical records.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Bulk import via CSV
          </Typography>
          <TextField
            multiline
            minRows={4}
            fullWidth
            value={csv}
            onChange={(event) => setCsv(event.target.value)}
          />
          <Stack direction="row" spacing={1} mt={1.2}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              disabled={isSaving}
              onClick={async () => {
                const count = await addEmployeesFromCsv(csv);
                setInfo(`Imported ${count} employees successfully.`);
              }}
            >
              Import CSV
            </Button>
            <TextField size="small" label="Invite email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} />
            <TextField size="small" label="Department" value={inviteDepartment} onChange={(event) => setInviteDepartment(event.target.value)} />
            <Button
              variant="outlined"
              disabled={isSaving || !inviteEmail}
              onClick={async () => {
                await inviteEmployee(inviteEmail, inviteDepartment);
                setInfo(`Invitation sent to ${inviteEmail}.`);
              }}
            >
              Invite employee
            </Button>
          </Stack>
          {info && <Alert sx={{ mt: 1.2 }}>{info}</Alert>}
          {errorMessage ? <Alert severity="error" sx={{ mt: 1.2 }}>{errorMessage}</Alert> : null}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Department controls
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField size="small" label="Department" value={department} onChange={(event) => setDepartment(event.target.value)} />
            <TextField size="small" label="Rename to" value={departmentNext} onChange={(event) => setDepartmentNext(event.target.value)} />
            <Button variant="outlined" onClick={() => manageDepartment("create", department)}>
              Create
            </Button>
            <Button variant="outlined" onClick={() => manageDepartment("rename", department, departmentNext)}>
              Rename
            </Button>
            <Button variant="outlined" color="error" onClick={() => manageDepartment("delete", department)}>
              Delete
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} mt={1.2} flexWrap="wrap">
            {departments.map((dep) => (
              <Chip key={dep} label={dep} />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Employee onboarding status
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Onboarding</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.slice(0, 80).map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>
                    <Chip size="small" color={emp.active ? "success" : "default"} label={emp.active ? "Active" : "Deactivated"} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={emp.onboarded ? "primary" : "warning"} label={emp.onboarded ? "Completed" : "Pending"} />
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
