import Add from "@mui/icons-material/Add";
import PolicyOutlined from "@mui/icons-material/PolicyOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useAdminData } from "../../context/AdminDataContext";
import type { ExpensePolicy } from "../../types";

const weekdayOptions = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export const AdminPoliciesPage = () => {
  const { policies, createPolicy, previewPolicy, isSaving, errorMessage } = useAdminData();
  const [createdInfo, setCreatedInfo] = useState("");
  const [policy, setPolicy] = useState<ExpensePolicy>({
    id: `POL-${Date.now()}`,
    name: "",
    mccCategory: "Travel",
    maxPerTransaction: 10000,
    maxPerMonth: 40000,
    allowedDays: [1, 2, 3, 4, 5],
    scopeType: "all",
    scopeValue: "",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: "",
    active: true,
  });

  const preview = useMemo(() => previewPolicy(policy), [policy, previewPolicy]);

  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <PolicyOutlined color="primary" />
            <Typography variant="h5" fontWeight={800}>
              Expense Policy Configuration
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Configure multi-policy rules with scope, effective date range, and preview impact before activation.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1.5}>
            Create policy
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
            <TextField label="Policy name" value={policy.name} onChange={(e) => setPolicy({ ...policy, name: e.target.value })} />
            <TextField label="MCC category" value={policy.mccCategory} onChange={(e) => setPolicy({ ...policy, mccCategory: e.target.value })} />
            <TextField type="number" label="Max per transaction" value={policy.maxPerTransaction} onChange={(e) => setPolicy({ ...policy, maxPerTransaction: Number(e.target.value) })} />
            <TextField type="number" label="Max per month" value={policy.maxPerMonth} onChange={(e) => setPolicy({ ...policy, maxPerMonth: Number(e.target.value) })} />
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1} mt={1}>
            <TextField select label="Scope type" value={policy.scopeType} onChange={(e) => setPolicy({ ...policy, scopeType: e.target.value as ExpensePolicy["scopeType"] })}>
              <MenuItem value="all">All employees</MenuItem>
              <MenuItem value="department">Department</MenuItem>
              <MenuItem value="employee">Individual employee</MenuItem>
            </TextField>
            <TextField label="Scope value" value={policy.scopeValue || ""} onChange={(e) => setPolicy({ ...policy, scopeValue: e.target.value })} />
            <TextField type="date" label="Start date" InputLabelProps={{ shrink: true }} value={policy.startDate} onChange={(e) => setPolicy({ ...policy, startDate: e.target.value })} />
            <TextField type="date" label="End date" InputLabelProps={{ shrink: true }} value={policy.endDate || ""} onChange={(e) => setPolicy({ ...policy, endDate: e.target.value })} />
          </Stack>
          <Stack direction="row" spacing={1} mt={1.2} flexWrap="wrap">
            {weekdayOptions.map((day) => (
              <Chip
                key={day.value}
                clickable
                color={policy.allowedDays.includes(day.value) ? "primary" : "default"}
                label={day.label}
                onClick={() =>
                  setPolicy((prev) => ({
                    ...prev,
                    allowedDays: prev.allowedDays.includes(day.value)
                      ? prev.allowedDays.filter((item) => item !== day.value)
                      : [...prev.allowedDays, day.value],
                  }))
                }
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1} mt={2}>
            <Button
              variant="contained"
              startIcon={<Add />}
              disabled={isSaving}
              onClick={async () => {
                const result = await createPolicy({ ...policy, id: `POL-${Date.now()}` });
                setCreatedInfo(`Policy activated. ${result.matchedCount} historical transactions would have been flagged.`);
              }}
            >
              Activate policy
            </Button>
            <Chip color="warning" label={`Preview matches: ${preview.length}`} />
          </Stack>
          {createdInfo && <Alert sx={{ mt: 1.4 }}>{createdInfo}</Alert>}
          {errorMessage ? <Alert severity="error" sx={{ mt: 1.2 }}>{errorMessage}</Alert> : null}
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Active policies
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>MCC category</TableCell>
                <TableCell>Scope</TableCell>
                <TableCell>Caps</TableCell>
                <TableCell>Effective range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.mccCategory}</TableCell>
                  <TableCell>{item.scopeType === "all" ? "All" : `${item.scopeType}: ${item.scopeValue}`}</TableCell>
                  <TableCell>
                    Rs.{item.maxPerTransaction} / Rs.{item.maxPerMonth}
                  </TableCell>
                  <TableCell>
                    {item.startDate} to {item.endDate || "Open-ended"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              Conflict resolution mode: most restrictive policy wins.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
};
