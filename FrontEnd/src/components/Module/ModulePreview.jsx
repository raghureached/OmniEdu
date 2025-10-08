import React, { useState } from 'react';
import './ModulePreview.css';

const ModulePreview = ({ isOpen = true, onClose = () => {} }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const moduleData = {
    "_id": "68e337f54ac3b4df9cc71c15",
    "title": "Physics: Unveiling the Universe's Fundamental Laws",
    "tags": [
      "Physics", "Science", "Fundamentals", "Mechanics", "Thermodynamics",
      "Electromagnetism", "Waves", "Scientific Inquiry", "Problem Solving", "STEM"
    ],
    "trainingType": "Continuous Learning",
    "category": "Product Knowledge",
    "badges": "1",
    "stars": "1",
    "enableFeedback": false,
    "externalResource": "https://www.youtube.com/embed/ohIAiuHMKMI?si=MivGl4sZwXS7lIzJ",
    "description": "Embark on an illuminating journey into the core principles that govern our physical world. This comprehensive module systematically explores the fundamental laws of mechanics, thermodynamics, electricity, magnetism, waves, and an introduction to modern physics. Through engaging concepts, practical applications, and problem-solving exercises, you will develop a deep understanding of phenomena ranging from everyday observations to the grand scale of the cosmos. Cultivate critical thinking, analytical reasoning, and scientific inquiry skills essential for academic success and real-world innovation.",
    "learning_outcomes": [
      "Explain and apply fundamental principles of classical mechanics, including motion, forces, and energy.",
      "Describe and analyze concepts related to heat, temperature, and the laws of thermodynamics.",
      "Understand the principles of electricity, magnetism, and their interrelationship (electromagnetism).",
      "Solve quantitative problems using appropriate physical laws, equations, and mathematical reasoning.",
      "Develop critical thinking skills to analyze and interpret various physical phenomena and scientific data."
    ],
    "richText": "<h1>Physics</h1><h3></h3><p></p>",
    "credits": 2,
    "duration": 7,
    "prerequisites": ["Basic Physics"],
    "instructions": "Please complete the assignment",
    "submissionEnabled": false,
    "feedbackEnabled": true,
    "thumbnail": "https://res.cloudinary.com/dwcuayp2u/image/upload/v1759721460/thumbnail/wjxvwjaif2l4qobuixws.png",
    "status": "Saved"
  };

  if (!isOpen) return null;

  return (
    <div className="module-modal-overlay" onClick={onClose}>
      <div className="module-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="module-preview-container">
          <div className="module-preview-header">
            <button className="module-close-btn" onClick={onClose}>✕</button>
            <h2 className="module-header-title">Module Preview</h2>
            <button className="module-nav-btn">📋 Course Nav</button>
          </div>

          <div className="module-preview-content">
            {/* Hero Section */}
            <div className="module-hero">
              <img 
                src={moduleData.thumbnail} 
                alt={moduleData.title}
                className="module-hero-image"
              />
              <div className="module-hero-overlay">
                <div className="module-meta-badges">
                  <span className="module-badge module-badge-category">{moduleData.category}</span>
                  <span className="module-badge module-badge-type">{moduleData.trainingType}</span>
                </div>
              </div>
            </div>

            {/* Title and Quick Info */}
            <div className="module-title-section">
              <h1 className="module-title">{moduleData.title}</h1>
              
              <div className="module-quick-info">
                <div className="module-info-item">
                  <span className="module-info-icon">⏱️</span>
                  <span className="module-info-text">{moduleData.duration} days</span>
                </div>
                <div className="module-info-item">
                  <span className="module-info-icon">🎓</span>
                  <span className="module-info-text">{moduleData.credits} credits</span>
                </div>
                <div className="module-info-item">
                  <span className="module-info-icon">⭐</span>
                  <span className="module-info-text">{moduleData.stars} stars</span>
                </div>
                <div className="module-info-item">
                  <span className="module-info-icon">🏆</span>
                  <span className="module-info-text">{moduleData.badges} badge</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="module-tags-section">
              {moduleData.tags.map((tag, index) => (
                <span key={index} className="module-tag">{tag}</span>
              ))}
            </div>

            {/* Tabs */}
            <div className="module-tabs">
              <button 
                className={`module-tab ${activeTab === 'overview' ? 'module-tab-active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`module-tab ${activeTab === 'content' ? 'module-tab-active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button 
                className={`module-tab ${activeTab === 'requirements' ? 'module-tab-active' : ''}`}
                onClick={() => setActiveTab('requirements')}
              >
                Requirements
              </button>
            </div>

            {/* Tab Content */}
            <div className="module-tab-content">
              {activeTab === 'overview' && (
                <div className="module-overview">
                  <div className="module-section">
                    <h3 className="module-section-title">Description</h3>
                    <p className="module-description">{moduleData.description}</p>
                  </div>

                  <div className="module-section">
                    <h3 className="module-section-title">Learning Outcomes</h3>
                    <ul className="module-outcomes-list">
                      {moduleData.learning_outcomes.map((outcome, index) => (
                        <li key={index} className="module-outcome-item">
                          <span className="module-outcome-icon">✓</span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="module-section">
                    <h3 className="module-section-title">Instructions</h3>
                    <p className="module-instructions">{moduleData.instructions}</p>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="module-content-tab">
                  <div className="module-section">
                    <h3 className="module-section-title">Course Material</h3>
                    
                    {moduleData.externalResource && (
                      <div className="module-video-container">
                        <iframe
                          src={moduleData.externalResource}
                          className="module-video-iframe"
                          title="Course Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    <div className="module-content-info">
                      <div className="module-content-info-item">
                        <span className="module-content-info-label">Submission:</span>
                        <span className={`module-status ${moduleData.submissionEnabled ? 'module-status-enabled' : 'module-status-disabled'}`}>
                          {moduleData.submissionEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="module-content-info-item">
                        <span className="module-content-info-label">Feedback:</span>
                        <span className={`module-status ${moduleData.feedbackEnabled ? 'module-status-enabled' : 'module-status-disabled'}`}>
                          {moduleData.feedbackEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="module-requirements-tab">
                  <div className="module-section">
                    <h3 className="module-section-title">Prerequisites</h3>
                    {moduleData.prerequisites && moduleData.prerequisites.length > 0 ? (
                      <ul className="module-prerequisites-list">
                        {moduleData.prerequisites.map((prereq, index) => (
                          <li key={index} className="module-prerequisite-item">
                            <span className="module-prerequisite-icon">📚</span>
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="module-no-prerequisites">No prerequisites required</p>
                    )}
                  </div>

                  <div className="module-section">
                    <h3 className="module-section-title">Course Details</h3>
                    <div className="module-details-grid">
                      <div className="module-detail-item">
                        <span className="module-detail-label">Duration:</span>
                        <span className="module-detail-value">{moduleData.duration} days</span>
                      </div>
                      <div className="module-detail-item">
                        <span className="module-detail-label">Credits:</span>
                        <span className="module-detail-value">{moduleData.credits}</span>
                      </div>
                      <div className="module-detail-item">
                        <span className="module-detail-label">Category:</span>
                        <span className="module-detail-value">{moduleData.category}</span>
                      </div>
                      <div className="module-detail-item">
                        <span className="module-detail-label">Training Type:</span>
                        <span className="module-detail-value">{moduleData.trainingType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="module-actions">
              <button className="module-btn module-btn-secondary">Back to Courses</button>
              <button className="module-btn module-btn-primary">Start Module →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreview;