import React from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';

const VendorCard = ({ vendor }) => {
  const { _id, name, category, isOpen, location, rating, reviewsCount } = vendor;

  return (
    <Card className="transition-transform transform hover:scale-105 hover:shadow-lg p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{name}</h3>
          <p className="text-sm text-gray-600">{category}</p>
          {location && <p className="text-xs text-gray-500 mt-1">{location}</p>}
        </div>

        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            isOpen
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Vendor Rating & Reviews */}
      {rating && reviewsCount && (
        <div className="flex items-center mb-4">
          <div className="flex items-center text-yellow-500">
            {/* Displaying stars based on rating */}
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${index < rating ? 'fill-current' : 'fill-gray-300'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 15.27l4.15 2.18a1 1 0 001.45-1.04l-1.1-4.83 3.72-3.19a1 1 0 00-.58-1.7l-4.91-.42-1.86-4.63a1 1 0 00-1.9 0l-1.86 4.63-4.91.42a1 1 0 00-.58 1.7l3.72 3.19-1.1 4.83a1 1 0 001.45 1.04L10 15.27z"
                  clipRule="evenodd"
                />
              </svg>
            ))}
          </div>
          <p className="ml-2 text-sm text-gray-500">({reviewsCount} reviews)</p>
        </div>
      )}

      {/* Book Appointment Button */}
      <div className="mt-4">
        <Link
          to={`/book/${_id}`}
          className="block w-full text-center py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md transform hover:translate-y-1"
        >
          Book Appointment
        </Link>
      </div>
    </Card>
  );
};

export default VendorCard;
