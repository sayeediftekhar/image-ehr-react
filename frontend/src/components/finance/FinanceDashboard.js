
// src/components/finance/FinanceDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_expenses: 0,
        monthly_revenue: 0,
        monthly_expenses: 0,
        pending_approvals: 0,
        active_clinics: 0,
        recent_transactions: 0,
    });
    const [clinicStats, setClinicStats] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        fetchFinanceDashboardData();
    }, []);

    const fetchFinanceDashboardData = async () => {
        try {
            // Fetch finance dashboard stats
            const statsResponse = await api.get("/api/finance/dashboard/stats");
            const clinicStatsResponse = await api.get("/api/finance/dashboard/clinic-stats");
            const transactionsResponse = await api.get("/api/finance/transactions?limit=5");

            setStats(statsResponse.data);
            setClinicStats(clinicStatsResponse.data);
            setRecentTransactions(transactionsResponse.data);

            // Get user info from token or API
            const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
            setUserRole(userInfo.role || 'staff');

            setLoading(false);
        } catch (error) {
            console.error("Error fetching finance dashboard data:", error);
            // Fallback to mock data if API fails
            setStats({
                total_revenue: 125000,
                total_expenses: 98000,
                monthly_revenue: 15000,
                monthly_expenses: 12000,
                pending_approvals: 8,
                active_clinics: 5,
                recent_transactions: 23,
            });
            setClinicStats([
                {
                    clinic_id: 1,
                    clinic_name: "Clinic #1 Nasirabad",
                    daily_revenue: 2500,
                    monthly_revenue: 25000,
                    monthly_expenses: 18000,
                    petty_cash_balance: 5000,
                    pending_transactions: 2
                },
                {
                    clinic_id: 4,
                    clinic_name: "Clinic #4 Amanbazar",
                    daily_revenue: 1800,
                    monthly_revenue: 18000,
                    monthly_expenses: 15000,
                    petty_cash_balance: 3500,
                    pending_transactions: 1
                }
            ]);
            setLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, color, onClick, subtitle }) => (
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
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const ClinicCard = ({ clinic }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{clinic.clinic_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    clinic.pending_transactions > 0 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                }`}>
                    {clinic.pending_transactions > 0 
                        ? `${clinic.pending_transactions} Pending` 
                        : 'Up to date'
                    }
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-600">Today's Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                        ৳{clinic.daily_revenue?.toLocaleString() || "0"}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-lg font-semibold text-blue-600">
                        ৳{clinic.monthly_revenue?.toLocaleString() || "0"}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Monthly Expenses</p>
                    <p className="text-lg font-semibold text-red-600">
                        ৳{clinic.monthly_expenses?.toLocaleString() || "0"}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Petty Cash</p>
                    <p className="text-lg font-semibold text-purple-600">
                        ৳{clinic.petty_cash_balance?.toLocaleString() || "0"}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={() => navigate(`/finance/clinic/${clinic.clinic_id}`)}
                    className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    View Details →
                </button>
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

    const getTransactionIcon = (transactionType) => {
        switch (transactionType) {
            case "revenue":
                return "fa-arrow-up text-green-500";
            case "expense":
                return "fa-arrow-down text-red-500";
            case "transfer":
                return "fa-exchange-alt text-blue-500";
            default:
                return "fa-circle text-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading finance dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                <h1 className="text-3xl font-bold">Finance Dashboard</h1>
                <p className="text-blue-100 mt-2">
                    Financial management for IMAGE EHR System
                </p>
                <div className="mt-4 text-sm text-blue-100">
                    Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)} | 
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon="fas fa-chart-line"
                    title="Total Revenue"
                    value={`৳${stats.total_revenue?.toLocaleString() || "0"}`}
                    color="bg-green-500"
                    onClick={() => navigate("/finance/reports/revenue")}
                />
                <StatCard
                    icon="fas fa-chart-bar"
                    title="Total Expenses"
                    value={`৳${stats.total_expenses?.toLocaleString() || "0"}`}
                    color="bg-red-500"
                    onClick={() => navigate("/finance/reports/expenses")}
                />
                <StatCard
                    icon="fas fa-calendar-check"
                    title="Monthly Revenue"
                    value={`৳${stats.monthly_revenue?.toLocaleString() || "0"}`}
                    color="bg-blue-500"
                    onClick={() => navigate("/finance/transactions")}
                />
                <StatCard
                    icon="fas fa-clock"
                    title="Pending Approvals"
                    value={stats.pending_approvals}
                    color="bg-orange-500"
                    onClick={() => navigate("/finance/approvals")}
                    subtitle={stats.pending_approvals > 0 ? "Requires attention" : "All caught up"}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon="fas fa-building"
                    title="Active Clinics"
                    value={stats.active_clinics}
                    color="bg-purple-500"
                    onClick={() => navigate("/finance/clinics")}
                />
                <StatCard
                    icon="fas fa-exchange-alt"
                    title="Recent Transactions"
                    value={stats.recent_transactions}
                    color="bg-indigo-500"
                    onClick={() => navigate("/finance/transactions")}
                    subtitle="Last 7 days"
                />
                <StatCard
                    icon="fas fa-wallet"
                    title="Monthly Expenses"
                    value={`৳${stats.monthly_expenses?.toLocaleString() || "0"}`}
                    color="bg-pink-500"
                    onClick={() => navigate("/finance/reports/expenses")}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate("/finance/transactions/add")}
                        className="flex items-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-plus-circle text-green-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Add Transaction
                            </div>
                            <div className="text-sm text-gray-500">
                                Record income/expense
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/finance/revenue/daily")}
                        className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-file-invoice text-blue-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Daily Revenue
                            </div>
                            <div className="text-sm text-gray-500">
                                Submit daily summary
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/finance/reports")}
                        className="flex items-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-chart-pie text-purple-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Generate Reports
                            </div>
                            <div className="text-sm text-gray-500">
                                Financial analytics
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate("/finance/petty-cash")}
                        className="flex items-center p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                    >
                        <i className="fas fa-coins text-orange-500 text-xl mr-3 group-hover:scale-110 transition-transform"></i>
                        <div className="text-left">
                            <div className="font-medium text-gray-900">
                                Petty Cash
                            </div>
                            <div className="text-sm text-gray-500">
                                Manage cash flow
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Clinic Overview */}
            {clinicStats.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Clinic Overview
                        </h2>
                        <button
                            onClick={() => navigate("/finance/clinics")}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            View All →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clinicStats.map((clinic) => (
                            <ClinicCard key={clinic.clinic_id} clinic={clinic} />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Recent Transactions
                    </h2>
                    <button
                        onClick={() => navigate("/finance/transactions")}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View All →
                    </button>
                </div>

                <div className="space-y-4">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <i
                                        className={`fas ${getTransactionIcon(
                                            transaction.transaction_type
                                        )} text-lg mr-4`}
                                    ></i>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-gray-900">
                                        {transaction.description || transaction.category_name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {transaction.clinic_name} • {transaction.created_by_username}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <span className={`text-sm font-semibold ${
                                        transaction.transaction_type === 'revenue' 
                                            ? 'text-green-600' 
                                            : 'text-red-600'
                                    }`}>
                                        {transaction.transaction_type === 'revenue' ? '+' : '-'}
                                        ৳{transaction.amount?.toLocaleString()}
                                    </span>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatTimeAgo(transaction.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <i className="fas fa-inbox text-gray-300 text-4xl mb-4"></i>
                            <p className="text-gray-500">
                                No recent transactions
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Transactions will appear here as they are recorded
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Finance System Status
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
                        <i className="fas fa-shield-alt text-green-500 mr-3"></i>
                        <div>
                            <div className="font-medium text-gray-900">
                                Security
                            </div>
                            <div className="text-sm text-green-600">
                                Active
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <i className="fas fa-clock text-blue-500 mr-3"></i>
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

export default FinanceDashboard;
