// frontend/src/components/DebugAppointments.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DebugAppointments = () => {
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('Debug - User data:', user);
        console.log('Debug - Token exists:', !!token);

        // Try to fetch all appointments to see what data exists
        const endpoints = [
          '/api/appointments/doctor',
          `/api/appointments/doctor/${user?.id}`,
          '/api/appointments/patient',
          `/api/appointments/patient/${user?.id}/accepted`
        ];

        const results = {};
        
        for (const endpoint of endpoints) {
          try {
            const res = await axios.get(`http://localhost:5000${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            results[endpoint] = { success: true, data: res.data, count: res.data?.length || 0 };
          } catch (err) {
            results[endpoint] = { success: false, error: err.response?.data?.message || err.message };
          }
        }

        console.log('API Results:', results);
        setAllAppointments(results);
        
      } catch (err) {
        console.error('Debug error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading debug info...</div>;
  }

  return (
    <div className="container mt-4">
      <h3>Debug Appointments Data</h3>
      
      <div className="card mb-3">
        <div className="card-header">
          <h5>User Information</h5>
        </div>
        <div className="card-body">
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="row">
        {Object.entries(allAppointments).map(([endpoint, result]) => (
          <div key={endpoint} className="col-md-6 mb-3">
            <div className={`card ${result.success ? 'border-success' : 'border-danger'}`}>
              <div className="card-header">
                <h6 className="mb-0">
                  {endpoint}
                  {result.success && (
                    <span className="badge bg-success ms-2">{result.count} items</span>
                  )}
                </h6>
              </div>
              <div className="card-body">
                {result.success ? (
                  <pre className="small">{JSON.stringify(result.data, null, 2)}</pre>
                ) : (
                  <div className="text-danger">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-3">
        <div className="card-header">
          <h5>Quick Actions</h5>
        </div>
        <div className="card-body">
          <button 
            className="btn btn-primary me-2"
            onClick={() => window.location.reload()}
          >
            Refresh Data
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
          >
            Clear Storage & Re-login
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugAppointments;