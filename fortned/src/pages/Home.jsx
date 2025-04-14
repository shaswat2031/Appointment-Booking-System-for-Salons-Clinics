import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getVendors } from "../services/publicService";

const Home = () => {
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const CheckIcon = () => (
    <svg
      className="w-4 h-4 text-green-500 mr-2 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );

  const CrossIcon = () => (
    <svg
      className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await getVendors();
        setFeaturedVendors(response.data.filter((v) => v.isOpen).slice(0, 3));
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to load vendors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate__animated animate__fadeIn">
            Book Appointments with Ease
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Connect with local salons, clinics, and service providers in just a
            few clicks.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              to="/book"
              variant="outline"
              size="lg"
              className="bg-white hover:bg-gray-100 shadow-lg"
            >
              Book Now
            </Button>
            <Button to="/check-status" size="lg" className="shadow-lg">
              Check Booking Status
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "search",
                title: "Find a Provider",
                description:
                  "Browse and choose from available salons, clinics, and service providers.",
              },
              {
                icon: "calendar",
                title: "Book an Appointment",
                description:
                  "Select a service, choose a date and time that works best for your schedule.",
              },
              {
                icon: "check",
                title: "Get Confirmation",
                description:
                  "Receive instant booking confirmation with a unique token for your appointment.",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all duration-300 p-8 border-t-4 border-blue-500"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          step.icon === "search"
                            ? "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            : step.icon === "calendar"
                            ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            : "M5 13l4 4L19 7"
                        }
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-20 bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
      Featured Providers
    </h2>
    <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
      These top-rated service providers are ready to welcome you with exceptional experiences.
    </p>

    {loading ? (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : featuredVendors.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {featuredVendors.map((vendor) => (
          <Card
            key={vendor._id}
            className="hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 bg-white rounded-2xl"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {vendor.name}
              </h3>
              <p className="text-blue-600 text-sm font-medium mb-1 flex items-center">
                <i className="fas fa-tag mr-2"></i>
                {vendor.category}
              </p>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {vendor.location}
              </div>
              <Link
                to={`/book`}
                className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Book Now
              </Link>
            </div>
          </Card>
        ))}
      </div>
    ) : (
      <p className="text-center text-lg text-gray-600">
        No featured vendors available at the moment.
      </p>
    )}

    <div className="text-center mt-14">
      <Button
        to="/book"
        variant="outline"
        className="shadow-md hover:shadow-lg px-6 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-all duration-300"
      >
        View All Providers
      </Button>
    </div>
  </div>
</section>


      {/* Affordable Plans */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Simple, Affordable Plan
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            Everything you need to get started. One flat price, no surprises.
          </p>

          <div className="max-w-xl mx-auto">
            <Card className="border-2 border-gray-200 hover:border-green-500 transition-all duration-300 transform hover:scale-[1.02] shadow-sm">
              <div className="p-8 text-center">
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  BEST FOR STARTERS
                </div>
                <h3 className="text-2xl font-bold mb-2">Starter Plan</h3>
                <p className="text-gray-600 mb-4">
                  Perfect for solo professionals & freelancers
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">₹600</span>
                  <span className="text-gray-500">/month</span>
                  <p className="text-sm text-gray-500 mt-1">
                    or ₹6,000/year (save 17%)
                  </p>
                </div>

                <ul className="mb-6 space-y-3 text-left text-sm">
                  <li className="flex items-center">
                    <CheckIcon />
                    Up to 300 bookings/month
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    Basic online scheduling
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    Customer notifications
                  </li>
                  <li className="flex items-center text-gray-400 line-through">
                    <CrossIcon />
                    Staff accounts
                  </li>
                  <li className="flex items-center text-gray-400 line-through">
                    <CrossIcon />
                    Priority support
                  </li>
                </ul>

                <Button
                  to="/payment/starter"
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50 text-sm py-2"
                >
                  Start 7-Day Free Trial
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-3xl font-bold mb-4">AppointMate</h3>
              <p className="text-gray-400 mb-4">
                Simplifying appointment booking for businesses and customers.
              </p>
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">For Business Owners</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Want to list your business? Choose a subscription plan first
                  to access vendor registration.
                </p>
                <div className="flex gap-3">
                  <Button
                    to="/vendor/login"
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-400 text-gray-300"
                  >
                    Vendor Login
                  </Button>
                  <Button
                    to="#pricing"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      document
                        .getElementById("pricing")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 mb-2">
                Email: PrasadShaswat9265@gmail.com
              </p>
              <p className="text-gray-400 mb-2">Phone: +91 XXXXXXXXXX</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
            Built with ❤️ by the AppointMate Team
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
