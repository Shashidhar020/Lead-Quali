// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
    <h1 className="text-4xl font-bold mb-4 text-gray-900">404 - Page Not Found</h1>
    <p className="mb-6 text-gray-700">The page you are looking for does not exist.</p>
    <Link
      to="/"
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
