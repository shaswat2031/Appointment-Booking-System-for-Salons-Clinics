import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Payment = () => {
  const { plan } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const planDetails = {
    starter: {
      name: 'Starter',
      price: 600,
      annual: 6000,
      colorClass: 'bg-green-50 border-green-100',
      textColorClass: 'text-green-600'
    },
    growth: {
      name: 'Growth',
      price: 2400,
      annual: 24000,
      colorClass: 'bg-blue-50 border-blue-100',
      textColorClass: 'text-blue-600'
    },
    premium: {
      name: 'Premium',
      price: 5000,
      annual: 50000,
      colorClass: 'bg-purple-50 border-purple-100',
      textColorClass: 'text-purple-600'
    }
  };
  
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  // Use useEffect to correctly set the selected plan based on URL parameter
  useEffect(() => {
    if (planDetails[plan]) {
      setSelectedPlan(planDetails[plan]);
    } else {
      setSelectedPlan(planDetails.starter);
    }
  }, [plan]);
  
  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate payment processing
    setTimeout(() => {
      // Generate a dummy payment token - in a real implementation, this would come from your payment gateway
      const paymentToken = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store the payment token (would typically be done by your backend)
      localStorage.setItem('paymentToken', paymentToken);
      
      // Redirect to registration with the token
      navigate(`/vendor/register?token=${paymentToken}&plan=${plan}`);
    }, 2000);
  };
  
  if (!selectedPlan) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card>
              <div className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4">Invalid Plan Selected</h2>
                <p className="mb-6">The selected plan is not available.</p>
                <Button to="/#pricing">View Available Plans</Button>
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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Purchase</h2>
              
              <div className={`mb-6 p-4 rounded-lg ${selectedPlan.colorClass}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{selectedPlan.name} Plan</h3>
                  <div className={selectedPlan.textColorClass}>
                    {selectedBilling === 'monthly' 
                      ? `₹${selectedPlan.price}/month` 
                      : `₹${selectedPlan.annual}/year`}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {selectedBilling === 'annual' && 'Save up to 17% with annual billing!'}
                </p>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-center mb-2">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => setSelectedBilling('monthly')}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                        selectedBilling === 'monthly'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } border border-gray-200`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBilling('annual')}
                      className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                        selectedBilling === 'annual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } border border-gray-200`}
                    >
                      Annual (Save 17%)
                    </button>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="text-lg font-semibold mb-4">Payment Information</h4>
                  
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-700">
                      <strong>Demo Mode:</strong> No actual payment will be processed. Click "Complete Payment" to simulate.
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="font-semibold flex justify-between">
                      <span>Total:</span>
                      <span className="text-lg">
                        {selectedBilling === 'monthly' 
                          ? `₹${selectedPlan.price}`
                          : `₹${selectedPlan.annual}`}
                      </span>
                    </div>
                    
                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}
                    
                    <Button
                      type="submit"
                      fullWidth
                      isLoading={loading}
                    >
                      {loading ? 'Processing...' : 'Complete Payment'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => navigate('/#pricing')}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
              
              <p className="text-xs text-gray-500 mt-6">
                By completing this purchase, you agree to our terms of service and privacy policy.
                After payment, you'll be redirected to complete your vendor registration.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Payment;
