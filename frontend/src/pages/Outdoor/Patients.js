import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OutdoorPatients = () => {
    const { selectedClinic } = useAuth();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Mock data for outdoor patients
    const mockPatients = [
        {
            id: "OPD001",
            name: "Fatima Begum",
            age: 28,
            gender: "Female",
            phone: "01712345678",
            address: "Dhaka, Bangladesh",
            registrationDate: "2024-01-15",
            lastVisit: "2024-01-15",
            totalVisits: 3,
            status: "active",
        },
        {
            id: "OPD002",
            name: "Mohammad Rahman",
            age: 45,
            gender: "Male",
            phone: "01798765432",
            address: "Chittagong, Bangladesh",
            registrationDate: "2024-01-10",
            lastVisit: "2024-01-14",
            totalVisits: 5,
            status: "active",
        },
        {
            id: "OPD003",
            name: "Rashida Khatun",
            age: 32,
            gender: "Female",
            phone: "01687654321",
            address: "Sylhet, Bangladesh",
            registrationDate: "2024-01-12",
            lastVisit: "2024-01-13",
            totalVisits: 2,
            status: "active",
        },
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setPatients(mockPatients);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm)
    );

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
                            Outdoor Patients
                        </h1>
                        <p className="text-gray-600">
                            {selectedClinic
                                ? `${selectedClinic.name} Clinic`
                                : "All Clinics"}{" "}
                            - OPD Patient Management
                        </p>
                    </div>
                    <Link
                        to="/outdoor/patients/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <i className="fas fa-plus"></i>
                        <span>Add Patient</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-users text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Patients
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {patients.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-user-plus text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                New Today
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                2
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <i className="fas fa-female text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Female
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    patients.filter(
                                        (p) => p.gender === "Female"
                                    ).length
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <i className="fas fa-male text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Male
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {
                                    patients.filter((p) => p.gender === "Male")
                                        .length
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-lg shadow border mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search patients..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>All Genders</option>
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>
                    <div className="text-sm text-gray-600">
                        Showing {filteredPatients.length} of {patients.length}{" "}
                        patients
                    </div>
                </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Visits
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPatients.map((patient) => (
                                <tr
                                    key={patient.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {patient.id}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <i
                                                        className={`fas ${
                                                            patient.gender ===
                                                            "Female"
                                                                ? "fa-female"
                                                                : "fa-male"
                                                        } text-blue-600`}
                                                    ></i>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {patient.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {patient.age} years,{" "}
                                                    {patient.gender}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {patient.phone}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {patient.address}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {patient.registrationDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {patient.totalVisits} visits
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Last: {patient.lastVisit}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/outdoor/patients/${patient.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <Link
                                                to={`/outdoor/patients/${patient.id}/edit`}
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit Patient"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <Link
                                                to={`/outdoor/visits/new?patient=${patient.id}`}
                                                className="text-purple-600 hover:text-purple-900"
                                                title="New Visit"
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-user-slash text-gray-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No patients found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your search criteria or add a new patient.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OutdoorPatients;
