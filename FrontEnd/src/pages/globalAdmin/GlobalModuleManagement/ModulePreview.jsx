
import { useState } from 'react';
import './ModulePreview.css';

const ModulePreview = ({ isOpen = true, isPreview = true, onClose = () => { }, moduleData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewTab, setViewTab] = useState('module'); // 'module' | 'resources'
  const readOnly = !!isPreview; // preview mode => disable learner actions
  // normalize helpers
  const hasArray = (arr) => Array.isArray(arr) && arr.length > 0;
  const hasText = (v) => typeof v === 'string' && v.trim().length > 0;
  //   "trainingType": "Continuous Learning",
  //   "category": "Product Knowledge",
  //   "badges": "1",
  //   "stars": "1",
  //   "enableFeedback": false,
  //   "externalResource": "https://www.youtube.com/embed/ohIAiuHMKMI?si=MivGl4sZwXS7lIzJ",
  //   "description": "Embark on an illuminating journey into the core principles that govern our physical world. This comprehensive module systematically explores the fundamental laws of mechanics, thermodynamics, electricity, magnetism, waves, and an introduction to modern physics. Through engaging concepts, practical applications, and problem-solving exercises, you will develop a deep understanding of phenomena ranging from everyday observations to the grand scale of the cosmos. Cultivate critical thinking, analytical reasoning, and scientific inquiry skills essential for academic success and real-world innovation.",
  //   "learning_outcomes": [
  //     "Explain and apply fundamental principles of classical mechanics, including motion, forces, and energy.",
  //     "Describe and analyze concepts related to heat, temperature, and the laws of thermodynamics.",
  //     "Understand the principles of electricity, magnetism, and their interrelationship (electromagnetism).",
  //     "Solve quantitative problems using appropriate physical laws, equations, and mathematical reasoning.",
  //     "Develop critical thinking skills to analyze and interpret various physical phenomena and scientific data."
  //   ],
  //   "credits": 2,
  //   "duration": 7,
  //   "prerequisites": ["Basic Physics"],
  //   "instructions": "Please complete the assignment",
  //   "submissionEnabled": false,
  //   "feedbackEnabled": true,
  //   "thumbnail": "https://res.cloudinary.com/dwcuayp2u/image/upload/v1759721460/thumbnail/wjxvwjaif2l4qobuixws.png",
  //   "status": "Saved"
  // };

  if (!isOpen) return null;

  return (
    <div className="module-modal-overlay" onClick={onClose}>
      <div className="module-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="module-preview-container">
          {/* Header (match Assessment style) */}
          <div className="module-preview-header">
            <button className="module-close-btn" title="Close" onClick={onClose}>✕</button>
            <div className="module-header-flex">
              <div className="module-header-left">
                {/* <h1 className="module-header-title">Module Preview</h1> */}
              </div>
              <div className="module-header-right">
                <div className="module-switch-group">
                  <button
                    className={`module-switch-btn ${viewTab === 'module' ? 'is-active' : ''}`}
                    onClick={() => setViewTab('module')}
                    title="Module Details"
                  >
                    📘 Module
                  </button>
                  <button
                    className={`module-switch-btn ${viewTab === 'resources' ? 'is-active' : ''}`}
                    onClick={() => setViewTab('resources')}
                    title="Resources"
                  >
                    📎 Resources
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="module-preview-content">
            {/* Title row with right-side thumbnail card */}
            <div className="module-title-section module-title-row">
              <div className="module-title-col">
                <h1 className="module-title">{moduleData.title}</h1>
                <div className="module-quick-info">
                  {moduleData.duration ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">⏱️</span>
                      <span className="module-info-text">{moduleData.duration} mins</span>
                    </div>
                  ) : null}
                  {moduleData.credits ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">🎓</span>
                      <span className="module-info-text">{moduleData.credits} credits</span>
                    </div>
                  ) : null}
                  {(moduleData.stars) || typeof moduleData.stars === 'number' ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">⭐</span>
                      <span className="module-info-text">{moduleData.stars} stars</span>
                    </div>
                  ) : null}
                  {(moduleData.badges) || typeof moduleData.badges === 'number' ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">🏆</span>
                      <span className="module-info-text">{moduleData.badges} badge</span>
                    </div>
                  ) : null}
                  {(moduleData.category) ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">📂</span>
                      <span className="module-info-text">{moduleData.category}</span>
                    </div>
                  ) : null}
                  {(moduleData.trainingType) ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">🧭</span>
                      <span className="module-info-text">{moduleData.trainingType}</span>
                    </div>
                  ) : null}
                  {(moduleData?.team?.name) ? (
                    <div className="module-info-item">
                      <span className="module-info-icon">👥</span>
                      <span className="module-info-text">{moduleData.team.name}</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="module-image-card">
                {moduleData.thumbnail ? (
                  <img src={moduleData.thumbnail} alt={moduleData.title} />
                ) : (
                  <div className="module-image-placeholder">{moduleData.title}</div>
                )}
                {readOnly && <span className="module-preview-badge">Preview</span>}
              </div>
            </div>

            {/* Tags */}
            {(moduleData.tags) && (
              <div className="module-tags-section">
                {moduleData.tags.map((tag, index) => (
                  <span key={index} className="module-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Conditional content views */}
            {viewTab === 'module' ? (
              <>
                <div className="module-tabs">
                  <button
                    className={`module-tab ${activeTab === 'overview' ? 'module-tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    className={`module-tab ${activeTab === 'requirements' ? 'module-tab-active' : ''}`}
                    onClick={() => setActiveTab('requirements')}
                  >
                    Requirements
                  </button>
                </div>

                <div className="module-tab-content">
                  {activeTab === 'overview' && (
                    <div className="module-overview">
                      { (moduleData.description) && (
                        <div className="module-section">
                          <h3 className="module-section-title">Overview</h3>
                          <p className="module-description">{moduleData.description}</p>
                        </div>
                      )}
                      {(moduleData.learningOutcomes) && (
                        <div className="module-section">
                          <h3 className="module-section-title">What you'll learn</h3>
                          <ul className="module-outcomes-list">
                            {moduleData.learningOutcomes.map((outcome, index) => (
                              <li key={index} className="module-outcome-item">
                                <span className="module-outcome-icon">✓</span>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(moduleData.instructions) && (
                        <div className="module-section">
                          <h3 className="module-section-title">Instructions</h3>
                          <p className="module-instructions">{moduleData.instructions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'requirements' && (
                    <div className="module-requirements-tab">
                      <div className="module-section">
                        <h3 className="module-section-title">Prerequisites</h3>
                        {(moduleData.prerequisites.length > 0) ? (
                          <ul className="module-prerequisites-list">
                            {moduleData.prerequisites.map((prereq, index) => (
                              <li key={index} className="module-prerequisite-item">
                                <span className="module-prerequisite-icon">📚</span>
                                {prereq}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="module-no-prerequisites">Nil</p>
                        )}
                      </div>
                      <div className="module-section">
                        <h3 className="module-section-title">Course Details</h3>
                        <div className="module-details-grid">
                          <div className="module-detail-item">
                            <span className="module-detail-label">Duration:</span>
                            <span className="module-detail-value">{moduleData.duration} mins</span>
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
              </>
            ) : (
              <>
                <div className="module-tab-content">
                  {/* Instructions */}
                  {(moduleData.instructions) && (
                    <div className="module-section">
                      <h3 className="module-section-title">Instructions</h3>
                      <p className="module-description">{moduleData.instructions}</p>
                    </div>
                  )}

                  {/* Primary Material */}
                  <div className="module-section">
                    <h3 className="module-section-title">Primary Material</h3>
                    {(moduleData.primaryFile) ? (
                      <div className="module-video-container">
                        <video className="module-video-iframe" src={moduleData.primaryFile} controls={!readOnly} />
                      </div>
                    ) : (
                      <p className="module-description">No primary video provided.</p>
                    )}
                    {moduleData.duration && (
                      <p className="module-description">Duration: {moduleData.duration} mins</p>
                    )}
                  </div>

                  {/* Supplementary Materials */}
                  <div className="module-section">
                    <h3 className="module-section-title">Supplementary Materials</h3>
                    {(moduleData.additionalFile) ? (
                      <div className="module-supplementary">
                        <div className="module-supp-item">
                          <span className="module-supp-icon">📄</span>
                          <span className="module-supp-name">Additional File</span>
                          <div className="module-supp-actions">
                            {readOnly ? (
                              <span className="module-btn module-btn-secondary is-disabled" aria-disabled="true">Preview</span>
                            ) : (
                              <a href={moduleData.additionalFile} target="_blank" rel="noreferrer" className="module-btn module-btn-secondary">Preview</a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="module-description">No supplementary file provided.</p>
                    )}
                  </div>

                  {(moduleData.richText) && (
                    <div className="module-section">
                      <h3 className="module-section-title">Text Content</h3>
                      <div className="module-richtext" dangerouslySetInnerHTML={{ __html: moduleData.richText }} />
                    </div>
                  )}

                  <div className="module-section">
                    <h3 className="module-section-title">Settings</h3>
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
              </>
            )}

            {/* Footer actions (match Assessment style) */}
            <div className="module-actions">
              <button className="module-btn module-btn-secondary" onClick={onClose}>Back</button>
              {readOnly ? (
                <button className="module-btn module-btn-primary" onClick={onClose}>Close</button>
              ) : (
                <button className="module-btn module-btn-primary">Start Module →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreview;