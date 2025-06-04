import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import AddPatient from './pages/AddPatient';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/patients" element={
              <ProtectedRoute>
                <Layout>
                  <Patients />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/patients/:id" element={
              <ProtectedRoute>
                <Layout>
                  <PatientDetail />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/patients/add" element={
              <ProtectedRoute>
                <Layout>
                  <AddPatient />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;