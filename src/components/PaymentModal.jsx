import React, { useState, useEffect } from 'react';
import { X, CreditCard, Landmark, Wallet, AlertCircle, CheckCircle, Loader2, Copy } from 'lucide-react';
import paymentService from '../services/PaymentService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  total, 
  userData, 
  options, 
  selectedPaymentMethod,
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedPaymentMethod || 'cash');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [copied, setCopied] = useState('');

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(selectedPaymentMethod || 'cash');
      setProcessingPayment(false);
      setPaymentError('');
      setPaymentSuccess('');
      setTransaction(null);
      setCopied('');
    }
  }, [isOpen, selectedPaymentMethod]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      // Initialize payment
      const { transaction, orderData } = await paymentService.initializePayment({
        cartItems,
        total,
        userData,
        options
      });

      // Process payment based on method
      if (paymentMethod === 'online') {
        await paymentService.processOnlinePayment({
          transaction,
          orderData,
          onSuccess: (updatedTransaction) => {
            setTransaction(updatedTransaction);
            setPaymentSuccess('Payment successful! Your order has been placed.');
            setProcessingPayment(false);
            if (onPaymentSuccess) {
              onPaymentSuccess(updatedTransaction);
            }
          },
          onError: (error) => {
            setPaymentError(error);
            setProcessingPayment(false);
          }
        });
      } else if (paymentMethod === 'cash') {
        await paymentService.processCashPayment({
          transaction,
          userData,
          total,
          onSuccess: (updatedTransaction) => {
            setTransaction(updatedTransaction);
            setPaymentSuccess(`Order placed successfully! Order #${updatedTransaction.order_number}. Please pay ₹${total.toFixed(2)} at the counter.`);
            setProcessingPayment(false);
            if (onPaymentSuccess) {
              onPaymentSuccess(updatedTransaction);
            }
          },
          onError: (error) => {
            setPaymentError(error);
            setProcessingPayment(false);
          }
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setProcessingPayment(false);
    }
  };



  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <CreditCard size={20} className="text-green-600" />;
      case 'online':
        return <Landmark size={20} className="text-blue-600" />;
      default:
        return <CreditCard size={20} className="text-gray-600" />;
    }
  };

  const getPaymentMethodDescription = (method) => {
    switch (method) {
      case 'cash':
        return 'Pay at the counter when collecting your order';
      case 'online':
        return 'Pay securely using UPI, Cards, or Net Banking';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Payment</h2>
            <p className="text-sm text-gray-600 mt-1">Complete your order</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {paymentError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {paymentSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 text-sm">{paymentSuccess}</p>
              </div>
            </div>
          )}

                     {/* Payment Success Details */}
           {transaction && transaction.payment_status === 'success' && (
             <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
               <div className="flex items-center gap-3 mb-4">
                 <CheckCircle className="w-6 h-6 text-green-600" />
                 <h3 className="font-bold text-gray-800 text-lg">Order Confirmed!</h3>
               </div>
               
               <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                   <span className="text-gray-700 font-medium">Order Number:</span>
                   <span className="font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">
                     {transaction.order_number}
                   </span>
                 </div>
                 
                 {transaction.otp && (
                   <div className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-blue-700 font-bold">OTP for Collection:</span>
                       <button
                         onClick={() => copyToClipboard(transaction.otp, 'otp')}
                         className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                       >
                         {copied === 'otp' ? <CheckCircle size={18} /> : <Copy size={18} />}
                       </button>
                     </div>
                     <div className="text-center bg-blue-50 rounded-lg p-4">
                       <span className="text-3xl font-bold text-blue-600 tracking-wider">
                         {transaction.otp}
                       </span>
                     </div>
                     <p className="text-center text-sm text-blue-600 mt-2">
                       Show this OTP to collect your order
                     </p>
                   </div>
                 )}
                 
                 {transaction.token_number && (
                   <div className="bg-white border-2 border-green-300 rounded-xl p-4 shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-green-700 font-bold">Token Number:</span>
                       <button
                         onClick={() => copyToClipboard(transaction.token_number, 'token')}
                         className="text-green-600 hover:text-green-800 transition-colors p-2 hover:bg-green-50 rounded-lg"
                       >
                         {copied === 'token' ? <CheckCircle size={18} /> : <Copy size={18} />}
                       </button>
                     </div>
                     <div className="text-center bg-green-50 rounded-lg p-4">
                       <span className="text-3xl font-bold text-green-600 tracking-wider">
                         {transaction.token_number}
                       </span>
                     </div>
                     <p className="text-center text-sm text-green-600 mt-2">
                       Your order token number
                     </p>
                   </div>
                 )}
               </div>
             </div>
           )}

          {/* Payment Method Display */}
          {!transaction && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                <div className="p-4 border-2 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-4">
                    {paymentMethod === 'online' ? (
                      <>
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                          <Landmark size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <span className="font-bold text-base text-gray-800">Online Payment</span>
                          <p className="text-sm text-gray-600 mt-1">Pay securely using UPI, Cards, or Net Banking</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                          <CreditCard size={24} className="text-green-600" />
                        </div>
                        <div>
                          <span className="font-bold text-base text-gray-800">Cash on Delivery</span>
                          <p className="text-sm text-gray-600 mt-1">Pay at the counter when collecting your order</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {paymentMethod === 'online' && !paymentService.validatePaymentMethod('online') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ Online payment is not configured. Please select a different payment method or contact support.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="font-semibold text-gray-800">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Service Fee:</span>
                    <span className="font-semibold text-gray-800">₹25.00</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-green-600 font-medium">Discount:</span>
                    <span className="font-semibold text-green-600">-₹50.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                    <span className="text-xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button 
                onClick={handlePayment}
                disabled={processingPayment || cartItems.length === 0 || (paymentMethod === 'online' && !paymentService.validatePaymentMethod('online'))}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  processingPayment || cartItems.length === 0 || (paymentMethod === 'online' && !paymentService.validatePaymentMethod('online'))
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : paymentMethod === 'online'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    {getPaymentMethodIcon(paymentMethod)}
                    {paymentMethod === 'online' ? 'Pay Online ₹' : 'Place Order ₹'}{total.toFixed(2)}
                  </>
                )}
              </button>
            </>
          )}

          {/* Action Buttons */}
          {transaction && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.location.href = `/user/order?order=${transaction.order_number}`}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                View Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
