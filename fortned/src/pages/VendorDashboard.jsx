// src/pages/VendorDashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import React from "react";
import ContactFooter from "../components/ContactFooter";
import {
  getVendorBookings,
  toggleOpenStatus,
  updateBookingStatus,
  rescheduleBooking,
  updateBookingCompleted,
  updateTokenNumber,
  updateEstimatedWaitTime,
  notifyCustomerAboutQueue,
} from "../services/vendorService";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  // State variables
  const [vendor, setVendor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleLoading, setToggleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [completedByVendor, setCompletedByVendor] = useState("");
  const [nextClient, setNextClient] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);
  const [bookingToUpdateToken, setBookingToUpdateToken] = useState(null);
  const [newTokenNumber, setNewTokenNumber] = useState("");
  const [currentToken, setCurrentToken] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isEditingWaitTime, setIsEditingWaitTime] = useState(false);
  const [waitTime, setWaitTime] = useState(15); // Default 15 minutes
  const token = localStorage.getItem("vendorToken");
  const navigate = useNavigate();

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const fetchBookings = async () => {
    try {
      setError("");
      const res = await getVendorBookings(token);
      setBookings(res.data.bookings || []);
      setFilteredBookings(res.data.bookings || []);
      setVendor(res.data.vendor || {});

      const pendingBookings = (res.data.bookings || [])
        .filter((b) => b.status === "booked" && !b.completed)
        .sort((a, b) => a.token - b.token);

      if (pendingBookings.length > 0) {
        setCurrentToken(pendingBookings[0]);
        setNextClient(pendingBookings[0]);
        // Set wait time from current booking if available
        setWaitTime(pendingBookings[0].estimatedWaitTime || 15);
      } else {
        setCurrentToken(null);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err.message);
      setError("Failed to fetch bookings. Please try again later.");

      if (err.response && err.response.status === 401) {
        localStorage.removeItem("vendorToken");
        navigate("/vendor/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update filtered bookings when status filter or date changes
  useEffect(() => {
    if (bookings.length === 0) return;

    // First filter by date
    const dateFilteredBookings = bookings.filter(
      (booking) => booking.date === selectedDate
    );

    // Then apply status filter
    if (filterStatus === "all") {
      setFilteredBookings(dateFilteredBookings);
    } else if (filterStatus === "pending") {
      setFilteredBookings(
        dateFilteredBookings.filter(
          (b) => b.status === "booked" && !b.completed
        )
      );
    } else if (filterStatus === "completed") {
      setFilteredBookings(
        dateFilteredBookings.filter((b) => b.status === "done" || b.completed)
      );
    } else {
      setFilteredBookings(
        dateFilteredBookings.filter((b) => b.status === filterStatus)
      );
    }
  }, [filterStatus, bookings, selectedDate]);

  const handleToggleShop = async () => {
    setToggleLoading(true);
    try {
      setError(null);
      const res = await toggleOpenStatus(token);

      if (res.data && res.data.isOpen !== undefined) {
        setVendor((prev) => ({ ...prev, isOpen: res.data.isOpen }));
        showNotification(
          `Shop is now ${res.data.isOpen ? "open" : "closed"} for bookings`
        );
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Toggle failed", err);
      setError("Failed to update shop status. Please try again.");

      if (err.response && err.response.status === 401) {
        localStorage.removeItem("vendorToken");
        navigate("/vendor/login");
      }
    } finally {
      setToggleLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, status, completedBy = "") => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: status }));
    try {
      setError(null);
      await updateBookingStatus(token, bookingId, status);

      if (status === "done" && completedBy) {
        await updateBookingCompleted(token, bookingId, true, completedBy);
      }

      await fetchBookings();
      showNotification(
        `Booking ${
          status === "done"
            ? "completed"
            : status === "cancelled"
            ? "cancelled"
            : "updated"
        } successfully`
      );

      if (status === "done") {
        const updatedBookings = await getVendorBookings(token);
        const bookedAppointments = updatedBookings.data.bookings
          .filter((b) => b.status === "booked" && !b.completed)
          .sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;
            return a.token - b.token; // Sort by token number, not time
          });

        if (bookedAppointments.length > 0) {
          setNextClient(bookedAppointments[0]);
          setCurrentToken(bookedAppointments[0]);
          setWaitTime(bookedAppointments[0].estimatedWaitTime || 15);
        } else {
          setCurrentToken(null);
        }
      }
    } catch (err) {
      console.error(`Failed to change status to ${status}`, err);
      setError(`Failed to update appointment status. Please try again.`);

      if (err.response && err.response.status === 401) {
        localStorage.removeItem("vendorToken");
        navigate("/vendor/login");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleCompleteWithVendor = (bookingId) => {
    // Validate and use the vendor name
    const vendorName = completedByVendor || vendor?.name || "Staff";
    handleStatusChange(bookingId, "done", vendorName);
    setCompletedByVendor(""); // Reset the completedByVendor after using it
  };

  const handleRescheduleClick = (booking) => {
    setReschedulingBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingBooking) return;

    // Enhanced validation for date and time
    if (!newDate) {
      setError("Please select a date for rescheduling.");
      return;
    }

    if (!newTime) {
      setError("Please select a time for rescheduling.");
      return;
    }

    // Check that the new date is not in the past
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Cannot reschedule to a past date.");
      return;
    }

    setActionLoading((prev) => ({
      ...prev,
      [reschedulingBooking._id]: "reschedule",
    }));
    try {
      setError(null);
      await rescheduleBooking(token, reschedulingBooking._id, newDate, newTime);
      setReschedulingBooking(null);
      fetchBookings();
      showNotification("Appointment rescheduled successfully");
    } catch (err) {
      console.error("Failed to reschedule", err);
      setError("Failed to reschedule appointment. Please try again.");
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("vendorToken");
        navigate("/vendor/login");
      }
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [reschedulingBooking._id]: null,
      }));
    }
  };

  const cancelReschedule = () => {
    setReschedulingBooking(null);
  };

  const openTokenUpdate = (booking) => {
    setBookingToUpdateToken(booking);
    setNewTokenNumber(booking.token);
    setIsUpdatingToken(true);
  };

  const handleTokenUpdate = async () => {
    if (!bookingToUpdateToken) return;

    // Validate token number
    if (!newTokenNumber || newTokenNumber < 1) {
      setError("Please enter a valid token number (greater than 0)");
      return;
    }

    setActionLoading((prev) => ({
      ...prev,
      [bookingToUpdateToken._id]: "token",
    }));
    try {
      await updateTokenNumber(token, bookingToUpdateToken._id, newTokenNumber);
      setIsUpdatingToken(false);
      setBookingToUpdateToken(null);
      setNewTokenNumber("");
      await fetchBookings();
      showNotification("Token number updated successfully");
    } catch (err) {
      console.error("Failed to update token number", err);
      setError(
        err.response?.data?.message ||
          "Failed to update token number. Please try again."
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [bookingToUpdateToken._id]: null,
      }));
    }
  };

  const cancelTokenUpdate = () => {
    setIsUpdatingToken(false);
    setBookingToUpdateToken(null);
    setNewTokenNumber("");
  };

  const handleNextBooking = () => {
    if (!currentToken) return;

    // Use the current vendor name if none specified
    if (!completedByVendor) {
      setCompletedByVendor(vendor?.name || "Staff");
    }
    handleCompleteWithVendor(currentToken._id);
  };

  const handleWaitTimeChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWaitTime(value);
    }
  };

  const saveWaitTime = async () => {
    if (!currentToken) return;

    setActionLoading((prev) => ({ ...prev, [currentToken._id]: "wait-time" }));
    try {
      await updateEstimatedWaitTime(token, currentToken._id, waitTime);
      setIsEditingWaitTime(false);
      showNotification("Wait time updated successfully");
      fetchBookings();
    } catch (err) {
      console.error("Failed to update wait time", err);
      setError("Failed to update estimated wait time");
    } finally {
      setActionLoading((prev) => ({ ...prev, [currentToken._id]: null }));
    }
  };

  const handleNotifyCustomer = async (bookingId) => {
    setActionLoading((prev) => ({ ...prev, [bookingId]: "notify" }));
    try {
      await notifyCustomerAboutQueue(token, bookingId);
      showNotification("Customer has been notified about their queue position");
    } catch (err) {
      console.error("Failed to notify customer", err);
      setError("Failed to send notification to customer");
    } finally {
      setActionLoading((prev) => ({ ...prev, [bookingId]: null }));
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/vendor/login");
      return;
    }
    fetchBookings();
  }, [token, navigate]);

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}

        {notification.show && (
          <div
            className={`mb-4 p-3 ${
              notification.type === "success"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-red-100 text-red-700 border-red-200"
            } border rounded transition-opacity duration-300`}
          >
            {notification.message}
          </div>
        )}

        {currentToken && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">Now Serving</h2>
                  <span className="bg-blue-800 text-white text-sm px-3 py-1 rounded-full">
                    {new Date(currentToken.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-white text-blue-700 text-5xl md:text-7xl font-bold rounded-lg w-32 h-32 flex items-center justify-center shadow-lg border-4 border-blue-200 animate-pulse">
                      #{currentToken.token}
                    </div>

                    <div className="ml-6 text-white">
                      <p className="text-xl md:text-2xl font-semibold">
                        {currentToken.customerName || "Client"}
                      </p>
                      <p className="text-lg">
                        <span className="opacity-75">Phone:</span>{" "}
                        {currentToken.customerPhone}
                      </p>
                      <p className="text-lg">
                        <span className="opacity-75">Service:</span>{" "}
                        {currentToken.serviceName}
                      </p>
                      <p className="text-lg">
                        <span className="opacity-75">Time:</span>{" "}
                        {currentToken.time}
                      </p>
                      <p className="text-lg">
                        <span className="opacity-75">Estimated Wait:</span>
                        {isEditingWaitTime ? (
                          <div className="inline-flex items-center">
                            <input
                              type="number"
                              value={waitTime}
                              onChange={handleWaitTimeChange}
                              className="w-16 border rounded px-2 py-1 mr-2 text-gray-800"
                              min="1"
                            />
                            <span className="mr-2">min</span>
                            <button
                              className="text-green-600 hover:text-green-800 mr-2"
                              onClick={saveWaitTime}
                              disabled={
                                actionLoading[currentToken._id] === "wait-time"
                              }
                            >
                              ✓
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setIsEditingWaitTime(false)}
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span>
                            {currentToken.estimatedWaitTime || waitTime} min
                            <button
                              onClick={() => setIsEditingWaitTime(true)}
                              className="ml-2 text-blue-300 hover:text-blue-100"
                              disabled={actionLoading[currentToken._id]}
                            >
                              ✎
                            </button>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleNextBooking}
                      className="bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-3 rounded-md shadow-md transition duration-200 flex items-center justify-center gap-2"
                      disabled={actionLoading[currentToken._id]}
                    >
                      {actionLoading[currentToken._id] ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Complete & Next
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleNotifyCustomer(currentToken._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition duration-200"
                      disabled={actionLoading[currentToken._id] === "notify"}
                    >
                      {actionLoading[currentToken._id] === "notify"
                        ? "Sending..."
                        : "Notify Customer"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openTokenUpdate(currentToken)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow transition duration-200 flex-1"
                      >
                        Edit Token
                      </button>

                      <button
                        onClick={() => handleRescheduleClick(currentToken)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow transition duration-200 flex-1"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-2 bg-blue-800">
                <div className="h-full bg-green-400 w-1/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {!currentToken && !loading && (
          <div className="mb-8 bg-gradient-to-r from-gray-100 to-gray-200 border-l-4 border-gray-400 p-8 rounded-lg shadow-md text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 text-gray-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              No Active Tokens
            </h2>
            <p className="text-gray-600">
              There are no customers currently waiting to be served.
            </p>
          </div>
        )}

        {vendor && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-semibold mb-2">{vendor.name}</h2>
                <p className="text-gray-600">{vendor.email}</p>
                {vendor.phone && (
                  <p className="text-gray-600">{vendor.phone}</p>
                )}
                <p className="text-gray-600">
                  {vendor.location || "No address provided"}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center mb-3">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      vendor.isOpen ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span
                    className={`font-medium ${
                      vendor.isOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {vendor.isOpen
                      ? "Open for Bookings"
                      : "Closed for Bookings"}
                  </span>
                </div>

                <button
                  className={`px-4 py-2 rounded-md ${
                    toggleLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : vendor.isOpen
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white transition-colors duration-200 shadow-sm`}
                  onClick={handleToggleShop}
                  disabled={toggleLoading}
                >
                  {toggleLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <span>{vendor.isOpen ? "Close Shop" : "Open Shop"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-4 mb-6">
          <div>
            <label
              htmlFor="dateFilter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Date
            </label>
            <input
              type="date"
              id="dateFilter"
              className="border border-gray-300 rounded-md p-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex bg-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 text-sm ${
                  filterStatus === "all"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1 text-sm ${
                  filterStatus === "pending"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>

              <button
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1 text-sm ${
                  filterStatus === "completed"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-2 text-gray-500">Loading bookings...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">
              No bookings found for the selected date and filter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className={`p-4 border rounded-lg shadow-sm transition ${
                  booking.status === "booked" && !booking.completed
                    ? "bg-white"
                    : booking.status === "done"
                    ? "bg-green-50 border-green-200"
                    : booking.status === "cancelled"
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">
                      {booking.customerName || "Anonymous Client"}
                    </h3>
                    <p>
                      <strong className="inline-block w-20">Phone:</strong>{" "}
                      {booking.customerPhone}
                    </p>
                    <p>
                      <strong className="inline-block w-20">Service:</strong>{" "}
                      {booking.serviceName}
                    </p>
                    <p>
                      <strong className="inline-block w-20">Date:</strong>{" "}
                      {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong className="inline-block w-20">Time:</strong>{" "}
                      {booking.time}
                    </p>
                    <p>
                      <strong className="inline-block w-20">Token:</strong>
                      <span className="font-bold text-blue-700">
                        #{booking.token}
                      </span>
                      <button
                        onClick={() => openTokenUpdate(booking)}
                        className="ml-2 text-blue-500 hover:text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded"
                      >
                        Edit
                      </button>
                    </p>
                    {booking.completedBy && (
                      <p>
                        <strong className="inline-block w-20">Done by:</strong>{" "}
                        {booking.completedBy}
                      </p>
                    )}
                    {booking.notes && (
                      <p>
                        <strong className="inline-block w-20">Notes:</strong>{" "}
                        {booking.notes}
                      </p>
                    )}
                    <p>
                      <strong className="inline-block w-20">Status:</strong>{" "}
                      <span
                        className={`capitalize font-medium px-2 py-0.5 rounded-full text-xs ${
                          booking.status === "booked"
                            ? "bg-blue-100 text-blue-800"
                            : booking.status === "done"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {booking.status === "booked" && (
                      <>
                        <button
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1 min-w-[120px]"
                          onClick={() => handleCompleteWithVendor(booking._id)}
                          disabled={actionLoading[booking._id]}
                        >
                          {actionLoading[booking._id] === "done" ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Mark Complete
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleNotifyCustomer(booking._id)}
                          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition"
                          disabled={actionLoading[booking._id] === "notify"}
                        >
                          {actionLoading[booking._id] === "notify"
                            ? "Sending..."
                            : "Notify Customer"}
                        </button>

                        <button
                          className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1"
                          onClick={() => handleRescheduleClick(booking)}
                          disabled={actionLoading[booking._id]}
                        >
                          {actionLoading[booking._id] === "reschedule"
                            ? "Processing..."
                            : "Reschedule"}
                        </button>

                        <button
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1"
                          onClick={() =>
                            handleStatusChange(booking._id, "cancelled")
                          }
                          disabled={actionLoading[booking._id]}
                        >
                          {actionLoading[booking._id] === "cancelled"
                            ? "Processing..."
                            : "Cancel"}
                        </button>
                      </>
                    )}

                    {booking.status === "done" && (
                      <button
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition flex items-center justify-center gap-1"
                        onClick={() =>
                          handleStatusChange(booking._id, "booked")
                        }
                        disabled={actionLoading[booking._id]}
                      >
                        {actionLoading[booking._id] === "booked"
                          ? "Processing..."
                          : "Reopen Booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reschedulingBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-2">
                Reschedule Appointment
              </h3>
              <p className="mb-4 text-gray-600">
                Rescheduling appointment for{" "}
                {reschedulingBooking.customerName ||
                  reschedulingBooking.customerPhone}
              </p>

              <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
                <p>
                  <strong>Current Date:</strong> {reschedulingBooking.date}
                </p>
                <p>
                  <strong>Current Time:</strong> {reschedulingBooking.time}
                </p>
                <p>
                  <strong>Service:</strong> {reschedulingBooking.serviceName}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={cancelReschedule}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleRescheduleSubmit}
                  disabled={actionLoading[reschedulingBooking._id]}
                >
                  {actionLoading[reschedulingBooking._id]
                    ? "Saving..."
                    : "Confirm Reschedule"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isUpdatingToken && bookingToUpdateToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                Update Token Number
              </h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Token Number
                </label>
                <input
                  type="number"
                  value={newTokenNumber}
                  onChange={(e) => setNewTokenNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  min="1"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={cancelTokenUpdate}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleTokenUpdate}
                  disabled={actionLoading[bookingToUpdateToken._id]}
                >
                  {actionLoading[bookingToUpdateToken._id]
                    ? "Saving..."
                    : "Update Token"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VendorDashboard;
