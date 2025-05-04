import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import ContactFooter from "../components/ContactFooter";

const BookWithVendor = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  // States
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState("");

  // Fetch vendor details and services
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        // Update the API URL to match your backend route structure
        const vendorResponse = await axios.get(`/api/vendors/${vendorId}`);
        setVendor(vendorResponse.data);

        const servicesResponse = await axios.get(
          `/api/vendors/${vendorId}/services`
        );
        setServices(servicesResponse.data);
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setError(
          "Failed to load vendor information. This vendor might not exist or has been removed."
        );
        toast.error("Failed to load vendor information");
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeSlots = async () => {
      try {
        const response = await axios.get(`/api/vendors/${vendorId}/timeslots`, {
          params: {
            date: selectedDate.toISOString().split("T")[0],
            services: selectedServices.join(","),
          },
        });
        setAvailableTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast.error("Failed to load available time slots");
        setAvailableTimeSlots([]);
      }
    };

    if (selectedServices.length > 0) {
      fetchTimeSlots();
    }
  }, [selectedDate, selectedServices, vendorId]);

  // Handle service selection
  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return services
      .filter((service) => selectedServices.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    if (!selectedTimeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      setBookingInProgress(true);
      const bookingData = {
        vendorId,
        services: selectedServices,
        date: selectedDate.toISOString().split("T")[0],
        timeSlot: selectedTimeSlot,
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
        notes,
      };

      const response = await axios.post("/api/bookings", bookingData);
      toast.success("Appointment booked successfully!");
      navigate(`/bookings/${response.data.id}/confirmation`);
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl text-red-600 mb-4">Error</h2>
        <p>{error}</p>
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Navbar />
      {/* Vendor Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-6">
          {vendor?.profileImage && (
            <img
              src={vendor.profileImage}
              alt={vendor.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{vendor?.name}</h1>
            <p className="text-gray-600">{vendor?.specialization}</p>
            <div className="flex items-center mt-2">
              <span className="text-yellow-400">★</span>
              <span className="ml-1">
                {vendor?.rating} ({vendor?.reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Services</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-start">
                <input
                  type="checkbox"
                  id={`service-${service.id}`}
                  checked={selectedServices.includes(service.id)}
                  onChange={() => handleServiceToggle(service.id)}
                  className="mt-1"
                />
                <label
                  htmlFor={`service-${service.id}`}
                  className="ml-2 flex-1"
                >
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-600">
                    {service.duration} min
                  </div>
                  <div className="text-sm text-gray-800">
                    ${service.price.toFixed(2)}
                  </div>
                </label>
              </div>
            ))}
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Calendar and Time Selection */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
            className="w-full rounded border"
          />

          <div className="mt-6">
            <h3 className="font-medium mb-2">Available Time Slots</h3>
            {selectedServices.length === 0 ? (
              <p className="text-sm text-gray-500">
                Please select services first
              </p>
            ) : availableTimeSlots.length === 0 ? (
              <p className="text-sm text-gray-500">
                No available slots for selected date
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`p-2 text-sm rounded ${
                      selectedTimeSlot === slot
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone *
              </label>
              <input
                type="tel"
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Special Requests (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md text-white font-medium 
                ${
                  bookingInProgress ||
                  !selectedTimeSlot ||
                  selectedServices.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              disabled={
                bookingInProgress ||
                !selectedTimeSlot ||
                selectedServices.length === 0
              }
            >
              {bookingInProgress ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <ContactFooter />
      </div>
    </div>
  );
};

export default BookWithVendor;
