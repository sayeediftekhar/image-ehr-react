import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
