import React from 'react';
import './PredictionResult.css';

function PredictionResult({ prediction }) {
  if (!prediction || !prediction.success) {
    return null;
  }

  const { predicted_vehicle, confidence, priority, all_predictions } = prediction;

  return (
    <div className="prediction-result">
      <div className="result-header">
        <h2>✓ Prediction Result</h2>
      </div>

      <div className="prediction-main">
        <div className="vehicle-name">
          {predicted_vehicle.toUpperCase()}
        </div>

        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${confidence}%` }}
          ></div>
        </div>
        <p className="confidence-text">
          Confidence: <strong>{confidence}%</strong>
        </p>
      </div>

      <div className="priority-badge">
        <span className="badge-icon">⚠️</span>
        <span className="badge-text">{priority}</span>
      </div>

      <div className="all-predictions">
        <h3>All Predictions</h3>
        <div className="predictions-list">
          {Object.entries(all_predictions)
            .sort((a, b) => b[1] - a[1])
            .map(([vehicle, conf], index) => (
              <div key={index} className="prediction-item">
                <span className="prediction-name">{vehicle}</span>
                <div className="prediction-bar-small">
                  <div
                    className="prediction-fill-small"
                    style={{ width: `${conf}%` }}
                  ></div>
                </div>
                <span className="prediction-conf">{conf}%</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default PredictionResult;
