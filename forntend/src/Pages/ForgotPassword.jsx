import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      if (response.data.success) {
        toast.success('Password reset email sent successfully!');
        setIsSubmitted(true);
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         'Failed to send reset email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="mb-4">We've sent a password reset link to {email}</p>
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/signin')}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
          >
            Back to Login
          </button>
          <button
            onClick={() => navigate('/verify-code', { state: { email } })}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Enter Verification Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Enter your registered email"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/signin" className="text-blue-600 hover:underline">
          Remember your password? Login here
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;