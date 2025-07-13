import React, { useState } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import Header from './Header';
import Footer from '../../components/spectrumui/footer.jsx';

export default function Contact() {
  // State for form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    inquiryType: 'feedback',
    message: '',
    // agreeToPolicy: false, // Removed
  });

  // State for form submission status
  const [submissionStatus, setSubmissionStatus] = useState('idle'); // 'idle', 'submitting', 'success'
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    // Last name is now optional, so no validation for it.
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid.';
    }
    if (!formData.message.trim()) newErrors.message = 'A message is required.';
    if (formData.message.trim().length < 15) newErrors.message = 'Message must be at least 15 characters.';
    // Privacy policy removed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmissionStatus('submitting');
    console.log('Form Data Submitted:', formData);

    // Simulate API call
    setTimeout(() => {
      setSubmissionStatus('success');
       // Reset form after a delay
      setTimeout(() => {
        setFormData({
            firstName: '', lastName: '', email: '', studentId: '', inquiryType: 'feedback', message: ''
        });
        setSubmissionStatus('idle');
      }, 4000);
    }, 2000);
  };

  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header />
      <div className="h-20 mt-12" />
      <div className="flex-1 flex items-center justify-center p-2 mb-12">
        <div className="w-full max-w-7xl mx-auto overflow-hidden flex mt-4 min-h-[420px] max-h-[700px]">
          {/* Left Side: Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
            {submissionStatus === 'success' ? (
               <div className="flex flex-col items-center justify-center h-full text-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mb-3" />
                  <h3 className="text-xl font-bold text-gray-800">Feedback Sent!</h3>
                  <p className="text-gray-600 mt-2 text-sm">Thank you for your input. We'll get back to you shortly if a response is needed.</p>
                </div>
            ) : (
              <>
                {/* Logo and label removed */}
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Feedback & Inquiries</h2>
                <p className="mb-4 text-gray-600 text-sm">
                  Have a suggestion, question, or feedback about the canteen? Drop us a line below!
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">First name</label>
                      <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className={`w-full px-2 py-1.5 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 text-sm ${errors.firstName ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800/50'}`} />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">Last name <span className="text-gray-500">(Optional)</span></label>
                      <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-gray-800 focus:ring-gray-800/50 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} placeholder="you@mic.ac.in" className={`w-full px-2 py-1.5 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 text-sm ${errors.email ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800/50'}`} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="inquiryType" className="block text-xs font-medium text-gray-700 mb-1">Topic of Inquiry</label>
                    <select name="inquiryType" id="inquiryType" value={formData.inquiryType} onChange={handleChange} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:border-gray-800 focus:ring-gray-800/50 bg-white text-sm">
                      <option value="feedback">General Feedback</option>
                      <option value="suggestion">Menu Suggestion</option>
                      <option value="issue">Report an Issue (Service, Cleanliness)</option>
                      <option value="question">Question about an Order</option>
                      <option value="catering">Catering Request</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                    <textarea name="message" id="message" rows="3" value={formData.message} onChange={handleChange} placeholder="Tell us more..." className={`w-full px-2 py-1.5 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 resize-none text-sm ${errors.message ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800/50'}`}></textarea>
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                  </div>
                  {/* Privacy policy removed */}
                  <button type="submit" disabled={submissionStatus === 'submitting'} className="w-full flex items-center justify-center bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900 focus:ring-opacity-50 transition-all duration-300 disabled:bg-gray-400 text-base">
                     {submissionStatus === 'submitting' ? <LoaderCircle className="animate-spin" /> : 'Send Feedback'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Right Side: Just the Image */}
          <div 
              className="relative p-0 sm:p-0 text-white bg-cover bg-center flex-1 min-h-[420px] max-h-[700px] rounded-xl"
              style={{ backgroundImage: "url('/MITE.PNG')" }}
          >
              <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 