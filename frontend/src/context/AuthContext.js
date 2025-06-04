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
axios.defaults.baseURL = "http://localhost:8000"; // Adjust to your backend URL

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("token"));

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
                    if (response.data.success) {
                        setUser(response.data.user);
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
            const response = await axios.post("/api/auth/login-json", {
                username,
                password,
            });

            const { access_token, user: userData } = response.data;

            localStorage.setItem("token", access_token);
            setToken(access_token);
            setUser(userData);

            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                error: error.response?.data?.detail || "Login failed",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
