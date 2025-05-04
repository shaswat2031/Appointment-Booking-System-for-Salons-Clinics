import React, { useState } from "react";
import axios from "axios";
import { format } from "date-fns";

const CancelBooking = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    bookingId: null,
  });

  const handleSearch = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setBookings([]);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/user/${phoneNumber}`
      );
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      if (err.response && err.response.status === 404) {
        setError("No bookings found for this phone number");
      } else {
        setError("An error occurred while fetching your bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const openCancelDialog = (bookingId) => {
    setConfirmDialog({ open: true, bookingId });
  };

  const handleCancelBooking = async () => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/cancel/${confirmDialog.bookingId}`
      );
      setSuccess("Booking cancelled successfully");

      // Update the booking status in the UI
      setBookings(
        bookings.map((booking) =>
          booking._id === confirmDialog.bookingId
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );

      setConfirmDialog({ open: false, bookingId: null });
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Cancel Your Appointment</h4>

      <div>
        <div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 1234567890"
          />
        </div>
        <div>
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search Bookings"}
          </button>
        </div>
      </div>

      {error && <div>{error}</div>}
      {success && <div>{success}</div>}

      {bookings.length > 0 && (
        <>
          <h6>Your Appointments:</h6>

          <div>
            {bookings.map((booking) => (
              <div key={booking._id}>
                <div>
                  <h6>{booking.service.name}</h6>
                  <p>
                    Date: {format(new Date(booking.appointmentDate), "PPP")}
                  </p>
                  <p>Time: {format(new Date(booking.appointmentDate), "p")}</p>
                  <hr />
                  <p>Customer: {booking.customerName}</p>
                  <p>Phone: {booking.phoneNumber}</p>
                  <div>
                    <span>{booking.status}</span>
                  </div>
                </div>
                <div>
                  <button
                    disabled={booking.status === "Cancelled"}
                    onClick={() => openCancelDialog(booking._id)}
                  >
                    {booking.status === "Cancelled"
                      ? "Cancelled"
                      : "Cancel Appointment"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {confirmDialog.open && (
        <div>
          <div>
            <h5>Confirm Cancellation</h5>
            <p>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>
          </div>
          <div>
            <button
              onClick={() => setConfirmDialog({ open: false, bookingId: null })}
            >
              No, Keep It
            </button>
            <button onClick={handleCancelBooking}>
              Yes, Cancel Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelBooking;
