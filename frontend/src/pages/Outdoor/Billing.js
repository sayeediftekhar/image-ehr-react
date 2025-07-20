import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OutdoorBilling = () => {
    const { selectedClinic } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("today");

    // Mock data for outdoor billing
    const mockBills = [
        {
            id: "OPD-BILL-001",
            patientId: "OPD001",
            patientName: "Fatima Begum",
            visitId: "OPD-V001",
            billDate: "2024-01-15",
            items: [
                {
                    name: "Consultation Fee",
                    quantity: 1,
                    rate: 500,
                    amount: 500,
                },
                { name: "CBC Test", quantity: 1, rate: 500, amount: 500 },
                { name: "Medicine", quantity: 1, rate: 200, amount: 200 },
            ],
            subtotal: 1200,
            discount: 100,
            total: 1100,
            paid: 1100,
            due: 0,
            status: "paid",
            paymentMethod: "cash",
        },
        {
            id: "OPD-BILL-002",
            patientId: "OPD002",
            patientName: "Mohammad Rahman",
            visitId: "OPD-V002",
            billDate: "2024-01-15",
            items: [
                {
                    name: "Consultation Fee",
                    quantity: 1,
                    rate: 500,
                    amount: 500,
                },
                { name: "Lipid Profile", quantity: 1, rate: 800, amount: 800 },
                {
                    name: "Abdominal USG",
                    quantity: 1,
                    rate: 1000,
                    amount: 1000,
                },
            ],
            subtotal: 2300,
            discount: 0,
            total: 2300,
            paid: 1000,
            due: 1300,
            status: "partial",
            paymentMethod: "cash",
        },
        {
            id: "OPD-BILL-003",
            patientId: "OPD003",
            patientName: "Rashida Khatun",
            visitId: "OPD-V003",
            billDate: "2024-01-15",
            items: [
                {
                    name: "Consultation Fee",
                    quantity: 1,
                    rate: 500,
                    amount: 500,
                },
                {
                    name: "Routine Urine Test",
                    quantity: 1,
                    rate: 300,
                    amount: 300,
                },
            ],
            subtotal: 800,
            discount: 50,
            total: 750,
            paid: 0,
            due: 750,
            status: "pending",
            paymentMethod: null,
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            setBills(mockBills);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredBills = bills.filter((bill) => {
        const matchesSearch =
            bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" || bill.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: "bg-yellow-100 text-yellow-800",
            partial: "bg-blue-100 text-blue-800",
            paid: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return statusStyles[status] || "bg-gray-100 text-gray-800";
    };

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.paid, 0);
    const totalDue = bills.reduce((sum, bill) => sum + bill.due, 0);

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
                            Outdoor Billing
                        </h1>
                        <p className="text-gray-600">
                            {selectedClinic
                                ? `${selectedClinic.name} Clinic`
                                : "All Clinics"}{" "}
                            - OPD Billing Management
                        </p>
                    </div>
                    <Link
                        to="/outdoor/billing/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <i className="fas fa-plus"></i>
                        <span>Create Bill</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <i className="fas fa-file-invoice-dollar text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Bills
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {bills.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <i className="fas fa-money-bill-wave text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Revenue
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                ৳{totalRevenue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 text-red-600">
                            <i className="fas fa-exclamation-triangle text-xl"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Due
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                ৳{totalDue.toLocaleString()}
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
                                    bills.filter((b) => b.status === "pending")
                                        .length
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
                                placeholder="Search bills..."
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
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {filteredBills.length} of {bills.length} bills
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bill ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
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
                            {filteredBills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {bill.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {bill.billDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {bill.patientName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Visit: {bill.visitId}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ৳{bill.total.toLocaleString()}
                                        </div>
                                        {bill.discount > 0 && (
                                            <div className="text-sm text-green-600">
                                                Discount: ৳{bill.discount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            Paid: ৳{bill.paid.toLocaleString()}
                                        </div>
                                        {bill.due > 0 && (
                                            <div className="text-sm text-red-600">
                                                Due: ৳
                                                {bill.due.toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                                bill.status
                                            )}`}
                                        >
                                            {bill.status}
                                        </span>
                                        {bill.paymentMethod && (
                                            <div className="text-xs text-gray-500 mt-1 capitalize">
                                                {bill.paymentMethod}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                to={`/outdoor/billing/${bill.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <button
                                                className="text-green-600 hover:text-green-900"
                                                title="Print Bill"
                                            >
                                                <i className="fas fa-print"></i>
                                            </button>
                                            {bill.due > 0 && (
                                                <Link
                                                    to={`/outdoor/billing/${bill.id}/payment`}
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Collect Payment"
                                                >
                                                    <i className="fas fa-money-bill"></i>
                                                </Link>
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

            {filteredBills.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-file-invoice-dollar text-gray-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No bills found
                    </h3>
                    <p className="text-gray-500">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OutdoorBilling;
