import React, { useState } from 'react';
import { CountryDropdown } from 'react-country-region-selector';

const PhoneNumberForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+1', // Default to US
    phoneNumber: '',
    email: ''
  });
  
  const [errors, setErrors] = useState({
    phoneNumber: '',
    email: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle country selection
  const handleCountrySelect = (country) => {
    // Get country code from country name
    const code = getCountryCode(country);
    setFormData(prev => ({...prev, countryCode: code}));
  };

  // Handle phone number input
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({...prev, phoneNumber: value}));
    
    // Clear error when typing
    if (errors.phoneNumber && value.length > 7) {
      setErrors(prev => ({...prev, phoneNumber: ''}));
    }
  };

  // Validate phone number with country code
  const validatePhoneNumber = () => {
    const { countryCode, phoneNumber } = formData;
    const fullNumber = countryCode + phoneNumber;
    
    if (!phoneNumber) return 'Phone number is required';
    if (phoneNumber.length < 8) return 'Too short';
    if (phoneNumber.length > 15) return 'Too long';
    if (!/^\+?[0-9]{8,15}$/.test(fullNumber)) return 'Invalid number';
    return '';
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate
    const phoneError = validatePhoneNumber();
    setErrors({ phoneNumber: phoneError });
    
    if (phoneError) {
      setIsSubmitting(false);
      return;
    }
    
    // Submit data (replace with actual API call)
    try {
      const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
      console.log('Submitting:', { ...formData, phoneNumber: fullPhoneNumber });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Country code lookup (simplified)
  const getCountryCode = (countryName) => {
    const countryCodes = {
      'United States': '+1',
      'Canada': '+1',
      'United Kingdom': '+44',
      'Australia': '+61',
      // Add more countries as needed
    };
    return countryCodes[countryName] || '+1';
  };

  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Success!</h2>
        <p>Your information has been submitted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Form</h2>

      {/* Phone Number Field */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Phone Number
          {errors.phoneNumber && (
            <span className="ml-2 text-sm text-red-600">{errors.phoneNumber}</span>
          )}
        </label>
        
        <div className="flex gap-2">
          {/* Country Dropdown */}
          <div className="w-1/3">
            <CountryDropdown
              value={formData.country}
              onChange={handleCountrySelect}
              classes="w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              defaultOptionLabel="Select Country"
            />
          </div>
          
          {/* Country Code Display */}
          <div className="w-1/4 flex items-center justify-center px-2 border border-gray-200 rounded-md bg-gray-50">
            {formData.countryCode}
          </div>
          
          {/* Phone Number Input */}
          <div className="w-2/3">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              onBlur={() => setErrors({ phoneNumber: validatePhoneNumber() })}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="15"
              required
              className={`w-full px-3 py-2 border ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="1234567890"
            />
          </div>
        </div>
        
        {!errors.phoneNumber && (
          <p className="mt-1 text-xs text-gray-500">
            Enter {formData.countryCode} followed by your number
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default PhoneNumberForm;