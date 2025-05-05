import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getVendors } from "../services/publicService";
import {
  FaCheck,
  FaTimes,
  FaTag,
  FaMapMarkerAlt,
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaPhoneAlt,
  FaStar,
  FaHeart,
} from "react-icons/fa";

const Home = () => {
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CheckIcon = () => (
    <FaCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
  );
  const CrossIcon = () => (
    <FaTimes className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
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
      {/* Hero Section with Enhanced Design */}
      <section className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10">
          <div className="absolute right-0 top-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute left-10 bottom-10 w-48 h-48 bg-blue-300 opacity-10 rounded-full blur-2xl"></div>
        </div>
        <div className="absolute -bottom-10 left-0 w-full h-20 bg-white transform -skew-y-2"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate__animated animate__fadeIn">
            Your Time, Your Terms{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
              Book Smarter
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto opacity-90">
            No more waiting on hold or playing phone tag. Connect with your
            favorite local spots in just a few taps!
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              to="/book"
              variant="outline"
              size="lg"
              className="bg-white hover:bg-gray-100 shadow-lg transform transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaClock className="text-blue-700" /> Book Now
            </Button>
            <Button
              to="/cancel"
              size="lg"
              className="shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaSearch className="animate-pulse" /> Cancel Your Booking
            </Button>
          </div>
          <div className="mt-10 flex justify-center gap-8">
            <div className="text-center">
              <div className="font-bold text-3xl">10+</div>
              <div className="text-blue-200">Local Businesses</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl">50+</div>
              <div className="text-blue-200">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-3xl">4.1</div>
              <div className="text-blue-200">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works - More Engaging */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It <span className="text-indigo-600">Actually</span> Works
          </h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <p className="text-center text-gray-700 mb-16 max-w-2xl mx-auto text-lg">
            We've made booking so easy your grandma could do it. (And yes, we've
            tested this with real grandmas!)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "search",
                title: "Find Your Perfect Match",
                description:
                  "Browse local spots with real reviews from people just like you. Filter by what matters most to you.",
              },
              {
                icon: "calendar",
                title: "Pick a Time That Works",
                description:
                  "See real-time availability and book anytime, even at 3 AM in your pajamas. We don't judge.",
              },
              {
                icon: "check",
                title: "You're All Set!",
                description:
                  "Get instant confirmation and reminders so you never miss an appointment again. No more sticky notes!",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-all duration-300 p-8 border-t-4 border-indigo-500 group hover:-translate-y-2 transform rounded-xl"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-full flex items-center justify-center shadow-inner group-hover:bg-indigo-200 transition-colors">
                    {step.icon === "search" ? (
                      <FaSearch className="h-10 w-10 text-indigo-600" />
                    ) : step.icon === "calendar" ? (
                      <FaCalendarAlt className="h-10 w-10 text-indigo-600" />
                    ) : (
                      <FaCheck className="h-10 w-10 text-indigo-600" />
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                <div className="mt-6 h-1 w-12 bg-indigo-200 mx-auto group-hover:w-24 transition-all duration-300"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-gray-50 to-indigo-50 relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-white transform -skew-y-2"></div>
        <div className="container mx-auto px-4 pt-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Places People <span className="text-indigo-600">Love</span>
          </h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto text-lg">
            These local favorites consistently deliver experiences that keep
            customers coming back. Each one has been vetted for quality and
            reliability.
          </p>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : featuredVendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {featuredVendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="relative transform perspective-1000 hover:-rotate-x-2 hover:rotate-y-1 transition-all duration-300"
                >
                  <div
                    className="bg-white rounded-xl overflow-hidden p-6 shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] hover:shadow-[0_20px_60px_rgba(59,_130,_246,_0.18)] border border-indigo-50 transform-gpu transition-all duration-300"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-500 to-blue-600 text-white px-4 py-1 rounded-bl-lg text-xs font-medium z-10">
                      OPEN NOW
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        {vendor.name}
                        <FaHeart className="text-pink-500 ml-2 h-3 w-3" />
                      </h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md">
                        <FaStar className="text-yellow-500" />
                        <span className="ml-1 text-gray-700 font-medium">
                          4.8
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 inline-block px-3 py-1 bg-indigo-50 rounded-md text-indigo-700 text-sm font-medium">
                      <FaTag className="inline mr-2" />
                      {vendor.category}
                    </div>

                    <div className="flex items-center text-gray-500 text-sm mb-6">
                      <FaMapMarkerAlt className="h-4 w-4 mr-2 text-indigo-500" />
                      {vendor.location}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center text-gray-500">
                        <FaPhoneAlt className="h-3 w-3 mr-1" />
                        <span className="text-xs">Quick response</span>
                      </div>
                      <Link
                        to={`/book`}
                        className="block text-center py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium transform hover:-translate-y-0.5 shadow-md hover:shadow-indigo-200"
                      >
                        Book Now
                      </Link>
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-gradient-to-tl from-indigo-100 to-transparent rounded-full opacity-50"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-gray-600">
              Our top providers are taking a quick break. Check back in a few
              moments!
            </p>
          )}

          <div className="text-center mt-14">
            <Button
              to="/book"
              variant="outline"
              className="shadow-md hover:shadow-lg px-8 py-3 rounded-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <span>Explore All Local Spots</span>{" "}
              <FaSearch className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </section>
      {/* Affordable Plans with More Human Touch */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-indigo-50 transform -skew-y-2"></div>
        <div className="container mx-auto px-4 pt-10">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            id="pricing"
          >
            Pricing That Makes <span className="text-green-600">Sense</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
          <p className="text-center text-gray-700 mb-12 max-w-2xl mx-auto text-lg">
            No hidden fees, no surprises. Just straightforward pricing that
            works for small businesses.
          </p>

          <div className="max-w-xl mx-auto">
            <Card className="border-2 border-gray-200 hover:border-green-500 transition-all duration-300 transform hover:scale-[1.02] shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-400 to-green-600 py-3">
                <div className="text-center text-white font-bold">
                  MOST POPULAR CHOICE
                </div>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Starter Plan</h3>
                <p className="text-gray-600 mb-4">
                  Perfect for independent professionals ready to grow
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-bold">₹600</span>
                  <span className="text-gray-500">/month</span>
                  <p className="text-sm text-gray-500 mt-1">
                    or ₹6,000/year (that's 2 months free!)
                  </p>
                </div>

                <ul className="mb-8 space-y-4 text-left text-sm">
                  <li className="flex items-center">
                    <CheckIcon />
                    <span>
                      <strong>300 monthly bookings</strong> – plenty for most
                      small businesses
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span>
                      <strong>24/7 online scheduling</strong> – let customers
                      book while you sleep
                    </span>
                  </li>
                  <li className="flex items-center">
                    <CheckIcon />
                    <span>
                      <strong>Automatic notifications</strong> – reduce no-shows
                      by up to 70%
                    </span>
                  </li>
                  <li className="flex items-center text-gray-400 line-through">
                    <CrossIcon />
                    Staff accounts for team management
                  </li>
                  <li className="flex items-center text-gray-400 line-through">
                    <CrossIcon />
                    Priority customer support
                  </li>
                </ul>

                <Button
                  to="/payment/starter"
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50 text-sm py-3 transition-all hover:shadow-lg rounded-xl font-medium"
                >
                  Start Your 7-Day Free Trial
                </Button>
                <p className="text-gray-500 text-xs mt-3">
                  No credit card required for trial
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      {/* Footer with Enhanced Design */}
      <footer className="bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white py-16 relative">
        <div className="absolute top-0 left-0 right-0 h-16 bg-white transform -skew-y-2"></div>
        <div className="container mx-auto px-4 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                AppointMate
              </h3>
              <p className="text-gray-400 mb-6 text-lg">
                We're on a mission to make scheduling simple for everyone.
              </p>
              <div className="mt-6 bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl shadow-lg border border-gray-700">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FaStar className="text-yellow-400" /> Own a Business?
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Join hundreds of local businesses already growing their
                  customer base with online bookings.
                </p>
                <div className="flex gap-3">
                  <Button
                    to="/vendor/login"
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-400 text-gray-300 hover:bg-gray-700"
                  >
                    Sign In
                  </Button>
                  <Button
                    to="#pricing"
                    size="sm"
                    className="text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    onClick={() => {
                      document
                        .getElementById("pricing")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaPhoneAlt className="text-indigo-400 h-4 w-4" /> Need Help?
              </h4>
              <p className="text-gray-400 mb-4">
                Our friendly support team is here for you 7 days a week.
              </p>
              <p className="text-gray-400 mb-2 flex items-center gap-2">
                <span className="text-indigo-400">Email:</span>{" "}
                prasadshaswat9265@gmail.com
              </p>
              <p className="text-gray-400 mb-6 flex items-center gap-2">
                <span className="text-indigo-400">Phone:</span> +91 9265318481
              </p>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-300">
                  "AppointMate has saved our salon hundreds of hours on the
                  phone. Our customers love it too!"
                  <br />
                  <span className="text-indigo-300 font-medium">
                    – Maya's Beauty Studio
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/book"
                    className="hover:text-indigo-300 transition-colors"
                  >
                    Find Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/check-status"
                    className="hover:text-indigo-300 transition-colors"
                  >
                    Check Booking Status
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="hover:text-indigo-300 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-indigo-300 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-indigo-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-10 pt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Built with ❤️ by the AppointMate Team in India
            </p>
            <p className="text-xs text-gray-600">
              © 2023 AppointMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
