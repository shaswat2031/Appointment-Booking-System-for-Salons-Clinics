// src/pages/CancelAppointment.jsx
import React, { useState, useEffect } from "react";
import {
  cancelAppointment,
  searchAppointmentsByPhone,
} from "../services/publicService";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ContactFooter from "../components/ContactFooter";

const CancelAppointment = () => {
  const location = useLocation();
  const preSelectedPhone = location.state?.preSelectedPhone || "";
  const preSelectedAppointment = location.state?.preSelectedAppointment;

  const [formData, setFormData] = useState({
    phone: preSelectedPhone,
    token: preSelectedAppointment?.token || "",
    vendorId: preSelectedAppointment?.vendorId || "",
    appointmentId: preSelectedAppointment?.id || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [fetchingAppointments, setFetchingAppointments] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(
    preSelectedAppointment
      ? {
          service: preSelectedAppointment.service,
          date: preSelectedAppointment.date,
          time: preSelectedAppointment.time,
          vendorName: preSelectedAppointment.vendorName,
        }
      : null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (preSelectedPhone) {
      fetchAppointments(preSelectedPhone);
    }
  }, [preSelectedPhone]);

  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value;
    setFormData({
      ...formData,
      phone: phoneValue,
    });

    fetchAppointments(phoneValue);
  };

  const fetchAppointments = async (phoneNumber) => {
    if (!phoneNumber) return;

    setFetchingAppointments(true);
    setError("");
    setSuccess("");

    if (!preSelectedAppointment) {
      setSelectedAppointmentDetails(null);
    }

    try {
      const response = await searchAppointmentsByPhone(phoneNumber);
      if (response.data && response.data.success) {
        const appointmentsData = response.data.appointments || [];

        if (appointmentsData.length === 0) {
          setAppointments([]);
          return;
        }

        const sortedAppointments = appointmentsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (dateA < dateB) return -1;
          if (dateA > dateB) return 1;

          return a.time.localeCompare(b.time);
        });

        setAppointments(sortedAppointments);

        if (preSelectedAppointment && preSelectedAppointment.id) {
          const matchingAppointment = sortedAppointments.find(
            (apt) => apt.id === preSelectedAppointment.id
          );
          if (matchingAppointment) {
            handleAppointmentSelect(matchingAppointment);
          }
        } else if (sortedAppointments.length > 0) {
          handleAppointmentSelect(sortedAppointments[0]);
        }
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    } finally {
      setFetchingAppointments(false);
    }
  };

  const handleAppointmentSelect = (appointment) => {
    setFormData({
      ...formData,
      token: appointment.token,
      appointmentId: appointment.id,
      vendorId: appointment.vendorId || "",
    });

    setSelectedAppointmentDetails({
      service: appointment.service,
      date: appointment.date,
      time: appointment.time || appointment.timeSlot,
      vendorName: appointment.vendorName,
    });
  };

  const handleCancelRequest = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.phone) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!formData.token && !formData.appointmentId) {
      setError("Please select an appointment or enter a booking token");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.phone || (!formData.token && !formData.appointmentId)) {
      setError("Please provide both phone number and booking information");
      setLoading(false);
      return;
    }

    try {
      setSuccess("Processing your cancellation request...");

      const response = await cancelAppointment({
        phone: formData.phone,
        token: formData.token,
        appointmentId: formData.appointmentId,
      });

      setSuccess(
        response.data.message || "Appointment cancelled successfully!"
      );
      setFormData({ phone: "", token: "", vendorId: "", appointmentId: "" });
      setShowConfirmation(false);
      setAppointments([]);
      setSelectedAppointmentDetails(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel appointment. Please check your details."
      );
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Cancel Your Appointment
        </h2>

        <div className="mt-8">
          <div className="bg-white rounded-lg">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Appointment Details
              </h3>
              <p className="text-gray-600">
                Enter your phone number and select your appointment
              </p>
            </div>

            {error && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                role="alert"
              >
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
                role="alert"
              >
                <p className="font-bold">Success</p>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleCancelRequest} className="space-y-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter the phone number used for booking"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {fetchingAppointments && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-md">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-blue-500"
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
                  <span className="text-blue-700">
                    Fetching your appointments...
                  </span>
                </div>
              )}

              {appointments.length === 0 &&
                formData.phone &&
                !fetchingAppointments && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <p className="font-semibold text-yellow-800 mb-2">
                      No upcoming appointments found
                    </p>
                    <p className="text-yellow-700 mb-2">
                      This phone number doesn't have any upcoming appointments.
                      Please:
                    </p>
                    <ul className="list-disc pl-5 text-yellow-700 space-y-1">
                      <li>Check if the phone number is correct</li>
                      <li>Enter your booking token manually below</li>
                      <li>Or try a different phone number</li>
                    </ul>
                  </div>
                )}

              {selectedAppointmentDetails && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Selected Appointment
                  </h4>
                  <p className="text-gray-600 mb-1">
                    <strong>Service:</strong>{" "}
                    {selectedAppointmentDetails.service}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Date:</strong>{" "}
                    {new Date(
                      selectedAppointmentDetails.date
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Time:</strong> {selectedAppointmentDetails.time}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Vendor:</strong>{" "}
                    {selectedAppointmentDetails.vendorName}
                  </p>
                  <p className="text-gray-600">
                    <strong>Token:</strong> #{formData.token}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {appointments.length === 0 && formData.phone
                    ? "Enter Your Booking Token Number"
                    : "Booking Token (if not selecting from above)"}
                </label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) =>
                    setFormData({ ...formData, token: e.target.value })
                  }
                  placeholder="Enter your booking token number"
                  required={appointments.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={
                    (!formData.token && !formData.appointmentId) ||
                    !formData.phone ||
                    loading
                  }
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Request Cancellation"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/search-appointments")}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                >
                  Back to Search
                </button>
              </div>
            </form>

            <ContactFooter />
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Cancellation
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel your appointment? This action
              cannot be undone.
            </p>

            {selectedAppointmentDetails && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="font-medium text-gray-800 mb-2">
                  Appointment Details:
                </p>
                <p className="text-gray-600 mb-1">
                  <strong className="font-bold">Service:</strong>{" "}
                  {selectedAppointmentDetails.service}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong className="font-bold">Vendor:</strong>{" "}
                  {selectedAppointmentDetails.vendorName}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong className="font-bold">Date:</strong>{" "}
                  {new Date(
                    selectedAppointmentDetails.date
                  ).toLocaleDateString()}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong className="font-bold">Time:</strong>{" "}
                  {selectedAppointmentDetails.time}
                </p>
                <p className="font-medium text-gray-600">
                  <strong className="font-bold">Token:</strong> #
                  {formData.token}
                </p>
              </div>
            )}

            <div className="mt-6 flex space-x-4 justify-end">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Yes, Cancel Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CancelAppointment;
