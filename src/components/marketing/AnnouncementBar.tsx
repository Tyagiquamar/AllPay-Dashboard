import { Box, Container, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function AnnouncementBar() {
  return (
    <Box
      sx={{
        bgcolor: "#5b4cdb",
        color: "#fff",
        py: 1,
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          👋 Exciting news! UPI payments are now available in India!{" "}
          <Link component={RouterLink} to="/signup" color="inherit" underline="hover" fontWeight={700}>
            Sign up now →
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
