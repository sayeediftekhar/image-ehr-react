import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/');
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Mock data for development
      setPatients([
        { id: 1, name: 'John Doe', age: 35, gender: 'Male', phone: '123-456-7890', last_visit: '2024-06-01' },
        { id: 2, name: 'Jane Smith', age: 28, gender: 'Female', phone: '098-765-4321', last_visit: '2024-06-02' },
        { id: 3, name: 'Bob Johnson', age: 45, gender: 'Male', phone: '555-123-4567', last_visit: '2024-06-03' },
      ]);
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">Manage patient records</p>
          </div>
          <Link
            to="/patients/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            Add Patient
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search patients by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Search
              </button>
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Gender</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Visit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{patient.name}</td>
                      <td className="py-3 px-4 text-gray-700">{patient.age}</td>
                      <td className="py-3 px-4 text-gray-700">{patient.gender}</td>
                      <td className="py-3 px-4 text-gray-700">{patient.phone}</td>
                      <td className="py-3 px-4 text-gray-700">{patient.last_visit}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            View
                          </Link>
                          <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Edit
                          </button>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Total Patients</h3>
            <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Today's Registration</h3>
            <p className="text-2xl font-bold text-green-600">8</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Active Patients</h3>
            <p className="text-2xl font-bold text-purple-600">{patients.length - 5}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;