import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViolationsList.css';

const ViolationsList = ({ API_URL }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchViolations();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchViolations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const url = filterType === 'all' 
        ? `${API_URL}/violations` 
        : `${API_URL}/violations/${filterType}`;
      
      const response = await axios.get(url);
      setViolations(response.data.violations || []);
      setError(null);
    } catch (err) {
      setError('Error fetching violations');
      console.error('Error fetching violations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getViolationIcon = (type) => {
    const icons = {
      'speeding': '⚡',
      'red_light': '🚨',
      'wrong_lane': '➡️',
      'parking': '🅿️',
      'blocking_emergency': '🚑'
    };
    return icons[type] || '⚠️';
  };

  const getViolationColor = (type) => {
    const colors = {
      'speeding': '#ff6b6b',
      'red_light': '#dc2626',
      'wrong_lane': '#f59e0b',
      'parking': '#f97316',
      'blocking_emergency': '#991b1b'
    };
    return colors[type] || '#6b7280';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && violations.length === 0) {
    return <div className="violations-loading">Loading violations...</div>;
  }

  return (
    <div className="violations-list">
      <div className="violations-header">
        <h3>⚠️ Traffic Violations</h3>
        <button className="btn-refresh" onClick={fetchViolations}>
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="violations-filters">
        <button 
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => { setFilterType('all'); fetchViolations(); }}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filterType === 'speeding' ? 'active' : ''}`}
          onClick={() => { setFilterType('speeding'); fetchViolations(); }}
        >
          Speeding
        </button>
        <button 
          className={`filter-btn ${filterType === 'red_light' ? 'active' : ''}`}
          onClick={() => { setFilterType('red_light'); fetchViolations(); }}
        >
          Red Light
        </button>
        <button 
          className={`filter-btn ${filterType === 'wrong_lane' ? 'active' : ''}`}
          onClick={() => { setFilterType('wrong_lane'); fetchViolations(); }}
        >
          Wrong Lane
        </button>
      </div>

      <div className="violations-count">
        Total: <strong>{violations.length}</strong> violations recorded
      </div>

      {violations.length === 0 ? (
        <div className="empty-state">
          <p>✓ No violations detected</p>
        </div>
      ) : (
        <div className="violations-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Vehicle</th>
                <th>Details</th>
                <th>Timestamp</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((violation, idx) => (
                <tr key={idx} style={{ borderLeftColor: getViolationColor(violation.type) }}>
                  <td>
                    <span className="violation-icon">{getViolationIcon(violation.type)}</span>
                    <span className="violation-type">{violation.type}</span>
                  </td>
                  <td>{violation.vehicle_type || 'Unknown'}</td>
                  <td className="violation-details">
                    {violation.details && Object.entries(violation.details).map(([key, value]) => (
                      <div key={key} className="detail-item">
                        <strong>{key}:</strong> {String(value)}
                      </div>
                    ))}
                  </td>
                  <td className="timestamp">
                    {formatDate(violation.timestamp)}
                  </td>
                  <td>
                    {violation.image_path ? (
                      <a href={violation.image_path} target="_blank" rel="noopener noreferrer" className="btn-view">
                        📸 View
                      </a>
                    ) : (
                      <span className="no-image">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="violations-footer">
        <p>💾 All violations are automatically saved with timestamps and evidence images</p>
      </div>
    </div>
  );
};

export default ViolationsList;
