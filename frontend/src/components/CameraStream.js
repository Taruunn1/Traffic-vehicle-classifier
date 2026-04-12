import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './CameraStream.css';

const CameraStream = ({ onFrameCapture, API_URL }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start backend camera
      await axios.post(`${API_URL}/camera/start`);
      
      // Start frontend camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      
      videoRef.current.srcObject = stream;
      setStreaming(true);
    } catch (err) {
      setError(err.message || 'Failed to start camera');
      console.error('Error starting camera:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      // Stop backend camera
      await axios.post(`${API_URL}/camera/stop`);
      
      // Stop frontend stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      setStreaming(false);
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  };

  const captureFrame = async () => {
    try {
      setLoading(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!video || !video.videoWidth) {
        setError('Video not ready');
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob(blob => {
        const file = new File([blob], 'captured_frame.jpg', { type: 'image/jpeg' });
        onFrameCapture(file);
        setLoading(false);
      });
    } catch (err) {
      setError('Failed to capture frame');
      console.error('Error capturing frame:', err);
      setLoading(false);
    }
  };

  return (
    <div className="camera-stream">
      <div className="camera-header">
        <h3>🎥 Live Camera Stream</h3>
        <div className="camera-status">
          {streaming && <span className="status-badge recording">● Recording</span>}
          {!streaming && <span className="status-badge inactive">○ Inactive</span>}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className={`video-feed ${streaming ? 'active' : ''}`}
      />
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-controls">
        {!streaming ? (
          <button 
            className="btn btn-primary" 
            onClick={startStream}
            disabled={loading}
          >
            {loading ? 'Starting...' : '▶ Start Camera'}
          </button>
        ) : (
          <div className="streaming-controls">
            <button 
              className="btn btn-success" 
              onClick={captureFrame}
              disabled={loading}
            >
              {loading ? 'Capturing...' : '📸 Capture Frame'}
            </button>
            <button 
              className="btn btn-danger" 
              onClick={stopStream}
            >
              ⏹ Stop Camera
            </button>
          </div>
        )}
      </div>

      <div className="camera-info">
        <p>💡 Capture frames to run vehicle detection and check for traffic violations</p>
      </div>
    </div>
  );
};

export default CameraStream;
