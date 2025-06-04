import React from 'react';
import { useParams } from 'react-router-dom';

const PatientDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        <p className="text-gray-600 mt-1">Patient ID: {id}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-700">Patient detail page is under development.</p>
      </div>
    </div>
  );
};

export default PatientDetail;