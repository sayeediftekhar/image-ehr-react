// src/pages/Visits.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Visits = () => {
    const navigate = useNavigate();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, today, upcoming, completed

    useEffect(() => {
        fetchVisits();
    }, [filter]);

    const fetchVisits = async () => {
        try {
            setLoading(true);
            // Replace with your actual API endpoint
            const response = await api.get("/api/visits?filter=" + filter);
            setVisits(response.data);
        } catch (error) {
            console.error("Error fetching visits:", error);
            // Mock data for now
            setVisits([
                {
                    id: 1,
                    patient_name: "John Doe",
                    patient_id: "P001",
                    appointment_date: "2025-06-05",
                    appointment_time: "10:00 AM",
                    doctor: "Dr. Smith",
                    status: "scheduled",
                    type: "consultation",
                },
                {
                    id: 2,
                    patient_name: "Jane Smith",
                    patient_id: "P002",
                    appointment_date: "2025-06-05",
                    appointment_time: "2:00 PM",
                    doctor: "Dr. Johnson",
                    status: "completed",
                    type: "follow-up",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            case "no-show":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getFilterButtonClass = (filterKey) => {
        return filter === filterKey
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Visits & Appointments
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage patient appointments and visits
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/visits/add")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Schedule Visit
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setFilter("all")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("all")
                        }
                    >
                        All Visits
                    </button>
                    <button
                        onClick={() => setFilter("today")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("today")
                        }
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("upcoming")
                        }
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("completed")
                        }
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Visits List */}
            <div className="bg-white rounded-xl shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Doctor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visits.map((visit) => (
                                    <tr
                                        key={visit.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {visit.patient_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {visit.patient_id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {visit.appointment_date}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {visit.appointment_time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {visit.doctor}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                            {visit.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={
                                                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full " +
                                                    getStatusColor(visit.status)
                                                }
                                            >
                                                {visit.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-blue-600 hover:text-blue-900 mr-3">
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button className="text-green-600 hover:text-green-900 mr-3">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Visits;
