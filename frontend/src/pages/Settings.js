// src/pages/Settings.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [profileData, setProfileData] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "",
        clinic_name: "",
    });

    const [systemSettings, setSystemSettings] = useState({
        clinic_name: "IMAGE Social Welfare Organisation",
        address: "123 Healthcare Street, Medical City",
        phone: "+880-1700-000000",
        email: "info@imageehr.com",
        timezone: "Asia/Dhaka",
        currency: "BDT",
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                full_name: user.full_name || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "",
                clinic_name: user.clinic_name || "",
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            await api.put("/api/auth/profile", profileData);
            setMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setMessage("New passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            await api.put("/api/auth/change-password", {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
            });
            setMessage("Password changed successfully!");
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: "",
            });
        } catch (error) {
            console.error("Error changing password:", error);
            setMessage(
                "Error changing password. Please check your current password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSystemSettingsUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            await api.put("/api/settings/system", systemSettings);
            setMessage("System settings updated successfully!");
        } catch (error) {
            console.error("Error updating system settings:", error);
            setMessage("Error updating system settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, title, icon, isActive, onClick }) => (
        <button
            onClick={() => onClick(id)}
            className={
                "flex items-center px-4 py-2 rounded-lg transition-colors " +
                (isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100")
            }
        >
            <i className={icon + " mr-2"}></i>
            {title}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">
                    Manage your account and system preferences
                </p>
            </div>

            {/* Message Display */}
            {message && (
                <div
                    className={
                        "p-4 rounded-lg " +
                        (message.includes("Error") ||
                        message.includes("do not match")
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-green-100 text-green-700 border border-green-200")
                    }
                >
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Settings Menu
                    </h2>
                    <div className="space-y-2">
                        <TabButton
                            id="profile"
                            title="Profile"
                            icon="fas fa-user"
                            isActive={activeTab === "profile"}
                            onClick={setActiveTab}
                        />
                        <TabButton
                            id="password"
                            title="Password"
                            icon="fas fa-lock"
                            isActive={activeTab === "password"}
                            onClick={setActiveTab}
                        />
                        <TabButton
                            id="system"
                            title="System"
                            icon="fas fa-cog"
                            isActive={activeTab === "system"}
                            onClick={setActiveTab}
                        />
                        <TabButton
                            id="backup"
                            title="Backup"
                            icon="fas fa-database"
                            isActive={activeTab === "backup"}
                            onClick={setActiveTab}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
                    {/* Profile Settings */}
                    {activeTab === "profile" && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Profile Settings
                            </h2>
                            <form
                                onSubmit={handleProfileUpdate}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.full_name}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    full_name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) =>
                                                setProfileData({
                                                    ...profileData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.role}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? "Updating..." : "Update Profile"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Password Settings */}
                    {activeTab === "password" && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Change Password
                            </h2>
                            <form
                                onSubmit={handlePasswordChange}
                                className="space-y-4 max-w-md"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                current_password:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                new_password: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm_password}
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                confirm_password:
                                                    e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        minLength="6"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading
                                        ? "Changing..."
                                        : "Change Password"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* System Settings */}
                    {activeTab === "system" && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                System Settings
                            </h2>
                            <form
                                onSubmit={handleSystemSettingsUpdate}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Clinic Name
                                        </label>
                                        <input
                                            type="text"
                                            value={systemSettings.clinic_name}
                                            onChange={(e) =>
                                                setSystemSettings({
                                                    ...systemSettings,
                                                    clinic_name: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={systemSettings.phone}
                                            onChange={(e) =>
                                                setSystemSettings({
                                                    ...systemSettings,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <textarea
                                            value={systemSettings.address}
                                            onChange={(e) =>
                                                setSystemSettings({
                                                    ...systemSettings,
                                                    address: e.target.value,
                                                })
                                            }
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={systemSettings.email}
                                            onChange={(e) =>
                                                setSystemSettings({
                                                    ...systemSettings,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Timezone
                                        </label>
                                        <select
                                            value={systemSettings.timezone}
                                            onChange={(e) =>
                                                setSystemSettings({
                                                    ...systemSettings,
                                                    timezone: e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="Asia/Dhaka">
                                                Asia/Dhaka
                                            </option>
                                            <option value="UTC">UTC</option>
                                            <option value="America/New_York">
                                                America/New_York
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading
                                        ? "Updating..."
                                        : "Update Settings"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Backup Settings */}
                    {activeTab === "backup" && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Backup & Restore
                            </h2>
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        Database Backup
                                    </h3>
                                    <p className="text-sm text-blue-700 mb-4">
                                        Create a backup of your database to
                                        ensure data safety.
                                    </p>
                                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        <i className="fas fa-download mr-2"></i>
                                        Create Backup
                                    </button>
                                </div>

                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h3 className="font-medium text-green-900 mb-2">
                                        Auto Backup
                                    </h3>
                                    <p className="text-sm text-green-700 mb-4">
                                        Automatically backup your data daily at
                                        2:00 AM.
                                    </p>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            defaultChecked
                                        />
                                        <span className="text-sm text-green-800">
                                            Enable automatic backups
                                        </span>
                                    </label>
                                </div>

                                <div className="p-4 bg-yellow-50 rounded-lg">
                                    <h3 className="font-medium text-yellow-900 mb-2">
                                        Restore Database
                                    </h3>
                                    <p className="text-sm text-yellow-700 mb-4">
                                        Restore your database from a previous
                                        backup file.
                                    </p>
                                    <input
                                        type="file"
                                        accept=".sql,.db"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
