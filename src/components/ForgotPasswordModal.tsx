import React, { useState } from 'react';
import { X, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { authHelpers } from '../config/supabase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await authHelpers.resetPassword(email);
      
      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } else {
        setMessage('Password reset email sent! Check your inbox.');
        setIsSuccess(true);
        setEmail('');
      }
    } catch (error) {
      setMessage('Failed to send reset email. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email address"
              required
            />
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center space-x-2 text-sm p-3 rounded-lg ${
              isSuccess 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Sending...
              </div>
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={handleClose}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};