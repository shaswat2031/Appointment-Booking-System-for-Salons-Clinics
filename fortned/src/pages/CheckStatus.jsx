import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
} from "@mui/material";
import { searchAppointmentsByPhone } from "../services/publicService";
import ContactFooter from "../components/ContactFooter";

const CheckStatus = () => {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setAppointments([]);

    try {
      const response = await searchAppointmentsByPhone(searchValue);
      if (response.data.success) {
        setAppointments(response.data.appointments);
      } else {
        throw new Error(response.data.message || "No appointments found");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch appointment status"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return "#4CAF50";
      case "done":
        return "#4CAF50";
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Check Appointment Status
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Enter your phone number to see all your appointments
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter phone number used for booking"
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchValue || loading}
            sx={{ minWidth: "120px" }}
          >
            {loading ? <CircularProgress size={24} /> : "Search"}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {appointments.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Appointments
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List>
            {appointments.map((appointment) => (
              <ListItem
                key={appointment.id}
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  mb: 2,
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Typography>
                    <strong>Date:</strong>{" "}
                    {new Date(appointment.date).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    <strong>Time:</strong> {appointment.time}
                  </Typography>
                  <Typography>
                    <strong>Service:</strong> {appointment.service}
                  </Typography>
                  <Typography>
                    <strong>Location:</strong> {appointment.vendorName}
                  </Typography>
                  <Typography>
                    <strong>Booking Token:</strong> {appointment.token}
                  </Typography>
                  <Typography>
                    <strong>Status:</strong>{" "}
                    <Box
                      component="span"
                      sx={{
                        color: getStatusColor(appointment.status),
                        fontWeight: "bold",
                        ml: 1,
                      }}
                    >
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </Box>
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {appointments.length === 0 && !loading && !error && (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary">
            No appointments found for this phone number.
          </Typography>
        </Paper>
      )}

      <Box mt={4}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <ContactFooter />
        </Paper>
      </Box>
    </Container>
  );
};

export default CheckStatus;
