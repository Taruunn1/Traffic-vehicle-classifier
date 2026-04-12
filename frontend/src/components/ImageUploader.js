import React, { useRef, useState } from 'react';
import './ImageUploader.css';

function ImageUploader({ onImageUpload, onURLSubmit, loading }) {
  const fileInputRef = useRef(null);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleURLSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onURLSubmit(url);
      setUrl('');
    }
  };

  return (
    <div className="image-uploader">
      <h2>Upload Image</h2>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload File
        </button>
        <button
          className={`tab ${activeTab === 'url' ? 'active' : ''}`}
          onClick={() => setActiveTab('url')}
        >
          🔗 From URL
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' && (
          <div
            className="drop-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-content">
              <span className="drop-icon">📸</span>
              <p>Drag and drop an image here</p>
              <p className="small">or click to select</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleURLSubmit} className="url-form">
            <input
              type="url"
              placeholder="Enter image URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="url-input"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="submit-btn"
            >
              {loading ? 'Processing...' : 'Analyze URL'}
            </button>
          </form>
        )}
      </div>

      <div className="supported-formats">
        <p className="format-label">Supported: JPG, PNG, GIF</p>
      </div>
    </div>
  );
}

export default ImageUploader;
