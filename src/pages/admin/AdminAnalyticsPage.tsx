import { Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminData } from "../../context/AdminDataContext";

const colors = ["#335CFF", "#5B8CFF", "#94B3FF", "#4ADE80", "#F59E0B", "#EC4899"];

export const AdminAnalyticsPage = () => {
  const { filteredTransactions } = useAdminData();
  const [range, setRange] = useState("30");
  const [drillKey, setDrillKey] = useState("");

  const rangeStart = useMemo(() => dayjs().subtract(Number(range), "day"), [range]);
  const inRange = filteredTransactions.filter((tx) => dayjs(tx.dateTime).isAfter(rangeStart));

  const byCategory = Object.entries(
    inRange.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const byEmployee = Object.entries(
    inRange.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.employeeName] = (acc[tx.employeeName] || 0) + tx.amount;
      return acc;
    }, {}),
  )
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const daily = Object.entries(
    inRange.reduce<Record<string, number>>((acc, tx) => {
      const day = dayjs(tx.dateTime).format("DD MMM");
      acc[day] = (acc[day] || 0) + tx.amount;
      return acc;
    }, {}),
  ).map(([day, value]) => ({ day, value }));

  const approvedSpend = inRange.filter((tx) => tx.status === "approved").reduce((sum, tx) => sum + tx.amount, 0);
  const pendingAmount = inRange.filter((tx) => tx.status === "pending").reduce((sum, tx) => sum + tx.amount, 0);
  const rejectedSaved = inRange.filter((tx) => tx.status === "rejected").reduce((sum, tx) => sum + tx.amount, 0);
  const flaggedCount = inRange.filter((tx) => tx.flags.length).length;

  const drilled = inRange.filter((tx) => !drillKey || tx.category === drillKey || tx.employeeName === drillKey);

  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1.2} justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight={800}>
              Spend Analytics by Category and Employee
            </Typography>
            <TextField select size="small" value={range} onChange={(e) => setRange(e.target.value)}>
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Current quarter</MenuItem>
            </TextField>
          </Stack>
          <Typography color="text.secondary">
            Data updates instantly when date range changes, without full page reload.
          </Typography>
        </CardContent>
      </Card>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
        <Card sx={{ flex: 1, borderRadius: 3 }}><CardContent><Typography variant="caption">Approved Spend</Typography><Typography variant="h6">Rs.{approvedSpend.toLocaleString("en-IN")}</Typography></CardContent></Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}><CardContent><Typography variant="caption">Pending</Typography><Typography variant="h6">Rs.{pendingAmount.toLocaleString("en-IN")}</Typography></CardContent></Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}><CardContent><Typography variant="caption">Rejected Savings</Typography><Typography variant="h6">Rs.{rejectedSaved.toLocaleString("en-IN")}</Typography></CardContent></Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}><CardContent><Typography variant="caption">Flagged Transactions</Typography><Typography variant="h6">{flaggedCount}</Typography></CardContent></Card>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography fontWeight={700}>Donut: spend by MCC category</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} onClick={(entry) => setDrillKey((entry as { name: string }).name)}>
                  {byCategory.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Typography fontWeight={700}>Bar: spend per employee</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byEmployee}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#335CFF" onClick={(entry) => setDrillKey((entry as { name: string }).name)} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700}>Line: daily spend trend</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={daily}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <Typography variant="body2" color="text.secondary">
            Drilldown {drillKey ? `active for "${drillKey}"` : "inactive"} | Matching transactions: {drilled.length}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};
