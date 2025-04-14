import React, { useState } from 'react';
import { updateBookingStatus, updateBookingCompleted, updateEstimatedWaitTime, updateTokenNumber, notifyCustomerAboutQueue, rescheduleBooking } from '../services/vendorService';
import Button from './ui/Button';
import Card from './ui/Card';

const BookingCard = ({ booking, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(booking.completed);
  const [waitTime, setWaitTime] = useState(booking.estimatedWaitTime || 15);
  const [isEditingWaitTime, setIsEditingWaitTime] = useState(false);
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(booking.token);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(booking.date);
  const [newTime, setNewTime] = useState(booking.time);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await updateBookingStatus(token, booking._id, status);
      onStatusUpdate();
      setNotification({ 
        show: true, 
        message: `Booking ${status === 'done' ? 'completed' : 'cancelled'} successfully`, 
        type: 'success' 
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('Status update failed:', error);
      setNotification({ 
        show: true, 
        message: `Failed to update status: ${error.message}`, 
        type: 'error' 
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmAction = (action) => {
    setConfirmationAction(action);
    setShowConfirmation(true);
  };

  const handleCompleteUpdate = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await updateBookingCompleted(token, booking._id, !isCompleted);
      setIsCompleted(!isCompleted);
      onStatusUpdate();
    } catch (error) {
      console.error('Complete update failed:', error);
      setIsCompleted(isCompleted);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWaitTimeChange = (e) => {
    setWaitTime(parseInt(e.target.value) || 15);
  };

  const saveWaitTime = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await updateEstimatedWaitTime(token, booking._id, waitTime);
      setIsEditingWaitTime(false);
      onStatusUpdate();
    } catch (error) {
      console.error('Wait time update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTokenChange = (e) => {
    setTokenNumber(parseInt(e.target.value) || 1);
  };

  const saveTokenNumber = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await updateTokenNumber(token, booking._id, tokenNumber);
      setIsEditingToken(false);
      onStatusUpdate();
    } catch (error) {
      console.error('Token update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotifyCustomer = async () => {
    setIsNotifying(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await notifyCustomerAboutQueue(token, booking._id);
      alert('Customer has been notified about their position in queue');
    } catch (error) {
      console.error('Failed to notify customer:', error);
      alert('Failed to send notification to customer');
    } finally {
      setIsNotifying(false);
    }
  };

  const handleReschedule = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await rescheduleBooking(token, booking._id, newDate, newTime);
      setIsRescheduling(false);
      onStatusUpdate();
    } catch (error) {
      console.error('Reschedule failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = () => {
    switch (booking.status) {
      case 'done':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">Done</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">Booked</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card>
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-3 md:mb-0">
          <div className="flex items-center mb-2">
            <h3 className="font-semibold mr-2">{booking.serviceName}</h3>
            {getStatusBadge()}
          </div>
          
          <p className="text-gray-600">
            <span className="inline-block w-16">Phone:</span> {booking.customerPhone}
          </p>
          <p className="text-gray-600">
            <span className="inline-block w-16">Date:</span> {formatDate(booking.date)}
          </p>
          <p className="text-gray-600">
            <span className="inline-block w-16">Time:</span> {booking.time}
          </p>
          <div className="text-gray-600 mt-2 flex items-center">
            <span className="inline-block w-16">Token:</span>
            {isEditingToken ? (
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  className="w-20 h-8 px-2 border rounded mr-2"
                  value={tokenNumber}
                  onChange={handleTokenChange}
                  disabled={isUpdating}
                />
                <button
                  className="text-xs bg-green-500 text-white px-2 py-1 rounded mr-1"
                  onClick={saveTokenNumber}
                  disabled={isUpdating}
                >
                  Save
                </button>
                <button
                  className="text-xs bg-gray-300 px-2 py-1 rounded"
                  onClick={() => {
                    setTokenNumber(booking.token);
                    setIsEditingToken(false);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="font-semibold text-lg">#{booking.token}</span>
                <button
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  onClick={() => setIsEditingToken(true)}
                  disabled={isUpdating}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-gray-600">
              <span className="inline-block w-32">Estimated Wait:</span>
              {isEditingWaitTime ? (
                <div className="inline-flex items-center">
                  <input 
                    type="number" 
                    value={waitTime} 
                    onChange={handleWaitTimeChange}
                    className="w-16 border rounded px-2 py-1 mr-2"
                    min="1"
                  />
                  <span className="mr-2">min</span>
                  <button
                    className="text-green-600 hover:text-green-800 mr-2"
                    onClick={saveWaitTime}
                    disabled={isUpdating}
                  >
                    ✓
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => setIsEditingWaitTime(false)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span>
                  {booking.estimatedWaitTime || waitTime} min
                  <button 
                    onClick={() => setIsEditingWaitTime(true)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ✎
                  </button>
                </span>
              )}
            </p>
          </div>
          
          {booking.completedBy && (
            <p className="text-gray-600 mt-2">
              <span className="inline-block">Completed by:</span> {booking.completedBy}
            </p>
          )}
        </div>
        
        {booking.status === 'booked' && (
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => confirmAction('done')}
              variant="success"
              size="sm"
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Mark as Done
            </Button>
            <Button
              onClick={() => setIsRescheduling(true)}
              variant="warning"
              size="sm"
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Reschedule
            </Button>
            <Button
              onClick={() => confirmAction('cancelled')}
              variant="danger"
              size="sm"
              disabled={isUpdating}
              isLoading={isUpdating}
            >
              Cancel Booking
            </Button>
          </div>
        )}
      </div>
      <label className="inline-flex items-center mt-3">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-600"
          checked={isCompleted}
          onChange={handleCompleteUpdate}
          disabled={isUpdating}
        />
        <span className="ml-2 text-gray-700">Complete</span>
      </label>
      <div className="flex flex-col gap-2 mt-4">
        {booking.status === 'booked' && !isCompleted && (
          <Button
            onClick={handleNotifyCustomer}
            disabled={isNotifying}
            className="bg-blue-500 text-white"
          >
            {isNotifying ? 'Sending...' : 'Notify Customer About Queue'}
          </Button>
        )}
      </div>

      {isRescheduling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reschedule Appointment</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Date
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Time
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setIsRescheduling(false)}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleReschedule}
                disabled={isUpdating}
              >
                {isUpdating ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Action</h3>
            <p>Are you sure you want to {confirmationAction === 'done' ? 'mark this booking as done' : 'cancel this booking'}?</p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowConfirmation(false)}
              >
                No, Go Back
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {
                  handleStatusUpdate(confirmationAction);
                  setShowConfirmation(false);
                }}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white shadow-lg transition-opacity duration-300`}>
          {notification.message}
        </div>
      )}
    </Card>
  );
};

export default BookingCard;
