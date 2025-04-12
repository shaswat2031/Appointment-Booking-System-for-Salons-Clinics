import React from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';

const VendorCard = ({ vendor }) => {
  const { _id, name, category, isOpen, location } = vendor;

  return (
    <Card className="h-full transition-transform hover:scale-105">
      <div className="flex justify-between items-start">
        <div className="mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-600 text-sm">{category}</p>
          {location && <p className="text-gray-500 text-sm mt-1">{location}</p>}
        </div>
        
        <span 
          className={`px-2 py-1 text-xs font-medium rounded ${
            isOpen 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>
      
      <div className="mt-4">
        <Link 
          to={`/book/${_id}`}
          className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Book Appointment
        </Link>
      </div>
    </Card>
  );
};

export default VendorCard;
