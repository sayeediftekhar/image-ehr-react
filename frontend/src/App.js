import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Finance Components
import FinanceDashboard from "./components/finance/FinanceDashboard";
import RevenueEntry from "./components/finance/RevenueEntry";
import ExpenseEntry from "./components/finance/ExpenseEntry";
import BankAccounts from "./components/finance/BankAccounts";
import FinancialReports from "./components/finance/FinancialReports";
import FinanceSettings from "./components/finance/FinanceSettings";

// General Pages
import Patients from "./pages/Patients";
import Visits from "./pages/Visits";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// Outdoor Module Pages
import OutdoorPatients from "./pages/outdoor/Patients";
import OutdoorVisits from "./pages/outdoor/Visits";
import OutdoorLabTests from "./pages/outdoor/LabTests";
import OutdoorUSG from "./pages/outdoor/USG";
import OutdoorBilling from "./pages/outdoor/Billing";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" />;
};

// Finance Protected Route Component
const FinanceProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    const hasFinanceAccess = user && ["admin", "manager"].includes(user.role);

    if (!hasFinanceAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            }
                        >
                            {/* Dashboard */}
                            <Route index element={<Dashboard />} />

                            {/* General Pages */}
                            <Route path="patients" element={<Patients />} />
                            <Route path="visits" element={<Visits />} />
                            <Route path="billing" element={<Billing />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />

                            {/* Outdoor Module Routes */}
                            <Route path="outdoor">
                                <Route
                                    path="patients"
                                    element={<OutdoorPatients />}
                                />
                                <Route
                                    path="visits"
                                    element={<OutdoorVisits />}
                                />
                                <Route
                                    path="lab-tests"
                                    element={<OutdoorLabTests />}
                                />
                                <Route path="usg" element={<OutdoorUSG />} />
                                <Route
                                    path="billing"
                                    element={<OutdoorBilling />}
                                />
                            </Route>

                            {/* Finance Module Routes - Role Protected */}
                            <Route path="finance">
                                <Route
                                    path="dashboard"
                                    element={
                                        <FinanceProtectedRoute>
                                            <FinanceDashboard />
                                        </FinanceProtectedRoute>
                                    }
                                />
                                <Route
                                    path="revenue"
                                    element={
                                        <FinanceProtectedRoute>
                                            <RevenueEntry />
                                        </FinanceProtectedRoute>
                                    }
                                />
                                <Route
                                    path="expenses"
                                    element={
                                        <FinanceProtectedRoute>
                                            <ExpenseEntry />
                                        </FinanceProtectedRoute>
                                    }
                                />
                                <Route
                                    path="accounts"
                                    element={
                                        <FinanceProtectedRoute>
                                            <BankAccounts />
                                        </FinanceProtectedRoute>
                                    }
                                />
                                <Route
                                    path="reports"
                                    element={
                                        <FinanceProtectedRoute>
                                            <FinancialReports />
                                        </FinanceProtectedRoute>
                                    }
                                />
                                <Route
                                    path="settings"
                                    element={
                                        <FinanceProtectedRoute>
                                            <FinanceSettings />
                                        </FinanceProtectedRoute>
                                    }
                                />
                                {/* Finance module index route */}
                                <Route
                                    index
                                    element={
                                        <FinanceProtectedRoute>
                                            <Navigate
                                                to="/finance/dashboard"
                                                replace
                                            />
                                        </FinanceProtectedRoute>
                                    }
                                />
                            </Route>

                            {/* Future Module Routes - Placeholder */}
                            <Route path="emoc">
                                <Route
                                    index
                                    element={
                                        <div className="p-6">
                                            <h1 className="text-2xl font-bold">
                                                EMOC Module - Coming Soon
                                            </h1>
                                        </div>
                                    }
                                />
                            </Route>

                            <Route path="rdf">
                                <Route
                                    index
                                    element={
                                        <div className="p-6">
                                            <h1 className="text-2xl font-bold">
                                                RDF Module - Coming Soon
                                            </h1>
                                        </div>
                                    }
                                />
                            </Route>

                            <Route path="logistics">
                                <Route
                                    index
                                    element={
                                        <div className="p-6">
                                            <h1 className="text-2xl font-bold">
                                                Logistics Module - Coming Soon
                                            </h1>
                                        </div>
                                    }
                                />
                            </Route>
                        </Route>

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
