'use client';

import { useState } from 'react';

export default function DataPage() {
  const [loadedData, setLoadedData] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    dept: string;
    year: number;
    stress: number;
    status: string;
  } | null>(null);

  const sampleStudents = [
    { id: 'ANON-001', dept: 'CSE', year: 2, stress: 6.6, status: 'Low' },
    { id: 'ANON-007', dept: 'ECE', year: 3, stress: 50.8, status: 'Medium' },
    { id: 'ANON-012', dept: 'ENG', year: 1, stress: 80.1, status: 'High' },
    { id: 'ANON-005', dept: 'CSE', year: 1, stress: 65.3, status: 'Medium' },
    { id: 'ANON-008', dept: 'ENG', year: 2, stress: 72.4, status: 'Medium' },
  ];

  const handleLoadData = () => {
    setLoadedData(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Data Import / Simulation</h1>
        <p className="text-purple-100 mt-1">Load and test with sample student data</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Control Panel */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Controls</h3>
          <div className="flex space-x-4">
            <button
              onClick={handleLoadData}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                loadedData 
                  ? 'bg-green-100 text-green-800 cursor-default'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              disabled={loadedData}
            >
              {loadedData ? '✅ Sample Data Loaded' : 'Load Sample Data'}
            </button>
            
            <button 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={!loadedData}
            >
              Export Analytics Report
            </button>
            
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!loadedData}
            >
              Simulate New Week
            </button>
          </div>
        </div>

        {/* Student Data Table */}
        {loadedData && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Simulated Students</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-700">Student ID</th>
                    <th className="text-left p-3 font-medium text-gray-700">Department</th>
                    <th className="text-left p-3 font-medium text-gray-700">Year</th>
                    <th className="text-left p-3 font-medium text-gray-700">Stress Score</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{student.id}</td>
                      <td className="p-3 text-gray-600">{student.dept}</td>
                      <td className="p-3 text-gray-600">Year {student.year}</td>
                      <td className="p-3 text-gray-600">{student.stress}/100</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Simulate Chat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Detail Panel */}
        {selectedStudent && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Chat Simulation - {selectedStudent.id}
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Student Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{selectedStudent.dept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{selectedStudent.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stress Score:</span>
                    <span className="font-medium">{selectedStudent.stress}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 bg-blue-50 rounded-lg border hover:bg-blue-100 transition-colors">
                    <div className="font-medium text-blue-800">Load in Student Companion</div>
                    <div className="text-sm text-blue-600">Test chat interface</div>
                  </button>
                  <button className="w-full text-left p-3 bg-green-50 rounded-lg border hover:bg-green-100 transition-colors">
                    <div className="font-medium text-green-800">Update Dashboard</div>
                    <div className="text-sm text-green-600">Refresh analytics</div>
                  </button>
                  <button className="w-full text-left p-3 bg-purple-50 rounded-lg border hover:bg-purple-100 transition-colors">
                    <div className="font-medium text-purple-800">Generate Report</div>
                    <div className="text-sm text-purple-600">Export student data</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h4 className="font-medium text-gray-700 mb-2">Data Source Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Sample data generated from Step 1 planning (sample_students.csv)</p>
            <p>• Stress calculations based on attendance, sleep, assignments, and language analysis</p>
            <p>• All student records are anonymized for privacy demonstration</p>
            <p>• Real implementation would integrate with college LMS/ERP systems</p>
          </div>
        </div>
      </div>
    </div>
  );
}