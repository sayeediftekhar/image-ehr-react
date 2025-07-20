import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const USG = () => {
    const { selectedClinic } = useAuth();
    const [usgRecords, setUsgRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    // Mock data for USG records
    const mockUsgRecords = [
        {
            id: "USG001",
            patientId: "OPD001",
            patientName: "Fatima Begum",
            visitId: "OPD-V001",
            usgType: "Obstetric",
            indication: "Routine pregnancy checkup",
            orderedBy: "Dr. Rahman",
            orderDate: "2024-01-15",
            scheduledDate: "2024-01-16",
            scheduledTime: "10:00 AM",
            status: "scheduled",
            technician: "Sonographer Ahmed",
            findings: null,
            cost: 1200,
        },
        {
            id: "USG002",
            patientId: "OPD002",
            patientName: "Mohammad Rahman",
            visitId: "OPD-V002",
            usgType: "Abdominal",
            indication: "Abdominal pain investigation",
            orderedBy: "Dr. Sultana",
            orderDate: "2024-01-15",
            scheduledDate: "2024-01-15",
            scheduledTime: "03:00 PM",
            status: "completed",
            technician: "Sonographer Fatima",
            findings: "Normal liver, gallbladder, and kidneys",
            cost: 1000,
        },
        {
            id: "USG003",
            patientId: "OPD003",
            patientName: "Rashida Khatun",
            visitId: "OPD-V003",
            usgType: "Pelvic",
            indication: "Pelvic examination",
            orderedBy: "Dr. Ahmed",
            orderDate: "2024-01-15",
            scheduledDate: "2024-01-15",
            scheduledTime: "04:30 PM",
            status: "in-progress",
            technician: "Sonographer Ahmed",
            findings: null,
            cost: 800,
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            setUsgRecords(mockUsgRecords);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredRecords = usgRecords.filter((record) => {
        const matchesSearch =
            record.patientName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.indication.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" || record.status === filterStatus;
        const matchesType =
            filterType === "all" || record.usgType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusBadge = (status) => {
        const statusStyles = {
            scheduled: "bg-blue-100 text-blue-800",
            "in-progress": "bg-yellow-100 text-yellow-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return statusStyles[status] || "bg-gray-100 text-gray-800";
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
                            USG Records
                        </h1>
                        <p className="text-gray-600">
                            {selectedClinic
                                ? `${selectedClinic.name} Clinic`
                                : "All Clinics"}{" "}
                            - Ultrasound Management
                        </p>
                    </div>
                    <Link
                        to="/outdoor/usg/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <i className="fas fa-plus"></i>
                        <span>Schedule USG</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-heartbeat text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total USG
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {usgRecords.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-calendar text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Scheduled
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    usgRecords.filter(
                                        (r) => r.status === "scheduled"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <i className="fas fa-spinner text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                In Progress
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    usgRecords.filter(
                                        (r) => r.status === "in-progress"
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
                                    usgRecords.filter(
                                        (r) => r.status === "completed"
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
                                placeholder="Search USG records..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Obstetric">Obstetric</option>
                            <option value="Abdominal">Abdominal</option>
                            <option value="Pelvic">Pelvic</option>
                            <option value="Cardiac">Cardiac</option>
                        </select>

                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {filteredRecords.length} of {usgRecords.length}{" "}
                        records
                    </div>
                </div>
            </div>

            {/* USG Records Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    USG ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    USG Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Schedule
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {record.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {record.orderDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {record.patientName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Visit: {record.visitId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {record.usgType} USG
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {record.indication}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            By: {record.orderedBy}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {record.scheduledDate}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {record.scheduledTime}
                                        </div>
                                        {record.technician && (
                                            <div className="text-xs text-gray-500">
                                                {record.technician}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                                record.status
                                            )}`}
                                        >
                                            {record.status}
                                        </span>
                                        {record.findings && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                Findings available
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ৳{record.cost}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/outdoor/usg/${record.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            {record.status === "completed" && (
                                                <button
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Print Report"
                                                >
                                                    <i className="fas fa-print"></i>
                                                </button>
                                            )}
                                            <button
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-heartbeat text-gray-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No USG records found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default USG;
