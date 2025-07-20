import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OutdoorVisits = () => {
    const { selectedClinic } = useAuth();
    const [searchParams] = useSearchParams();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("today");
    const [filterStatus, setFilterStatus] = useState("all");

    // Mock data for outdoor visits
    const mockVisits = [
        {
            id: "OPD-V001",
            patientId: "OPD001",
            patientName: "Fatima Begum",
            age: 28,
            gender: "Female",
            visitDate: "2024-01-15",
            visitTime: "10:30 AM",
            doctor: "Dr. Rahman",
            complaint: "Fever and headache",
            diagnosis: "Viral fever",
            status: "completed",
            followUp: "2024-01-22",
        },
        {
            id: "OPD-V002",
            patientId: "OPD002",
            patientName: "Mohammad Rahman",
            age: 45,
            gender: "Male",
            visitDate: "2024-01-15",
            visitTime: "11:15 AM",
            doctor: "Dr. Sultana",
            complaint: "Chest pain",
            diagnosis: "Pending investigation",
            status: "in-progress",
            followUp: null,
        },
        {
            id: "OPD-V003",
            patientId: "OPD003",
            patientName: "Rashida Khatun",
            age: 32,
            gender: "Female",
            visitDate: "2024-01-15",
            visitTime: "02:00 PM",
            doctor: "Dr. Ahmed",
            complaint: "Regular checkup",
            diagnosis: "Normal",
            status: "waiting",
            followUp: null,
        },
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setVisits(mockVisits);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter visits
    const filteredVisits = visits.filter((visit) => {
        const matchesSearch =
            visit.patientName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            visit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.complaint.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "all" || visit.status === filterStatus;

        // Date filtering logic would go here
        const matchesDate = true; // Simplified for now

        return matchesSearch && matchesStatus && matchesDate;
    });

    const getStatusBadge = (status) => {
        const statusStyles = {
            waiting: "bg-yellow-100 text-yellow-800",
            "in-progress": "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return statusStyles[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status) => {
        const statusIcons = {
            waiting: "fas fa-clock",
            "in-progress": "fas fa-spinner",
            completed: "fas fa-check-circle",
            cancelled: "fas fa-times-circle",
        };
        return statusIcons[status] || "fas fa-question-circle";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Outdoor Visits
                        </h1>
                        <p className="text-gray-600">
                            {selectedClinic
                                ? `${selectedClinic.name} Clinic`
                                : "All Clinics"}{" "}
                            - OPD Visit Management
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            to="/outdoor/visits/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <i className="fas fa-plus"></i>
                            <span>New Visit</span>
                        </Link>
                        <Link
                            to="/outdoor/visits/queue"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <i className="fas fa-list"></i>
                            <span>Queue</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-calendar-check text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Today's Visits
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {visits.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <i className="fas fa-clock text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Waiting
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    visits.filter((v) => v.status === "waiting")
                                        .length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-spinner text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                In Progress
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    visits.filter(
                                        (v) => v.status === "in-progress"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-check-circle text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Completed
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    visits.filter(
                                        (v) => v.status === "completed"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow border mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search visits..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>

                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="waiting">Waiting</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {filteredVisits.length} of {visits.length}{" "}
                        visits
                    </div>
                </div>
            </div>

            {/* Visits Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Visit ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Doctor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Complaint
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
                            {filteredVisits.map((visit) => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {visit.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {visit.visitDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <i
                                                        className={`fas ${
                                                            visit.gender ===
                                                            "Female"
                                                                ? "fa-female"
                                                                : "fa-male"
                                                        } text-blue-600 text-sm`}
                                                    ></i>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {visit.patientName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Age: {visit.age}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {visit.visitTime}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {visit.doctor}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {visit.complaint}
                                        </div>
                                        {visit.diagnosis && (
                                            <div className="text-sm text-gray-500">
                                                Diagnosis: {visit.diagnosis}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                                                visit.status
                                            )}`}
                                        >
                                            <i
                                                className={`${getStatusIcon(
                                                    visit.status
                                                )} mr-1`}
                                            ></i>
                                            {visit.status.replace("-", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/outdoor/visits/${visit.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <Link
                                                to={`/outdoor/visits/${visit.id}/edit`}
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit Visit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <Link
                                                to={`/outdoor/billing/new?visit=${visit.id}`}
                                                className="text-purple-600 hover:text-purple-900"
                                                title="Create Bill"
                                            >
                                                <i className="fas fa-file-invoice-dollar"></i>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredVisits.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-calendar-times text-gray-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No visits found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OutdoorVisits;
