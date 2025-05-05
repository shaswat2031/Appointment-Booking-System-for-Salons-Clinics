import React, { useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

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

  // Status badge color mapper
  const getStatusBadgeProps = (status) => {
    switch (status?.toLowerCase()) {
      case "cancelled":
        return { variant: "danger", label: "Cancelled" };
      case "done":
        return { variant: "success", label: "Completed" };
      case "pending":
        return { variant: "warning", label: "Pending" };
      default:
        return { variant: "primary", label: "Booked" };
    }
  };

  return (
    <Card
      title="Cancel Your Appointment"
      variant="elevated"
      className="max-w-3xl mx-auto"
    >
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/[^\d+\s()-]/g, ""))
              }
              placeholder="Enter your phone number (e.g. 1234567890)"
              label="Phone Number"
              required
              hint="We'll use this to find your bookings"
              variant="filled"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              }
            />
          </div>
          <div className="md:self-end">
            <Button
              onClick={handleSearch}
              disabled={loading}
              isLoading={loading}
              variant="primary"
              size="lg"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            >
              Search
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          </div>
        )}
      </div>

      {bookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Your Appointments
          </h3>

          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusProps = getStatusBadgeProps(booking.status);

              return (
                <Card
                  key={booking._id}
                  variant="bordered"
                  className="transition-all hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <h4 className="font-semibold text-lg">
                          {booking.service?.name}
                        </h4>
                        <Badge
                          variant={statusProps.variant}
                          rounded="full"
                          className="ml-2"
                        >
                          {statusProps.label}
                        </Badge>
                      </div>

                      <div className="text-gray-600 space-y-1">
                        <p>
                          <span className="inline-block w-20 font-medium">
                            Date:
                          </span>
                          {format(new Date(booking.appointmentDate), "PPP")}
                        </p>
                        <p>
                          <span className="inline-block w-20 font-medium">
                            Time:
                          </span>
                          {format(new Date(booking.appointmentDate), "p")}
                        </p>
                        <p>
                          <span className="inline-block w-20 font-medium">
                            Name:
                          </span>
                          {booking.customerName}
                        </p>
                        <p>
                          <span className="inline-block w-20 font-medium">
                            Phone:
                          </span>
                          {booking.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Button
                        variant={
                          booking.status === "Cancelled"
                            ? "secondary"
                            : "danger"
                        }
                        disabled={booking.status === "Cancelled"}
                        onClick={() => openCancelDialog(booking._id)}
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                      >
                        {booking.status === "Cancelled"
                          ? "Cancelled"
                          : "Cancel"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card
            title="Confirm Cancellation"
            variant="elevated"
            className="max-w-md w-full animate-fade-in-up"
          >
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setConfirmDialog({ open: false, bookingId: null })
                }
              >
                No, Keep It
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelBooking}
                isLoading={loading}
              >
                Yes, Cancel Appointment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default CancelBooking;
