import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Configure axios base URL
axios.defaults.baseURL = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [selectedClinic, setSelectedClinic] = useState(
        JSON.parse(localStorage.getItem("selectedClinic")) || null
    );

    // Available clinics
    const clinics = [
        { id: "CL_1", name: "Nasirabad", manager: "MD Nizam Uddin" },
        { id: "CL_2", name: "Jalalabad", manager: "Mohsinul Islam" },
        { id: "CL_3", name: "Chandgaon", manager: "Motaher Uddin" },
        { id: "CL_4", name: "Amanbazar", manager: "ATM Khairul Bashar" },
        { id: "CL_5", name: "Saraipara", manager: "Ranjit Kumar Seal" },
    ];

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await axios.get("/api/auth/me");
                    if (response.data && response.data.id) {
                        setUser(response.data);

                        // Set default clinic for non-system-admin users
                        if (
                            response.data.role !== "system_admin" &&
                            response.data.clinic_id &&
                            !selectedClinic
                        ) {
                            const userClinic = clinics.find(
                                (c) => c.id === response.data.clinic_id
                            );
                            if (userClinic) {
                                setSelectedClinic(userClinic);
                                localStorage.setItem(
                                    "selectedClinic",
                                    JSON.stringify(userClinic)
                                );
                            }
                        }
                    } else {
                        localStorage.removeItem("token");
                        setToken(null);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem("token");
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    const login = async (username, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const response = await axios.post("/api/auth/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const { access_token, user: userData } = response.data;
            localStorage.setItem("token", access_token);
            setToken(access_token);
            setUser(userData);

            // Set default clinic for non-system-admin users
            if (userData.role !== "system_admin" && userData.clinic_id) {
                const userClinic = clinics.find(
                    (c) => c.id === userData.clinic_id
                );
                if (userClinic) {
                    setSelectedClinic(userClinic);
                    localStorage.setItem(
                        "selectedClinic",
                        JSON.stringify(userClinic)
                    );
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: error.response?.data?.detail || "Login failed",
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("selectedClinic");
            setToken(null);
            setUser(null);
            setSelectedClinic(null);
            delete axios.defaults.headers.common["Authorization"];
        }
    };

    const switchClinic = (clinic) => {
        setSelectedClinic(clinic);
        localStorage.setItem("selectedClinic", JSON.stringify(clinic));
    };

    // Check if user has access to specific module
    const hasModuleAccess = (module) => {
        if (!user) return false;

        // System admin has access to everything
        if (user.role === "system_admin") return true;

        // Clinic manager has access to all modules in their clinic
        if (user.role === "clinic_manager") return true;

        // Staff have specific module access
        const moduleAccess = {
            counselor: ["outdoor"],
            emoc_staff: ["emoc"],
            rdf_staff: ["rdf"],
            outdoor_staff: ["outdoor"],
        };

        return moduleAccess[user.role]?.includes(module) || false;
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        clinics,
        selectedClinic,
        switchClinic,
        hasModuleAccess,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
