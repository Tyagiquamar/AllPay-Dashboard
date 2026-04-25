import ContentCopy from "@mui/icons-material/ContentCopy";
import Timeline from "@mui/icons-material/Timeline";
import WarningAmber from "@mui/icons-material/WarningAmber";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useAdminData } from "../../context/AdminDataContext";

export const AdminFraudPage = () => {
  const { transactions } = useAdminData();
  const flagged = transactions.filter((item) => item.flags.length);

  return (
    <Stack spacing={2.5}>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center">
            <WarningAmber color="warning" />
            <Typography variant="h5" fontWeight={800}>
              Automated Fraud Detection Flags
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Rule based checks: no allpay match, amount mismatch, category mismatch, duplicate suspect, and off-policy timing.
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Flagged transactions ({flagged.length})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Triggered rules</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flagged.slice(0, 80).map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.employeeName}</TableCell>
                  <TableCell>{tx.merchantName}</TableCell>
                  <TableCell>Rs.{tx.amount.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.6} flexWrap="wrap">
                      {tx.flags.map((flag) => (
                        <Chip key={flag.id} label={flag.reason} size="small" color="warning" />
                      ))}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Audit timeline preview
          </Typography>
          {transactions.slice(0, 1).map((tx) => (
            <Box key={tx.id}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                  {tx.id}
                </Typography>
                <Tooltip title="Copy UPI ref">
                  <Button size="small" startIcon={<ContentCopy />} onClick={() => navigator.clipboard.writeText(tx.upiRefId)}>
                    {tx.upiRefId}
                  </Button>
                </Tooltip>
              </Stack>
              <Divider sx={{ my: 1 }} />
              {tx.timeline.map((event) => (
                <Stack key={event.id} direction="row" spacing={1} alignItems="center" mb={1}>
                  <Timeline color="primary" fontSize="small" />
                  <Typography variant="body2">
                    {event.action} by {event.actor} at {dayjs(event.timestamp).format("DD MMM HH:mm:ss")}
                  </Typography>
                </Stack>
              ))}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Stack>
  );
};
