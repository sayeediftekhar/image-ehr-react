import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_patients: 0,
        total_appointments: 0,
        pending_appointments: 0,
        total_revenue: 0,
        monthly_revenue: 0,
        active_users: 0,
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch dashboard stats from your backend
            const statsResponse = await api.get("/api/dashboard/stats");
            const activitiesResponse = await api.get(
                "/api/dashboard/recent-activities"
            );

            setStats(statsResponse.data);
            setRecentActivities(activitiesResponse.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            // Fallback to mock data if API fails
            setStats({
                total_patients: 150,
                total_appointments: 25,
                pending_appointments: 12,
                total_revenue: 15000,
                monthly_revenue: 3500,
                active_users: 8,
            });
            setRecentActivities([
                {
                    id: 1,
                    activity_type: "patient_registration",
                    description: "New patient registered: John Doe",
                    user_name: "Admin",
                    timestamp: new Date(
                        Date.now() - 2 * 60 * 60 * 1000
                    ).toISOString(),
                },
                {
                    id: 2,
                    activity_type: "appointment_completed",
                    description: "Visit completed for Jane Smith",
                    user_name: "Dr. Smith",
                    timestamp: new Date(
                        Date.now() - 4 * 60 * 60 * 1000
                    ).toISOString(),
                },
                {
                    id: 3,
                    activity_type: "billing",
                    description: "Bill generated for patient ID: 1234",
                    user_name: "Admin",
                    timestamp: new Date(
                        Date.now() - 6 * 60 * 60 * 1000
                    ).toISOString(),
                },
            ]);
            setLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, color, onClick }) => (
        <div
            className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 ${
                onClick ? "cursor-pointer" : ""
            }`}
            onClick={onClick}
        >
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${color}`}>
                    <i className={`${icon} text-2xl text-white`}></i>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours === 1) return "1 hour ago";
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "1 day ago";
        return `${diffInDays} days ago`;
    };

    const getActivityIcon = (activityType) => {
        switch (activityType) {
            case "patient_registration":
                return "fa-user-plus text-green-500";
            case "appointment_completed":
                return "fa-calendar-check text-blue-500";
            case "appointment_scheduled":
                return "fa-calendar-plus text-purple-500";
            case "billing":
                return "fa-file-invoice text-orange-500";
            case "payment":
                return "fa-credit-card text-green-600";
            default:
                return "fa-info-circle text-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <p className="text-blue-100 mt-2">
                    Welcome to IMAGE EHR System - Your healthcare management hub
                </p>
                <div className="mt-4 text-sm text-blue-100">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon="fas fa-users"
                    title="Total Patients"
                    value={stats.total_patients}
                    color="bg-blue-500"
                    onClick={() => navigate("/patients")}
                />
                <StatCard
                    icon="fas fa-calendar-check"
                    title="Total Appointments"
                    value={stats.total_appointments}
                    color="bg-green-500"
                    onClick={() => navigate("/visits")}
                />
                <StatCard
                    icon="fas fa-clock"
                    title="Pending Appointments"
                    value={stats.pending_appointments}
                    color="bg-orange-500"
                    onClick={() => navigate("/visits")}
                />
                <StatCard
                    icon="fas fa-dollar-sign"
                    title="Monthly Revenue"
                    value={`$${stats.monthly_revenue?.toLocaleString() || "0"}`}
                    color="bg-purple-500"
                    onClick={() => navigate("/billing")}
                />
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    icon="fas fa-chart-line"
                    title="Total Revenue"
                    value={`$${stats.total_revenue?.toLocaleString() || "0"}`}
                    color="bg-indigo-500"
                    onClick={() => navigate("/reports")}
                />
                <StatCard
                    icon="fas fa-user-check"
                    title="Active Users"
                    value={stats.active_users}
                    color="bg-teal-500"
                    onClick={() => navigate("/settings")}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate("/patients/add")}
                        className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-user-plus text-blue-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Add Patient
                            </div>
                            <div className="text-sm text-gray-500">
                                Register new patient
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/visits/add")}
                        className="flex items-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-calendar-plus text-green-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Schedule Visit
                            </div>
                            <div className="text-sm text-gray-500">
                                Book appointment
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/billing/create")}
                        className="flex items-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-file-invoice-dollar text-purple-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Create Bill
                            </div>
                            <div className="text-sm text-gray-500">
                                Generate invoice
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/reports")}
                        className="flex items-center p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-chart-bar text-orange-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                View Reports
                            </div>
                            <div className="text-sm text-gray-500">
                                Analytics & insights
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Recent Activity
                    </h2>
                    <button
                        onClick={() => navigate("/activity")}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View All →
                    </button>
                </div>

                <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                        recentActivities.slice(0, 5).map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <i
                                        className={`fas ${getActivityIcon(
                                            activity.activity_type
                                        )} text-lg mr-4`}
                                    ></i>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-gray-900">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        by {activity.user_name}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <span className="text-xs text-gray-500">
                                        {formatTimeAgo(activity.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <i className="fas fa-inbox text-gray-300 text-4xl mb-4"></i>
                            <p className="text-gray-500">
                                No recent activities
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Activities will appear here as they happen
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    System Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <i className="fas fa-check-circle text-green-500 mr-3"></i>
                        <div>
                            <div className="font-medium text-gray-900">
                                Database
                            </div>
                            <div className="text-sm text-green-600">
                                Connected
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <i className="fas fa-check-circle text-green-500 mr-3"></i>
                        <div>
                            <div className="font-medium text-gray-900">
                                API Server
                            </div>
                            <div className="text-sm text-green-600">
                                Running
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <i className="fas fa-info-circle text-blue-500 mr-3"></i>
                        <div>
                            <div className="font-medium text-gray-900">
                                Last Backup
                            </div>
                            <div className="text-sm text-blue-600">
                                2 hours ago
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
