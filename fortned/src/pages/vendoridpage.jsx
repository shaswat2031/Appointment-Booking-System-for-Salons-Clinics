import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ContactFooter from "../components/ContactFooter";

const VendorIdPage = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        setLoading(true);
        // Use the API service with the correct endpoint
        const response = await API.get(`/api/vendors/${vendorId}`);
        setVendor(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vendor:", err);
        setError("Failed to load vendor information");
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [vendorId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !vendor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <div className="p-6 text-center">
                <div className="mb-4 text-red-500">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-4">Vendor Not Found</h2>
                <p className="mb-6">
                  {error ||
                    "The vendor you're looking for doesn't exist or has been removed."}
                </p>
                <Button to="/book">Browse All Vendors</Button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Vendor Header Card */}
          <Card className="mb-8">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>

              <div className="flex items-center text-gray-600 mb-4">
                <svg
                  className="w-5 h-5 mr-1 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{vendor.location}</span>
              </div>

              <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg mb-1">
                  About {vendor.name}
                </h2>
                <p className="text-gray-700">
                  {vendor.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center mb-4">
                <span className="mr-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {vendor.category}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    vendor.isOpen
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {vendor.isOpen ? "Open Now" : "Closed"}
                </span>
              </div>
            </div>
          </Card>

          {/* Services Card */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Services Offered</h2>

              {vendor.services && vendor.services.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-100">
                      <tr>
                        <th className="px-6 py-3">Service Name</th>
                        <th className="px-6 py-3">Duration</th>
                        <th className="px-6 py-3">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendor.services.map((service, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">
                            {service.name}
                          </td>
                          <td className="px-6 py-4">{service.duration} mins</td>
                          <td className="px-6 py-4">
                            ₹{service.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">
                  No services listed for this vendor.
                </p>
              )}
            </div>
          </Card>

          {/* Book Button */}
          <div className="text-center">
            <Button
              to={`/book/${vendorId}`}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Book Appointment
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <ContactFooter />
        </div>
      </div>
    </>
  );
};

export default VendorIdPage;
