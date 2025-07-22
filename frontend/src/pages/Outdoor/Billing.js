import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OutdoorBilling = () => {
    const { selectedClinic } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPayment, setFilterPayment] = useState("all");

    // Mock data for outdoor billing
    const mockBills = [
        {
            id: "BILL001",
            patientId: "OPD001",
            patientName: "Fatima Begum",
            visitId: "OPD-V001",
            billDate: "2024-01-15",
            services: [
                { name: "Consultation Fee", cost: 500 },
                { name: "Complete Blood Count (CBC)", cost: 500 },
                { name: "Medicine", cost: 200 },
            ],
            subtotal: 1200,
            discount: 100,
            total: 1100,
            paid: 1100,
            due: 0,
            paymentStatus: "paid",
            paymentMethod: "cash",
            status: "completed",
        },
        {
            id: "BILL002",
            patientId: "OPD002",
            patientName: "Mohammad Rahman",
            visitId: "OPD-V002",
            billDate: "2024-01-15",
            services: [
                { name: "Consultation Fee", cost: 500 },
                { name: "Lipid Profile", cost: 800 },
                { name: "Cardiac Echo", cost: 2000 },
            ],
            subtotal: 3300,
            discount: 0,
            total: 3300,
            paid: 1500,
            due: 1800,
            paymentStatus: "partial",
            paymentMethod: "cash",
            status: "pending",
        },
        {
            id: "BILL003",
            patientId: "OPD003",
            patientName: "Rashida Khatun",
            visitId: "OPD-V003",
            billDate: "2024-01-15",
            services: [
                { name: "Consultation Fee", cost: 500 },
                { name: "Routine Urine Examination", cost: 300 },
                { name: "Pelvic USG", cost: 1500 },
            ],
            subtotal: 2300,
            discount: 200,
            total: 2100,
            paid: 0,
            due: 2100,
            paymentStatus: "unpaid",
            paymentMethod: null,
            status: "pending",
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
        const matchesPayment =
            filterPayment === "all" || bill.paymentStatus === filterPayment;
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const getPaymentStatusBadge = (status) => {
        const statusStyles = {
            paid: "bg-green-100 text-green-800",
            partial: "bg-yellow-100 text-yellow-800",
            unpaid: "bg-red-100 text-red-800",
            refunded: "bg-blue-100 text-blue-800",
        };
        return statusStyles[status] || "bg-gray-100 text-gray-800";
    };

    const getBillStatusBadge = (status) => {
        const statusStyles = {
            pending: "bg-yellow-100 text-yellow-800",
            completed: "bg-green-100 text-green-800",
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
                    <div className="flex space-x-3">
                        <Link
                            to="/outdoor/billing/new"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <i className="fas fa-plus"></i>
                            <span>Create Bill</span>
                        </Link>
                        <Link
                            to="/outdoor/billing/reports"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <i className="fas fa-chart-bar"></i>
                            <span>Reports</span>
                        </Link>
                    </div>
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
                                Total Revenue
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
                                Pending Bills
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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                        >
                            <option value="all">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="unpaid">Unpaid</option>
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
                                    Services
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bill Status
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
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {bill.services
                                                .slice(0, 2)
                                                .map((service, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between"
                                                    >
                                                        <span>
                                                            {service.name}
                                                        </span>
                                                        <span>
                                                            ৳{service.cost}
                                                        </span>
                                                    </div>
                                                ))}
                                            {bill.services.length > 2 && (
                                                <div className="text-xs text-gray-500">
                                                    +{bill.services.length - 2}{" "}
                                                    more services
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            <div>Total: ৳{bill.total}</div>
                                            <div className="text-green-600">
                                                Paid: ৳{bill.paid}
                                            </div>
                                            {bill.due > 0 && (
                                                <div className="text-red-600">
                                                    Due: ৳{bill.due}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadge(
                                                bill.paymentStatus
                                            )}`}
                                        >
                                            {bill.paymentStatus}
                                        </span>
                                        {bill.paymentMethod && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                via {bill.paymentMethod}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBillStatusBadge(
                                                bill.status
                                            )}`}
                                        >
                                            {bill.status}
                                        </span>
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
                                                <button
                                                    className="text-purple-600 hover:text-purple-900"
                                                    title="Collect Payment"
                                                >
                                                    <i className="fas fa-money-bill"></i>
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

            {filteredBills.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-file-invoice text-gray-400 text-4xl mb-4"></i>
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
