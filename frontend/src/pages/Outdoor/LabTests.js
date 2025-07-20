import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LabTests = () => {
    const { selectedClinic } = useAuth();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    // Mock data for lab tests
    const mockTests = [
        {
            id: "LAB001",
            patientId: "OPD001",
            patientName: "Fatima Begum",
            visitId: "OPD-V001",
            testType: "Blood Test",
            testName: "Complete Blood Count (CBC)",
            orderedBy: "Dr. Rahman",
            orderDate: "2024-01-15",
            sampleCollected: "2024-01-15 11:30 AM",
            status: "completed",
            results: "Normal",
            cost: 500,
        },
        {
            id: "LAB002",
            patientId: "OPD002",
            patientName: "Mohammad Rahman",
            visitId: "OPD-V002",
            testType: "Blood Test",
            testName: "Lipid Profile",
            orderedBy: "Dr. Sultana",
            orderDate: "2024-01-15",
            sampleCollected: null,
            status: "pending",
            results: null,
            cost: 800,
        },
        {
            id: "LAB003",
            patientId: "OPD003",
            patientName: "Rashida Khatun",
            visitId: "OPD-V003",
            testType: "Urine Test",
            testName: "Routine Urine Examination",
            orderedBy: "Dr. Ahmed",
            orderDate: "2024-01-15",
            sampleCollected: "2024-01-15 02:15 PM",
            status: "in-progress",
            results: null,
            cost: 300,
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            setTests(mockTests);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredTests = tests.filter((test) => {
        const matchesSearch =
            test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.testName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" || test.status === filterStatus;
        const matchesType =
            filterType === "all" || test.testType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: "bg-yellow-100 text-yellow-800",
            "in-progress": "bg-blue-100 text-blue-800",
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
                            Lab Tests
                        </h1>
                        <p className="text-gray-600">
                            {selectedClinic
                                ? `${selectedClinic.name} Clinic`
                                : "All Clinics"}{" "}
                            - Laboratory Test Management
                        </p>
                    </div>
                    <Link
                        to="/outdoor/lab-tests/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <i className="fas fa-plus"></i>
                        <span>Order Test</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-flask text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Tests
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tests.length}
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
                                Pending
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    tests.filter((t) => t.status === "pending")
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
                                    tests.filter(
                                        (t) => t.status === "in-progress"
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
                                    tests.filter(
                                        (t) => t.status === "completed"
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
                                placeholder="Search tests..."
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
                            <option value="Blood Test">Blood Test</option>
                            <option value="Urine Test">Urine Test</option>
                            <option value="Stool Test">Stool Test</option>
                            <option value="X-Ray">X-Ray</option>
                        </select>

                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {filteredTests.length} of {tests.length} tests
                    </div>
                </div>
            </div>

            {/* Tests Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Test ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Test Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ordered By
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
                            {filteredTests.map((test) => (
                                <tr key={test.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {test.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {test.orderDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {test.patientName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Visit: {test.visitId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {test.testName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {test.testType}
                                        </div>
                                        {test.sampleCollected && (
                                            <div className="text-xs text-green-600">
                                                Sample: {test.sampleCollected}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {test.orderedBy}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                                test.status
                                            )}`}
                                        >
                                            {test.status}
                                        </span>
                                        {test.results && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                Results: {test.results}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ৳{test.cost}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/outdoor/lab-tests/${test.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            {test.status === "completed" && (
                                                <button
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Print Results"
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

            {filteredTests.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-flask text-gray-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No lab tests found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default LabTests;
