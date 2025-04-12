    // src/pages/NotFound.jsx
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import React from 'react'

const NotFound = () => {
  return (
    <>
      <Navbar />
      <div className="text-center p-10">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="text-lg">Oops! Page not found.</p>
        <Link to="/" className="text-blue-500 underline mt-4 block">Go to Home</Link>
      </div>
    </>
  );
};

export default NotFound;
