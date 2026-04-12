import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ImageUploader from './components/ImageUploader';
import PredictionResult from './components/PredictionResult';
import ClassesList from './components/ClassesList';
import ModelSelector from './components/ModelSelector';
import CameraStream from './components/CameraStream';
import ViolationsList from './components/ViolationsList';
import AuthPage from './components/AuthPage';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'camera', 'violations', 'models'
  const [auth, setAuth] = useState({ isAuthenticated: false, user: null, token: null });

  const API_URL = 'http://localhost:5000/api';

  // Check API health on mount
  useEffect(() => {
    checkToken();
    checkAPIHealth();
    fetchClasses();
  }, []);

  const checkToken = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axios.post(`${API_URL}/verify-token`, { token });
        if (response.data.success) {
          setAuth({ isAuthenticated: true, user: response.data.email, token });
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        localStorage.removeItem('authToken');
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (auth.token) {
        await axios.post(`${API_URL}/logout`, { token: auth.token });
      }
    } catch(err) {
      console.error(err);
    } finally {
      localStorage.removeItem('authToken');
      setAuth({ isAuthenticated: false, user: null, token: null });
    }
  };

  const checkAPIHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      if (response.data.model_loaded && response.data.encoder_loaded) {
        setApiStatus('ready');
      } else {
        setApiStatus('model-not-ready');
    }
    } catch (err) {
      setApiStatus('offline');
      setError('Backend API is not running. Please start the Flask server.');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_URL}/classes`);
      setClasses(response.data.classes);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const handleImageUpload = async (file) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    // Store uploaded image for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      setPrediction(response.data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Error processing image';
      setError(errorMessage);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleURLPredict = async (url) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setUploadedImage(url);

    try {
      const response = await axios.post(
        `${API_URL}/predict-url`,
        { url },
        { timeout: 30000 }
      );

      setPrediction(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(errorMessage);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  if (!auth.isAuthenticated) {
    return <AuthPage setAuth={setAuth} API_URL={API_URL} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚗 Traffic Vehicle Classifier</h1>
        <p>Deep Learning-powered vehicle classification system</p>
        <div className="api-status">
          <span
            className={`status-indicator ${apiStatus}`}
          ></span>
          <span className="status-text">
            {apiStatus === 'ready' && 'API Ready'}
            {apiStatus === 'offline' && 'API Offline'}
            {apiStatus === 'model-not-ready' && 'Model Loading...'}
            {apiStatus === 'checking' && 'Checking...'}
          </span>
          <button 
            onClick={handleLogout}
            style={{ marginLeft: '15px', background: 'transparent', color: '#ff5252', border: '1px solid #ff5252', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="App-main">
        <div className="container">
          {/* Navigation Tabs */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📤 Upload & Predict
            </button>
            <button 
              className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              🎥 Live Camera
            </button>
            <button 
              className={`tab-btn ${activeTab === 'violations' ? 'active' : ''}`}
              onClick={() => setActiveTab('violations')}
            >
              ⚠️ Violations
            </button>
            <button 
              className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => setActiveTab('models')}
            >
              📦 Models
            </button>
          </div>

          {/* Upload & Predict Tab */}
          {activeTab === 'upload' && (
            <div className="tab-content">
              <div className="left-panel">
                <ImageUploader
                  onImageUpload={handleImageUpload}
                  onURLSubmit={handleURLPredict}
                  loading={loading}
                />

                {uploadedImage && (
                  <div className="image-preview">
                    <h3>Preview</h3>
                    <img src={uploadedImage} alt="Uploaded" />
                  </div>
                )}
              </div>

              <div className="right-panel">
                {error && <div className="error-message">{error}</div>}

                {loading && (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Analyzing image...</p>
                  </div>
                )}

                {prediction && <PredictionResult prediction={prediction} />}

                {!loading && !prediction && !error && (
                  <ClassesList classes={classes} />
                )}
              </div>
            </div>
          )}

          {/* Live Camera Tab */}
          {activeTab === 'camera' && (
            <div className="tab-content full-width">
              <CameraStream onFrameCapture={handleImageUpload} API_URL={API_URL} />
              
              {prediction && (
                <div className="prediction-container">
                  <PredictionResult prediction={prediction} />
                </div>
              )}
            </div>
          )}

          {/* Violations Tab */}
          {activeTab === 'violations' && (
            <div className="tab-content full-width">
              <ViolationsList API_URL={API_URL} />
            </div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <div className="tab-content full-width">
              <ModelSelector 
                onModelChange={() => {
                  checkAPIHealth();
                  fetchClasses();
                }} 
                API_URL={API_URL}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>
          Built with React + Flask | Vehicle Detection Model ©2024
        </p>
      </footer>
    </div>
  );
}

export default App;
