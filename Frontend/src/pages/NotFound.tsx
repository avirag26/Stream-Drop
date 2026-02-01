import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 with glow effect */}
        <div className="mb-8 relative">
          <h1 className="text-[160px] md:text-[200px] font-bold text-blue-600 leading-none animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl opacity-30 bg-blue-600"></div>
        </div>

        {/* Decorative line */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mb-8 animate-pulse"></div>

        {/* Message */}
        <div className="space-y-4 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-10">
          <svg className="w-48 h-48 mx-auto text-gray-700 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-600/50"
          >
            Go Home
          </Link>

          <span className="text-gray-500 font-medium">or</span>

          <Link 
            to="/dashboard"
            className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transform hover:scale-105 transition-all duration-200"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Additional help text */}
        <p className="mt-12 text-gray-600 text-sm">
          Lost? Try going back to the <Link to="/" className="text-blue-500 hover:text-blue-400 underline">homepage</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;