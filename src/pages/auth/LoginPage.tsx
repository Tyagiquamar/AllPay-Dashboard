import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AnnouncementBar } from "../../components/marketing/AnnouncementBar";
import { MarketingHeader } from "../../components/marketing/MarketingHeader";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { signIn, user, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin/transactions";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (user) navigate("/admin/transactions", { replace: true });
  }, [isReady, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(from.startsWith("/admin") ? from : "/admin/transactions", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff" }}>
      <AnnouncementBar />
      <MarketingHeader />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: "1px solid #eef2f6", borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Log in to allpay
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Use the work email and password you set during company signup.
          </Typography>
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Work email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
              />
              <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ textTransform: "none", mt: 1, bgcolor: "#5A58F2" }}>
                {loading ? "Signing in…" : "Log in"}
              </Button>
            </Stack>
          </Box>
          <Typography sx={{ mt: 3 }} color="text.secondary">
            New to allpay?{" "}
            <Link component={RouterLink} to="/signup" fontWeight={700}>
              Sign up your company
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
