import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ContactFooter from "../components/ContactFooter";
import { searchAppointmentsByPhone } from "../services/publicService";
import { format } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";

const SearchAppointments = () => {
  const [phone, setPhone] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const phoneParam = params.get("phone");
    if (phoneParam) {
      setPhone(phoneParam);
      handleSearch(phoneParam);
    }
  }, [location]);

  const validatePhone = (phoneNumber) => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    return (
      digitsOnly.length === 10 ||
      (digitsOnly.length >= 11 && digitsOnly.length <= 14)
    );
  };

  const handleSearch = async (phoneToSearch = phone) => {
    if (!phoneToSearch) {
      setError("Please enter a phone number");
      return;
    }

    if (!validatePhone(phoneToSearch)) {
      setError("Please enter a valid phone number (10 digits)");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setAppointments([]);

    try {
      const response = await searchAppointmentsByPhone(phoneToSearch);
      if (response.data.success) {
        setAppointments(response.data.appointments);

        if (response.data.appointments.length > 0) {
          setMessage(
            `Found ${response.data.appointments.length} upcoming appointment(s).`
          );
        } else {
          setMessage("No upcoming appointments found for this phone number.");
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err.response?.data?.message || "Error searching for appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleSearch();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  const handleCancelAppointment = (appointment) => {
    navigate("/cancel-appointment", {
      state: {
        preSelectedPhone: phone,
        preSelectedAppointment: appointment,
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto my-8 p-5 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Find Your Appointments
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-gray-50 p-6 rounded-lg"
        >
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <label
                htmlFor="phone"
                className="block mb-2 font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number (10 digits)"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition"
              />
              <p className="mt-2 text-sm text-gray-600">
                Enter the phone number you used for booking
              </p>
            </div>
            <div className="flex-1 min-w-[250px]">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Searching..." : "Search Appointments"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="p-4 mb-4 bg-green-50 text-green-700 rounded-md">
            {message}
          </div>
        )}

        {appointments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
              Your Upcoming Appointments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full mt-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-4 text-gray-800">
                        {appointment.service}
                      </td>
                      <td className="px-4 py-4 text-gray-800">
                        <div className="font-medium">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="text-gray-600">{appointment.time}</div>
                      </td>
                      <td className="px-4 py-4 text-gray-800">
                        {appointment.vendorName}
                      </td>
                      <td className="px-4 py-4">
                        {appointment.status === "booked" ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            Confirmed
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-1 ${
                              appointment.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : appointment.status === "done"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            } text-sm rounded-full`}
                          >
                            {appointment.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {appointment.status !== "cancelled" &&
                          appointment.status !== "done" && (
                            <button
                              onClick={() =>
                                handleCancelAppointment(appointment)
                              }
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                            >
                              Cancel
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {appointments.length === 0 && !loading && message && !error && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-semibold text-gray-700 mb-2">
              No upcoming appointments found
            </p>
            <p className="text-gray-600 mb-6">
              We couldn't find any upcoming appointments for {phone}.
            </p>
            <div className="p-5 bg-white rounded-lg shadow-sm mb-6">
              <p className="font-medium mb-2">You can:</p>
              <ul className="list-disc list-inside text-left text-gray-700 space-y-1">
                <li>Double-check your phone number</li>
                <li>Book a new appointment</li>
                <li>Contact support if you believe this is an error</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/book-appointment")}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium"
              >
                Book New Appointment
              </button>
            </div>
          </div>
        )}
      </div>
      <ContactFooter />
    </>
  );
};

export default SearchAppointments;
