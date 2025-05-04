import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./components/About";
import Services from "./components/Services";
import Contact from "./components/Contact";
import CancelBooking from "./components/CancelBooking";
import SearchAppointments from "./pages/SearchAppointments";
import CancelAppointment from "./pages/CancelAppointment";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cancel-booking" element={<CancelBooking />} />
        <Route path="/search-appointments" element={<SearchAppointments />} />
        <Route path="/cancel-appointment" element={<CancelAppointment />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
