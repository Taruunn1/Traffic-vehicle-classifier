import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModelSelector.css';

const ModelSelector = ({ onModelChange, API_URL }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    model_path: '',
    encoder_path: '',
    type: 'classification'
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/models`);
      setModels(response.data.models);
      setError(null);
    } catch (err) {
      setError('Error fetching models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  };

  const activateModel = async (modelId) => {
    try {
      await axios.post(`${API_URL}/models/${modelId}/activate`);
      onModelChange();
      fetchModels();
    } catch (err) {
      setError('Error activating model');
      console.error('Error activating model:', err);
    }
  };

  const deleteModel = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await axios.delete(`${API_URL}/models/${modelId}`);
        fetchModels();
      } catch (err) {
        setError('Error deleting model');
        console.error('Error deleting model:', err);
      }
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/models`, newModel);
      setNewModel({ name: '', model_path: '', encoder_path: '', type: 'classification' });
      setShowForm(false);
      fetchModels();
    } catch (err) {
      setError('Error adding model');
      console.error('Error adding model:', err);
    }
  };

  if (loading) return <div className="model-selector-loading">Loading models...</div>;

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <h3>📦 Model Manager</h3>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕' : '+ Add Model'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="model-form" onSubmit={handleAddModel}>
          <div className="form-group">
            <label>Model Name</label>
            <input
              type="text"
              value={newModel.name}
              onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
              required
              placeholder="e.g., Vehicle Detection v1"
            />
          </div>
          <div className="form-group">
            <label>Model Path</label>
            <input
              type="text"
              value={newModel.model_path}
              onChange={(e) => setNewModel({ ...newModel, model_path: e.target.value })}
              required
              placeholder="e.g., models/traffic_model.keras"
            />
          </div>
          <div className="form-group">
            <label>Encoder Path (optional)</label>
            <input
              type="text"
              value={newModel.encoder_path}
              onChange={(e) => setNewModel({ ...newModel, encoder_path: e.target.value })}
              placeholder="e.g., models/label_encoder.pkl"
            />
          </div>
          <div className="form-group">
            <label>Model Type</label>
            <select
              value={newModel.type}
              onChange={(e) => setNewModel({ ...newModel, type: e.target.value })}
            >
              <option value="classification">Classification</option>
              <option value="detection">Detection (YOLO)</option>
            </select>
          </div>
          <button type="submit" className="btn-submit">Add Model</button>
        </form>
      )}

      <div className="models-list">
        {models.length === 0 ? (
          <div className="empty-state">No models found. Add your first model!</div>
        ) : (
          models.map((model) => (
            <div key={model.id} className={`model-item ${model.active ? 'active' : ''}`}>
              <div className="model-info">
                <div className="model-name">
                  {model.active && <span className="active-badge">✓</span>}
                  <span className="name">{model.name}</span>
                </div>
                <div className="model-details">
                  <span className="type-badge">{model.type}</span>
                  <span className="date">{new Date(model.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="model-actions">
                {!model.active && (
                  <button 
                    className="btn-activate" 
                    onClick={() => activateModel(model.id)}
                  >
                    Activate
                  </button>
                )}
                <button 
                  className="btn-delete" 
                  onClick={() => deleteModel(model.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModelSelector;
