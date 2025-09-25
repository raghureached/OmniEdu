import React, { useState, useEffect } from 'react';
import { Play, FileText, Clock, Award, Calendar, Tag, Globe, Eye, Download } from 'lucide-react';
import './ModulePreview.css';

const ModulePreview = ({ moduleData, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [docPreviewUrls, setDocPreviewUrls] = useState([]);

  const module = moduleData;

  // Handle local video preview
  useEffect(() => {
    if (module.videoFile instanceof File) {
      const url = URL.createObjectURL(module.videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [module.videoFile]);

  // Handle local document previews
  useEffect(() => {
    if (module.documentFiles && module.documentFiles.length > 0) {
      const urls = Array.from(module.documentFiles).map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }));
      setDocPreviewUrls(urls);
      return () => urls.forEach(u => URL.revokeObjectURL(u.url));
    } else {
      setDocPreviewUrls([]);
    }
  }, [module.documentFiles]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'Draft': 'preview-status--draft',
      'Published': 'preview-status--published',
      'Archived': 'preview-status--archived'
    };
    return statusMap[status] || 'preview-status--default';
  };

  return (
    <div className="module-preview-overlay">
      <div className="module-preview-container">
        
        {/* Header */}
        <div className="module-preview-header">
          <div className="module-preview-header-left">
            <h1 className="module-preview-title">{module.title}</h1>
            <div className={`module-preview-status ${getStatusColor(module.status)}`}>
              {module.status}
            </div>
          </div>
          <div className="module-preview-header-actions">
            <button className="module-preview-btn module-preview-btn--primary" onClick={onClose}>
              <Eye size={16} />
              Close Preview
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="module-preview-tabs">
          {['overview','content','resources','details'].map(tab => (
            <button
              key={tab}
              className={`module-preview-tab ${activeTab === tab ? 'module-preview-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="module-preview-content">
          
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="module-preview-overview">
              <div className="module-preview-main-content">
                <h3 className="module-preview-section-title">Description</h3>
                <p>{module.content || "No description available for this module."}</p>

                {module.learning_outcomes?.length > 0 && (
                  <>
                    <h3 className="module-preview-section-title">Learning Outcomes</h3>
                    <ul>
                      {module.learning_outcomes.map((outcome, i) => (
                        <li key={i}>{outcome}</li>
                      ))}
                    </ul>
                  </>
                )}

                {module.tags?.length > 0 && (
                  <>
                    <h3 className="module-preview-section-title">Tags</h3>
                    <div>
                      {module.tags.map((tag, i) => (
                        <span key={i} className="module-preview-tag">
                          <Tag size={12} /> {tag}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === 'content' && (
            <div className="module-preview-content-tab">
              {(videoPreviewUrl || module.video_url) && (
                <div className="module-preview-video-section">
                  <h3 className="module-preview-section-title">Video Content</h3>
                  <div className="module-preview-video-container">
                    {isVideoPlaying ? (
                      <video
                        controls
                        className="module-preview-video"
                        src={videoPreviewUrl || module.video_url}
                        onEnded={() => setIsVideoPlaying(false)}
                      />
                    ) : (
                      <div className="module-preview-video-placeholder" onClick={() => setIsVideoPlaying(true)}>
                        <Play size={48} />
                        <p>Click to play video</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <h3 className="module-preview-section-title">Module Content</h3>
                <p>{module.content || "No detailed content available."}</p>
              </div>
            </div>
          )}

          {/* Resources */}
          {activeTab === 'resources' && (
            <div className="module-preview-resources-tab">
              {(docPreviewUrls.length > 0 || module.doc_url?.length > 0) ? (
                <div className="module-preview-documents-section">
                  <h3 className="module-preview-section-title">Documents</h3>
                  <div>
                    {docPreviewUrls.map((doc, i) => (
                      <div key={i}>
                        <FileText size={20} /> {doc.name}
                        <button onClick={() => window.open(doc.url, "_blank")}>
                          <Eye size={14} /> View
                        </button>
                      </div>
                    ))}
                    {module.doc_url?.map((doc, i) => (
                      <div key={i}>
                        <FileText size={20} /> Document {i+1}
                        <button onClick={() => window.open(doc, "_blank")}>
                          <Eye size={14} /> View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No resources available</p>
              )}
            </div>
          )}

          {/* Details */}
          {activeTab === 'details' && (
            <div className="module-preview-details-tab">
              <h4>Configuration</h4>
              <p>Duration: {formatDuration(module.duration)}</p>
              <p>Credits: 2</p>
              <p>Pushable: {module.pushable_to_orgs ? "Yes" : "No"}</p>
              <p>Created: {formatDate(module.createdAt)}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ModulePreview;
