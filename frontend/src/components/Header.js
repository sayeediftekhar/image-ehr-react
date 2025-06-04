import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">
            System Administrator
          </span>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;