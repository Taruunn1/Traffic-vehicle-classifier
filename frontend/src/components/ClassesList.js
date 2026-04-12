import React from 'react';
import './ClassesList.css';

function ClassesList({ classes }) {
  const vehicleEmojis = {
    ambulance: '🚑',
    fire_truck: '🚒',
    police: '🚓',
    car: '🚗',
    bus: '🚌',
    truck: '🚚',
    bicycle: '🚲',
    motorcycle: '🏍️',
    van: '🚐',
    taxi: '🚕',
  };

  return (
    <div className="classes-list">
      <h2>Available Classes</h2>
      <p className="classes-subtitle">
        This model can classify the following vehicle types:
      </p>

      <div className="classes-grid">
        {classes.length > 0 ? (
          classes.map((vehicleClass, index) => (
            <div key={index} className="class-card">
              <span className="class-emoji">
                {vehicleEmojis[vehicleClass] || '🚗'}
              </span>
              <span className="class-name">{vehicleClass}</span>
            </div>
          ))
        ) : (
          <p className="no-classes">No classes loaded yet</p>
        )}
      </div>

      <div className="info-box">
        <h3>📋 How to use:</h3>
        <ol>
          <li>Upload an image of a vehicle (JPG, PNG, or GIF)</li>
          <li>Wait for the model to analyze the image</li>
          <li>View the prediction results with confidence scores</li>
          <li>See the priority level for emergency vehicles</li>
        </ol>
      </div>
    </div>
  );
}

export default ClassesList;
