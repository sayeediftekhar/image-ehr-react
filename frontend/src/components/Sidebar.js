import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const { user, selectedClinic } = useAuth();
    const [expandedModules, setExpandedModules] = useState({
        outdoor: true, // Start with outdoor expanded
        emoc: false,
        rdf: false,
        logistics: false,
        finance: false,
    });

    const toggleModule = (module) => {
        setExpandedModules((prev) => ({
            ...prev,
            [module]: !prev[module],
        }));
    };

    const isActive = (path) => {
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    const isModuleActive = (module) => {
        return location.pathname.startsWith(`/${module}`);
    };

    // Role-based access control for Finance module
    const showFinanceMenu = user && ["admin", "manager"].includes(user.role);

    // Navigation items
    const generalNavItems = [
        { path: "/", icon: "fas fa-tachometer-alt", label: "Dashboard" },
        { path: "/patients", icon: "fas fa-users", label: "All Patients" },
        { path: "/visits", icon: "fas fa-calendar-check", label: "All Visits" },
        {
            path: "/billing",
            icon: "fas fa-file-invoice-dollar",
            label: "All Billing",
        },
        { path: "/reports", icon: "fas fa-chart-bar", label: "Reports" },
    ];

    const moduleNavItems = {
        outdoor: [
            {
                path: "/outdoor/patients",
                icon: "fas fa-user-injured",
                label: "OPD Patients",
            },
            {
                path: "/outdoor/visits",
                icon: "fas fa-stethoscope",
                label: "OPD Visits",
            },
            {
                path: "/outdoor/lab-tests",
                icon: "fas fa-flask",
                label: "Lab Tests",
            },
            { path: "/outdoor/usg", icon: "fas fa-heartbeat", label: "USG" },
            {
                path: "/outdoor/billing",
                icon: "fas fa-receipt",
                label: "OPD Billing",
            },
        ],
        emoc: [
            {
                path: "/emoc/patients",
                icon: "fas fa-baby",
                label: "EMOC Patients",
            },
            {
                path: "/emoc/deliveries",
                icon: "fas fa-hand-holding-heart",
                label: "Deliveries",
            },
            { path: "/emoc/anc", icon: "fas fa-female", label: "ANC" },
            { path: "/emoc/pnc", icon: "fas fa-baby-carriage", label: "PNC" },
            {
                path: "/emoc/billing",
                icon: "fas fa-receipt",
                label: "EMOC Billing",
            },
        ],
        rdf: [
            {
                path: "/rdf/prescriptions",
                icon: "fas fa-prescription-bottle-alt",
                label: "Prescriptions",
            },
            {
                path: "/rdf/inventory",
                icon: "fas fa-boxes",
                label: "Medicine Inventory",
            },
            {
                path: "/rdf/dispensing",
                icon: "fas fa-pills",
                label: "Medicine Dispensing",
            },
        ],
        logistics: [
            {
                path: "/logistics/inventory",
                icon: "fas fa-warehouse",
                label: "Inventory",
            },
            {
                path: "/logistics/supplies",
                icon: "fas fa-truck",
                label: "Supplies",
            },
            {
                path: "/logistics/equipment",
                icon: "fas fa-tools",
                label: "Equipment",
            },
        ],
        finance: [
            {
                path: "/finance/dashboard",
                icon: "fas fa-chart-line",
                label: "Finance Dashboard",
            },
            {
                path: "/finance/revenue",
                icon: "fas fa-plus-circle",
                label: "Revenue Entry",
            },
            {
                path: "/finance/expenses",
                icon: "fas fa-minus-circle",
                label: "Expense Entry",
            },
            {
                path: "/finance/accounts",
                icon: "fas fa-university",
                label: "Bank Accounts",
            },
            {
                path: "/finance/reports",
                icon: "fas fa-file-alt",
                label: "Financial Reports",
            },
            {
                path: "/finance/settings",
                icon: "fas fa-cogs",
                label: "Finance Settings",
            },
        ],
    };

    const moduleInfo = {
        outdoor: {
            name: "Outdoor (OPD)",
            icon: "fas fa-clinic-medical",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        emoc: {
            name: "EMOC",
            icon: "fas fa-heartbeat",
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        rdf: {
            name: "RDF (Pharmacy)",
            icon: "fas fa-prescription-bottle-alt",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        logistics: {
            name: "Logistics",
            icon: "fas fa-truck",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        finance: {
            name: "Finance & Accounts",
            icon: "fas fa-dollar-sign",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
    };

    return (
        <div className="bg-white shadow-lg h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-hospital text-white text-sm"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            IMAGE EHR
                        </h2>
                        {selectedClinic && (
                            <p className="text-xs text-gray-600">
                                {selectedClinic.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                {/* General Navigation */}
                <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        General
                    </h3>
                    <ul className="space-y-1">
                        {generalNavItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isActive(item.path)
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <i
                                        className={`${item.icon} w-5 h-5 mr-3`}
                                    ></i>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Module Navigation */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Clinic Modules
                    </h3>

                    {Object.entries(moduleInfo).map(([moduleKey, module]) => {
                        // Hide finance module if user doesn't have access
                        if (moduleKey === "finance" && !showFinanceMenu) {
                            return null;
                        }

                        return (
                            <div key={moduleKey} className="mb-4">
                                {/* Module Header */}
                                <button
                                    onClick={() => toggleModule(moduleKey)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isModuleActive(moduleKey)
                                            ? `${module.bgColor} ${module.color}`
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <i
                                            className={`${module.icon} w-5 h-5 mr-3`}
                                        ></i>
                                        {module.name}
                                    </div>
                                    <i
                                        className={`fas fa-chevron-${
                                            expandedModules[moduleKey]
                                                ? "up"
                                                : "down"
                                        } text-xs`}
                                    ></i>
                                </button>

                                {/* Module Items */}
                                {expandedModules[moduleKey] && (
                                    <ul className="mt-2 ml-6 space-y-1">
                                        {moduleNavItems[moduleKey].map(
                                            (item) => (
                                                <li key={item.path}>
                                                    <Link
                                                        to={item.path}
                                                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                                            isActive(item.path)
                                                                ? `${module.bgColor} ${module.color}`
                                                                : "text-gray-600 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <i
                                                            className={`${item.icon} w-4 h-4 mr-3`}
                                                        ></i>
                                                        {item.label}
                                                    </Link>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
                <Link
                    to="/settings"
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive("/settings")
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    <i className="fas fa-cog w-5 h-5 mr-3"></i>
                    Settings
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
