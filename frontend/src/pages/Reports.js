// src/pages/Reports.js
import React, { useState, useEffect } from "react";
import api from "../services/api";

const Reports = () => {
    const [reportData, setReportData] = useState({
        patientStats: { total: 0, newThisMonth: 0, activeToday: 0 },
        revenueStats: { total: 0, thisMonth: 0, pending: 0 },
        appointmentStats: { total: 0, completed: 0, cancelled: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState("overview");

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/reports/overview");
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
            // Mock data for now
            setReportData({
                patientStats: { total: 150, newThisMonth: 25, activeToday: 8 },
                revenueStats: { total: 45000, thisMonth: 12000, pending: 3500 },
                appointmentStats: { total: 320, completed: 280, cancelled: 40 },
            });
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, subtitle, color }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
                <div className={"p-3 rounded-lg " + color}>
                    <i className={icon + " text-2xl text-white"}></i>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const ReportButton = ({
        id,
        title,
        description,
        icon,
        isActive,
        onClick,
    }) => (
        <button
            onClick={() => onClick(id)}
            className={
                "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 " +
                (isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")
            }
        >
            <div className="flex items-center">
                <i
                    className={
                        icon +
                        " text-xl " +
                        (isActive ? "text-blue-600" : "text-gray-400")
                    }
                ></i>
                <div className="ml-3">
                    <div
                        className={
                            "font-medium " +
                            (isActive ? "text-blue-900" : "text-gray-900")
                        }
                    >
                        {title}
                    </div>
                    <div className="text-sm text-gray-500">{description}</div>
                </div>
            </div>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading reports...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Reports & Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                    View comprehensive reports and analytics
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon="fas fa-users"
                    title="Patient Statistics"
                    value={reportData.patientStats.total}
                    subtitle={
                        reportData.patientStats.newThisMonth + " new this month"
                    }
                    color="bg-blue-500"
                />
                <StatCard
                    icon="fas fa-dollar-sign"
                    title="Revenue Statistics"
                    value={"$" + reportData.revenueStats.total.toLocaleString()}
                    subtitle={
                        "$" +
                        reportData.revenueStats.thisMonth.toLocaleString() +
                        " this month"
                    }
                    color="bg-green-500"
                />
                <StatCard
                    icon="fas fa-calendar-check"
                    title="Appointment Statistics"
                    value={reportData.appointmentStats.total}
                    subtitle={
                        reportData.appointmentStats.completed + " completed"
                    }
                    color="bg-purple-500"
                />
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Selection */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Available Reports
                    </h2>
                    <div className="space-y-3">
                        <ReportButton
                            id="overview"
                            title="Overview Report"
                            description="General statistics and summary"
                            icon="fas fa-chart-pie"
                            isActive={selectedReport === "overview"}
                            onClick={setSelectedReport}
                        />
                        <ReportButton
                            id="patients"
                            title="Patient Report"
                            description="Patient demographics and trends"
                            icon="fas fa-users"
                            isActive={selectedReport === "patients"}
                            onClick={setSelectedReport}
                        />
                        <ReportButton
                            id="financial"
                            title="Financial Report"
                            description="Revenue and billing analysis"
                            icon="fas fa-chart-line"
                            isActive={selectedReport === "financial"}
                            onClick={setSelectedReport}
                        />
                        <ReportButton
                            id="appointments"
                            title="Appointment Report"
                            description="Visit patterns and scheduling"
                            icon="fas fa-calendar-alt"
                            isActive={selectedReport === "appointments"}
                            onClick={setSelectedReport}
                        />
                    </div>
                </div>

                {/* Report Content */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {selectedReport === "overview" && "Overview Report"}
                            {selectedReport === "patients" && "Patient Report"}
                            {selectedReport === "financial" &&
                                "Financial Report"}
                            {selectedReport === "appointments" &&
                                "Appointment Report"}
                        </h2>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                <i className="fas fa-download mr-1"></i>
                                Export PDF
                            </button>
                            <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                                <i className="fas fa-file-excel mr-1"></i>
                                Export Excel
                            </button>
                        </div>
                    </div>

                    {/* Report Content Based on Selection */}
                    {selectedReport === "overview" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {reportData.patientStats.total}
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        Total Patients
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        $
                                        {reportData.revenueStats.total.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-green-800">
                                        Total Revenue
                                    </div>
                                </div>
                            </div>
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-chart-bar text-4xl mb-4"></i>
                                <p>
                                    Detailed charts and graphs would appear here
                                </p>
                                <p className="text-sm">
                                    Connect to your analytics service for visual
                                    reports
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedReport === "patients" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-blue-600">
                                        {reportData.patientStats.total}
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        Total Patients
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-green-600">
                                        {reportData.patientStats.newThisMonth}
                                    </div>
                                    <div className="text-sm text-green-800">
                                        New This Month
                                    </div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-purple-600">
                                        {reportData.patientStats.activeToday}
                                    </div>
                                    <div className="text-sm text-purple-800">
                                        Active Today
                                    </div>
                                </div>
                            </div>
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-users text-4xl mb-4"></i>
                                <p>Patient demographics and analysis charts</p>
                            </div>
                        </div>
                    )}

                    {selectedReport === "financial" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-green-600">
                                        $
                                        {reportData.revenueStats.total.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-green-800">
                                        Total Revenue
                                    </div>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-blue-600">
                                        $
                                        {reportData.revenueStats.thisMonth.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        This Month
                                    </div>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-orange-600">
                                        $
                                        {reportData.revenueStats.pending.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-orange-800">
                                        Pending
                                    </div>
                                </div>
                            </div>
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-chart-line text-4xl mb-4"></i>
                                <p>Financial trends and revenue analysis</p>
                            </div>
                        </div>
                    )}

                    {selectedReport === "appointments" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-blue-600">
                                        {reportData.appointmentStats.total}
                                    </div>
                                    <div className="text-sm text-blue-800">
                                        Total Appointments
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-green-600">
                                        {reportData.appointmentStats.completed}
                                    </div>
                                    <div className="text-sm text-green-800">
                                        Completed
                                    </div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-red-600">
                                        {reportData.appointmentStats.cancelled}
                                    </div>
                                    <div className="text-sm text-red-800">
                                        Cancelled
                                    </div>
                                </div>
                            </div>
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-calendar-alt text-4xl mb-4"></i>
                                <p>
                                    Appointment patterns and scheduling analysis
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
