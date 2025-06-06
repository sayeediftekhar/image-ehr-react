// src/pages/Billing.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Billing = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, paid, pending, overdue

    useEffect(() => {
        fetchBills();
    }, [filter]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/billing?filter=" + filter);
            setBills(response.data);
        } catch (error) {
            console.error("Error fetching bills:", error);
            // Mock data for now
            setBills([
                {
                    id: 1,
                    bill_number: "INV-001",
                    patient_name: "John Doe",
                    patient_id: "P001",
                    amount: 150.0,
                    status: "pending",
                    date_created: "2025-06-01",
                    due_date: "2025-06-15",
                    services: "Consultation, Lab Tests",
                },
                {
                    id: 2,
                    bill_number: "INV-002",
                    patient_name: "Jane Smith",
                    patient_id: "P002",
                    amount: 200.0,
                    status: "paid",
                    date_created: "2025-06-02",
                    due_date: "2025-06-16",
                    services: "Follow-up, Medication",
                },
                {
                    id: 3,
                    bill_number: "INV-003",
                    patient_name: "Bob Johnson",
                    patient_id: "P003",
                    amount: 300.0,
                    status: "overdue",
                    date_created: "2025-05-20",
                    due_date: "2025-06-03",
                    services: "Surgery, Post-op care",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "overdue":
                return "bg-red-100 text-red-800";
            case "cancelled":
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

    const getTotalAmount = () => {
        return bills.reduce((total, bill) => total + bill.amount, 0).toFixed(2);
    };

    const getPendingAmount = () => {
        return bills
            .filter(
                (bill) => bill.status === "pending" || bill.status === "overdue"
            )
            .reduce((total, bill) => total + bill.amount, 0)
            .toFixed(2);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Billing & Invoices
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage patient billing and payments
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/billing/create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Create Bill
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-blue-500">
                            <i className="fas fa-file-invoice-dollar text-2xl text-white"></i>
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

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-green-500">
                            <i className="fas fa-dollar-sign text-2xl text-white"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Amount
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${getTotalAmount()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-orange-500">
                            <i className="fas fa-exclamation-triangle text-2xl text-white"></i>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Pending Amount
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${getPendingAmount()}
                            </p>
                        </div>
                    </div>
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
                        All Bills
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("pending")
                        }
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter("paid")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("paid")
                        }
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setFilter("overdue")}
                        className={
                            "px-4 py-2 rounded-lg transition-colors " +
                            getFilterButtonClass("overdue")
                        }
                    >
                        Overdue
                    </button>
                </div>
            </div>

            {/* Bills List */}
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
                                        Bill Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bills.map((bill) => (
                                    <tr
                                        key={bill.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {bill.bill_number}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {bill.date_created}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {bill.patient_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {bill.patient_id}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">
                                                ${bill.amount.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {bill.services}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={
                                                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full " +
                                                    getStatusColor(bill.status)
                                                }
                                            >
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {bill.due_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                                title="View"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="text-green-600 hover:text-green-900 mr-3"
                                                title="Print"
                                            >
                                                <i className="fas fa-print"></i>
                                            </button>
                                            <button
                                                className="text-purple-600 hover:text-purple-900 mr-3"
                                                title="Payment"
                                            >
                                                <i className="fas fa-credit-card"></i>
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
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

export default Billing;
