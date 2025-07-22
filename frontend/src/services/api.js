import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000", // Changed from localhost to match your backend
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Finance API Functions
export const financeAPI = {
    // Dashboard
    getDashboardStats: (clinicId) =>
        api.get(`/finance/dashboard/stats/${clinicId}`),
    getRecentTransactions: (clinicId, limit = 10) =>
        api.get(
            `/finance/dashboard/recent-transactions/${clinicId}?limit=${limit}`
        ),
    getMonthlyTrends: (clinicId, months = 6) =>
        api.get(`/finance/dashboard/trends/${clinicId}?months=${months}`),

    // Revenue Management
    createRevenue: (data) => api.post("/finance/revenue", data),
    getRevenues: (params) => api.get("/finance/revenue", { params }),
    getRevenueById: (id) => api.get(`/finance/revenue/${id}`),
    updateRevenue: (id, data) => api.put(`/finance/revenue/${id}`, data),
    deleteRevenue: (id) => api.delete(`/finance/revenue/${id}`),
    getRevenueCategories: () => api.get("/finance/revenue/categories"),

    // Expense Management
    createExpense: (data) => api.post("/finance/expenses", data),
    getExpenses: (params) => api.get("/finance/expenses", { params }),
    getExpenseById: (id) => api.get(`/finance/expenses/${id}`),
    updateExpense: (id, data) => api.put(`/finance/expenses/${id}`, data),
    deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
    getExpenseCategories: () => api.get("/finance/expenses/categories"),

    // Bank Account Management
    getBankAccounts: (clinicId) =>
        api.get(`/finance/bank-accounts/${clinicId}`),
    createBankAccount: (data) => api.post("/finance/bank-accounts", data),
    updateBankAccount: (id, data) =>
        api.put(`/finance/bank-accounts/${id}`, data),
    deleteBankAccount: (id) => api.delete(`/finance/bank-accounts/${id}`),
    getAccountBalance: (accountId) =>
        api.get(`/finance/bank-accounts/${accountId}/balance`),
    getBanks: () => api.get("/finance/banks"),
    getAccountTypes: () => api.get("/finance/account-types"),

    // Petty Cash Management
    getPettyCash: (clinicId) => api.get(`/finance/petty-cash/${clinicId}`),
    createPettyCashTransaction: (data) =>
        api.post("/finance/petty-cash/transactions", data),
    getPettyCashTransactions: (clinicId, params) =>
        api.get(`/finance/petty-cash/transactions/${clinicId}`, { params }),
    updatePettyCashBalance: (clinicId, data) =>
        api.put(`/finance/petty-cash/${clinicId}/balance`, data),

    // Financial Reports
    getMonthlyReport: (clinicId, year, month) =>
        api.get(`/finance/reports/monthly/${clinicId}/${year}/${month}`),
    getQuarterlyReport: (clinicId, year, quarter) =>
        api.get(`/finance/reports/quarterly/${clinicId}/${year}/${quarter}`),
    getYearlyReport: (clinicId, year) =>
        api.get(`/finance/reports/yearly/${clinicId}/${year}`),
    getCustomReport: (params) => api.get("/finance/reports/custom", { params }),
    exportReport: (reportType, params) =>
        api.get(`/finance/reports/export/${reportType}`, {
            params,
            responseType: "blob",
        }),

    // Budget Management
    getBudgets: (clinicId, year) =>
        api.get(`/finance/budgets/${clinicId}/${year}`),
    createBudget: (data) => api.post("/finance/budgets", data),
    updateBudget: (id, data) => api.put(`/finance/budgets/${id}`, data),
    deleteBudget: (id) => api.delete(`/finance/budgets/${id}`),
    getBudgetComparison: (clinicId, year, month) =>
        api.get(`/finance/budgets/comparison/${clinicId}/${year}/${month}`),

    // Settings
    getFinanceSettings: (clinicId) => api.get(`/finance/settings/${clinicId}`),
    updateFinanceSettings: (clinicId, data) =>
        api.put(`/finance/settings/${clinicId}`, data),

    // Audit Trail
    getAuditLogs: (params) => api.get("/finance/audit-logs", { params }),

    // Data Import/Export
    importData: (file, type) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        return api.post("/finance/import", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    exportData: (type, params) =>
        api.get(`/finance/export/${type}`, {
            params,
            responseType: "blob",
        }),

    // Validation and Utilities
    validateTransaction: (data) =>
        api.post("/finance/validate-transaction", data),
    getExchangeRates: () => api.get("/finance/exchange-rates"),

    // Reconciliation
    reconcileAccount: (accountId, data) =>
        api.post(`/finance/reconcile/${accountId}`, data),
    getReconciliationHistory: (accountId) =>
        api.get(`/finance/reconcile/history/${accountId}`),
};

export default api;
