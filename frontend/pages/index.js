import { useEffect, useMemo, useState, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function Home() {
  const [activeTab, setActiveTab] = useState('detect');
  const [plates, setPlates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [uploadFile, setUploadFile] = useState(null);
  const [detectResult, setDetectResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef(null);

  const loadPlates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/plates?limit=200`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setPlates(data);
    } catch (err) {
      console.error(err);
      setError('Could not load stored plates. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'plates') {
      loadPlates();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Please choose an image first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', uploadFile);
      const res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const body = await res.json();
      setDetectResult(body);
      setActiveTab('detect');
    } catch (err) {
      setError('Upload/detect failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setUploadFile(file);
        setError('');
      } else {
        setError('Please drop an image file.');
      }
    }
  };

  const handleFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const rows = useMemo(() => plates.map((plate) => ({
    ...plate,
    timestamp: plate.timestamp ? new Date(plate.timestamp).toLocaleString() : '-',
  })), [plates]);

  return (
    <div className="container">
      <div className="header">
        <h1>🚗 ANPR Detection System</h1>
        <p className="header-subtitle">Automatic Number Plate Recognition using AI-powered detection and OCR</p>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'detect' ? 'active' : ''}`} onClick={() => setActiveTab('detect')}>
          📸 Detect
        </button>
        <button className={`tab-btn ${activeTab === 'plates' ? 'active' : ''}`} onClick={() => setActiveTab('plates')}>
          📋 Stored Plates
        </button>
      </div>

      {error && <div className="error">⚠️ {error}</div>}

      {activeTab === 'detect' && (
        <div className="card">
          <h2>📸 Upload Image for Detection</h2>
          <form onSubmit={handleSubmit}>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`drop-zone ${dragActive ? 'active' : ''}`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
                id="fileInput"
                ref={fileInputRef}
              />
              <label 
                htmlFor="fileInput" 
                onClick={handleFilePicker}
                style={{ cursor: 'pointer', display: 'block' }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
                {uploadFile ? (
                  <div>
                    <p style={{ fontWeight: 600, color: '#38a169', fontSize: 16 }}>✓ {uploadFile.name}</p>
                    <p style={{ color: '#666', fontSize: 12, margin: 0 }}>({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 16, color: '#2c3e50', margin: '0 0 8px 0' }}>
                      Drag and drop your image here
                    </p>
                    <p style={{ color: '#999', fontSize: 13, margin: 0 }}>or click to browse</p>
                  </div>
                )}
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="submit"
                disabled={loading || !uploadFile}
                style={{ flex: 1, opacity: loading || !uploadFile ? 0.5 : 1 }}
              >
                {loading ? '⏳ Detecting...' : '🔍 Detect Plates'}
              </button>
              {uploadFile && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadFile(null);
                    setError('');
                  }}
                  style={{
                    background: '#e53030',
                    padding: '12px 16px',
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </form>

          {uploadFile && (
            <div style={{ marginTop: '28px' }}>
              <h3>📷 Image Preview</h3>
              <img
                alt="upload preview"
                src={URL.createObjectURL(uploadFile)}
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, border: '2px solid #667eea' }}
              />
            </div>
          )}

          {detectResult && (
            <div style={{ marginTop: '28px' }}>
              <h3>✓ Detection Results</h3>
              <div className="stat-box">
                <p style={{ margin: 0 }}>Vehicles Detected</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#667eea', margin: '8px 0 0 0' }}>
                  {detectResult.vehicles_detected}
                </p>
              </div>

              {detectResult.results && detectResult.results.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>🔢 Plate Number</th>
                      <th>🚗 Vehicle Type</th>
                      <th>📊 OCR Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectResult.results.map((item, idx) => (
                      <tr key={`${item.plate_number}-${idx}`}>
                        <td style={{ fontWeight: 600, color: '#667eea' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, fontSize: 16, letterSpacing: 2, color: '#2c3e50' }}>
                          {item.plate_number}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{item.vehicle_type}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${(item.ocr_confidence || 0) * 100}%`,
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 600, color: '#667eea', minWidth: 45 }}>
                              {Math.round((item.ocr_confidence || 0) * 100)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#e53030', fontWeight: 500 }}>❌ No plate detected in this image.</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'plates' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2>📋 Database Records</h2>
              <p style={{ margin: 0, color: '#999', fontSize: 13 }}>Total stored detections from the database</p>
            </div>
            <button type="button" onClick={loadPlates} disabled={loading} style={{ padding: '10px 16px' }}>
              {loading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#667eea', fontWeight: 600 }}>⏳ Loading plates...</p>
          ) : plates.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>📭 No entries yet. Run detect first.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>🔢 Plate</th>
                    <th>🚗 Vehicle</th>
                    <th>📅 Timestamp</th>
                    <th>🎯 YOLO</th>
                    <th>📖 OCR</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600, color: '#667eea' }}>{r.id}</td>
                      <td style={{ fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>{r.plate_number}</td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{r.vehicle_type}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>{r.timestamp}</td>
                      <td>
                        <span className="badge badge-primary">
                          {Math.round((r.yolo_confidence || 0) * 100)}%
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-danger">
                          {Math.round((r.ocr_confidence || 0) * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
