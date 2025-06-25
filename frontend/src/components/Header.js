import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const { user, logout, clinics, selectedClinic, switchClinic } = useAuth();
    const [showClinicDropdown, setShowClinicDropdown] = useState(false);

    const handleClinicSwitch = (clinic) => {
        switchClinic(clinic);
        setShowClinicDropdown(false);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
                {/* Left side - Title and Clinic Selector */}
                <div className="flex items-center space-x-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        IMAGE EHR System
                    </h1>

                    {/* Clinic Dropdown - Only show for system admin or when clinic is selected */}
                    {(user?.role === "system_admin" || selectedClinic) && (
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowClinicDropdown(!showClinicDropdown)
                                }
                                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition-colors"
                            >
                                <i className="fas fa-hospital text-blue-600"></i>
                                <span className="font-medium text-blue-800">
                                    {selectedClinic
                                        ? selectedClinic.name
                                        : "Select Clinic"}
                                </span>
                                <i
                                    className={`fas fa-chevron-${
                                        showClinicDropdown ? "up" : "down"
                                    } text-blue-600 text-sm`}
                                ></i>
                            </button>

                            {/* Dropdown Menu */}
                            {showClinicDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                                            Select Clinic
                                        </div>
                                        {clinics.map((clinic) => (
                                            <button
                                                key={clinic.id}
                                                onClick={() =>
                                                    handleClinicSwitch(clinic)
                                                }
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                                    selectedClinic?.id ===
                                                    clinic.id
                                                        ? "bg-blue-50 border-r-2 border-blue-500"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {clinic.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Manager:{" "}
                                                            {clinic.manager}
                                                        </div>
                                                    </div>
                                                    {selectedClinic?.id ===
                                                        clinic.id && (
                                                        <i className="fas fa-check text-blue-600"></i>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right side - User info and logout */}
                <div className="flex items-center space-x-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div className="text-right">
                            <div className="font-medium text-gray-900">
                                {user?.role === "system_admin"
                                    ? "System Administrator"
                                    : user?.full_name || "User"}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                                {user?.role?.replace("_", " ")}
                            </div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showClinicDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowClinicDropdown(false)}
                ></div>
            )}
        </header>
    );
};

export default Header;
