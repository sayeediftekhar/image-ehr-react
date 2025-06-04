import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayRegistrations: 0,
    todayVisits: 0,
    pendingBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // For now, using mock data. You'll replace this with actual API calls
      setStats({
        totalPatients: 150,
        todayRegistrations: 8,
        todayVisits: 25,
        pendingBills: 12
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <i className={`${icon} text-2xl text-white`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to IMAGE EHR System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="fas fa-users"
          title="Total Patients"
          value={stats.totalPatients}
          color="bg-blue-500"
        />
        <StatCard
          icon="fas fa-user-plus"
          title="Today's Registrations"
          value={stats.todayRegistrations}
          color="bg-green-500"
        />
        <StatCard
          icon="fas fa-calendar-check"
          title="Today's Visits"
          value={stats.todayVisits}
          color="bg-purple-500"
        />
        <StatCard
          icon="fas fa-file-invoice-dollar"
          title="Pending Bills"
          value={stats.pendingBills}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="fas fa-user-plus text-blue-500 text-xl mr-3"></i>
            <span className="font-medium">Add New Patient</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="fas fa-calendar-plus text-green-500 text-xl mr-3"></i>
            <span className="font-medium">Schedule Visit</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="fas fa-file-medical text-purple-500 text-xl mr-3"></i>
            <span className="font-medium">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <i className="fas fa-user-plus text-green-500 mr-3"></i>
            <span className="text-sm text-gray-700">New patient registered: John Doe</span>
            <span className="ml-auto text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <i className="fas fa-calendar-check text-blue-500 mr-3"></i>
            <span className="text-sm text-gray-700">Visit completed for Jane Smith</span>
            <span className="ml-auto text-xs text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <i className="fas fa-file-invoice text-orange-500 mr-3"></i>
            <span className="text-sm text-gray-700">Bill generated for patient ID: 1234</span>
            <span className="ml-auto text-xs text-gray-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;