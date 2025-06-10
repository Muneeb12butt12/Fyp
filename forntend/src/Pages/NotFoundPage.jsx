import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="font-sans bg-gradient-to-br from-gray-50 to-indigo-50 flex justify-center items-center min-h-screen p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 sm:p-10 text-center">
          {/* Animated graphic */}
          <div className="relative mx-auto w-48 h-48 mb-8">
            <div className="absolute w-32 h-32 bg-indigo-500 rounded-full opacity-20 top-0 left-0 animate-float"></div>
            <div className="absolute w-24 h-24 bg-emerald-500 rounded-full opacity-20 bottom-0 right-0 animate-float delay-1000"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error code */}
          <h1 className="text-8xl font-bold bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text text-transparent mb-2">
            404
          </h1>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Home link */}
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Return to Homepage
          </Link>

          {/* Additional links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Contact Support
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Report Issue
            </a>
            <span className="text-gray-300">•</span>
            <a href="#" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Site Map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;