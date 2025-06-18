import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '', // Default to buyer
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const navigate = useNavigate();

  // Check email availability when email changes
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!formData.email || errors.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
        setEmailAvailable(null);
        return;
      }

      setEmailChecking(true);
      try {
        const { data } = await axios.post("http://localhost:5000/api/auth/check-email", {
          email: formData.email.trim().toLowerCase()
        });

        if (data.exists) {
          setEmailAvailable(false);
          setErrors(prev => ({ ...prev, email: "This email is already registered" }));
        } else {
          setEmailAvailable(true);
          setErrors(prev => ({ ...prev, email: "" }));
        }
      } catch (error) {
        console.error("Email check error:", error);
        toast.error("Failed to check email availability");
      } finally {
        setEmailChecking(false);
      }
    };

    const timer = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { firstName, lastName, email, phone, password, confirmPassword, agreeToTerms } = formData;

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    else if (firstName.length < 2) newErrors.firstName = 'At least 2 characters';

    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (lastName.length < 2) newErrors.lastName = 'At least 2 characters';

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email';
    else if (emailAvailable === false) newErrors.email = 'This email is already registered';

    if (phone && !/^(\+92|0)[0-9]{10}$/.test(phone)) newErrors.phone = 'Invalid Pakistani phone number';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'At least 6 characters';

    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";

    if (!agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 11) return `+92${digits.slice(1)}`;
    if (digits.startsWith('92') && digits.length === 12) return `+${digits}`;
    return `+${digits}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (emailAvailable === false) {
      toast.error("Please use a different email address");
      return;
    }
  
    setLoading(true);
  
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formatPhoneNumber(formData.phone.trim()) : undefined,
        password: formData.password,
        userType: formData.userType // Include userType in the payload
      };
  
      const { data } = await axios.post("http://localhost:5000/api/auth/register", payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 5000,
      });
  
      if (data.token) {
        toast.success("Registration successful! Please login to continue");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/signin", { state: { welcomeMessage: true } });
      }
    } catch (error) {
      const message = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;

      if (validationErrors) {
        setErrors(validationErrors);
        toast.error("Please fix the errors in the form");
      } else if (typeof message === "string" && message.includes("already exists")) {
        setErrors({ email: "This email is already registered" });
        setEmailAvailable(false);
        toast.error("This email is already registered");
      } else {
        toast.error(message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div className="w-1/2">
                <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {emailChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  </div>
                )}
                {emailAvailable === true && !errors.email && (
                  <div className="absolute right-3 top-3 text-green-500">
                    ✓
                  </div>
                )}
              </div>
              {errors.email ? (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              ) : emailAvailable === true && (
                <p className="text-green-500 text-sm mt-1">Email is available</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium">Phone (Optional)</label>
              <input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Register As</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="userType"
                    value="buyer"
                    checked={formData.userType === 'buyer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span>Buyer</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="userType"
                    value="seller"
                    checked={formData.userType === 'seller'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span>Seller</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <label htmlFor="agreeToTerms" className="text-sm">
                I agree to the <Link to="/terms" className="text-blue-600 underline">terms and conditions</Link>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70"
              disabled={loading || emailChecking || emailAvailable === false}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>

            <p className="text-sm text-center mt-4">
              Already have an account? <Link to="/signin" className="text-blue-600 underline">Login</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp;