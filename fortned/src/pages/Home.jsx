// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getVendors } from '../services/publicService';

const Home = () => {
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await getVendors();
        setFeaturedVendors(response.data.filter(v => v.isOpen).slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section with Search - Enhanced */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate__animated animate__fadeIn">
            Book Appointments with Ease
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Connect with local salons, clinics, and service providers in just a few clicks
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button to="/book" variant="outline" size="lg" className="bg-white hover:bg-gray-100 shadow-lg">
              Book Now
            </Button> 
            <Button to="/check-status" size="lg" className="shadow-lg">
              Check Booking Status
            </Button>
          </div>
        </div>
      </section>
      
      {/* How It Works - Enhanced */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-16"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300 p-8 border-t-4 border-blue-500">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Find a Provider</h3>
              <p className="text-gray-600">Browse and choose from available salons, clinics, and service providers in your area.</p>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300 p-8 border-t-4 border-blue-500 transform md:translate-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Book an Appointment</h3>
              <p className="text-gray-600">Select a service, choose a date and time that works best for your schedule.</p>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300 p-8 border-t-4 border-blue-500">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Get Confirmation</h3>
              <p className="text-gray-600">Receive instant booking confirmation with a unique token for your appointment.</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Statistics Section - Enhanced */}
      {/* Featured Vendors with Enhanced UI */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Featured Providers</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600 mb-16 max-w-3xl mx-auto text-lg">
            These top-rated service providers are ready to welcome you with exceptional services
          </p>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : featuredVendors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVendors.map((vendor) => (
                <Card key={vendor._id} className="hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                  <div className="p-4">
                    <h2 className="text-3xl font-semibold mb-2">{vendor.name}</h2>
                    <div className="flex items-center mb-2">
                    </div>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <i className="fas fa-tag text-blue-500 mr-2"></i>
                      {vendor.category}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {vendor.location}
                    </div>
                    <Link 
                      to={`/book/${vendor._id}`}
                      className="block text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Book Now
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-lg">No open vendors available at the moment.</p>
          )}
          
          <div className="text-center mt-12">
            <Button to="/book" variant="outline" className="shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              View All Providers
            </Button>
          </div>
        </div>
      </section>
      
      {/* Enhanced CTA */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Are You a Service Provider?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto">
            Join our platform to efficiently manage appointments, increase your visibility, and grow your business with our powerful booking tools.
          </p>
          <Button to="/vendor/register" size="lg" variant="outline" className="bg-white hover:bg-gray-100 shadow-lg text-lg py-4 px-8">
            <i className="fas fa-store mr-2"></i> Register Your Business
          </Button>
        </div>
      </section>
      
      {/* Footer with Newsletter - Enhanced */}
      <footer className="bg-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <h3 className="text-2xl font-bold mb-6">AppointMate</h3>
              <p className="text-gray-400 mb-4">Simplifying appointment booking for businesses and customers.</p>
              <p className="text-gray-400">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 border-l-4 border-blue-500 pl-3">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Home</Link></li>
                <li><Link to="/book" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Book Appointment</Link></li>
                <li><Link to="/check-status" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Check Status</Link></li>
                <li><Link to="/cancel" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Cancel Booking</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 border-l-4 border-blue-500 pl-3">For Businesses</h4>
              <ul className="space-y-3">
                <li><Link to="/vendor/register" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Register</Link></li>
                <li><Link to="/vendor/login" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Login</Link></li>
                <li><Link to="/vendor/features" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Features</Link></li>
                <li><Link to="/vendor/pricing" className="text-gray-400 hover:text-blue-400 flex items-center"><i className="fas fa-chevron-right mr-2 text-xs text-blue-400"></i> Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6 border-l-4 border-blue-500 pl-3">Subscribe to Updates</h4>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg transition-colors">
                  <i className="fas fa-paper-plane mr-2"></i> Subscribe
                </button>
              </form>
            </div>
          </div>
          
          {/* Improved Footer Section */}
          
        </div>  
      </footer>
    </>
  );
};

export default Home;
