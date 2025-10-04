import React, { useState, useEffect } from 'react';
import { 
  Play, FileText, Clock, Award, Tag, Globe, 
  Download, X, Star, Users, BookOpen, Target, 
  CheckCircle, MessageCircle, ExternalLink, Zap,
  TrendingUp, Shield, Infinity,
  Stars,
  Coins
} from 'lucide-react';

const ModulePreview = ({ moduleData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!moduleData) return null;

  const renderStars = (rating) => {
    const starsCount = Number(rating) || 0;
    return (
      <div className="rating-display">
        <span className="rating-number">{starsCount.toFixed(1)}</span>
        <div className="stars-wrapper">
          {Array.from({ length: 5 }, (_, i) => (
            <Star 
              key={i} 
              size={16}
              className={i < starsCount ? 'star-filled' : 'star-empty'}
              fill={i < starsCount ? '#f5c518' : 'none'}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`mp-modal-overlay ${isVisible ? 'mp-visible' : ''}`}>
      <div className={`mp-modal-container ${isVisible ? 'mp-visible' : ''}`}>
        
        {/* Close Button */}
        <button onClick={handleClose} className="mp-close-btn">
          <X size={24} />
        </button>

        {/* Hero Section */}
        <div className="mp-hero-section">
          <div className="mp-hero-content">
            <div className="mp-breadcrumb">
              <span>{moduleData.team?.name || 'Training'}</span>
              <span className="mp-separator">›</span>
              <span>{moduleData.trainingType}</span>
            </div>
            
            <h1 className="mp-title">{moduleData.title}</h1>
            
            <p className="mp-subtitle">{moduleData.description}</p>
            
            <div className="mp-meta-bar">
              {/* {renderStars(moduleData.stars)} */}
              {/* <span className="mp-divider">|</span> */}
                {/* <div className="mp-meta-item">
                  <Users size={18} />
                  <span>{moduleData.team?.members?.length || 0} enrolled</span>
                </div> */}
              {/* <span className="mp-divider">|</span> */}
              <div className="mp-meta-item">
                <Clock size={18} />
                <span>{moduleData.duration} mins</span>
              </div>
            </div>

              {/* <div className="mp-cta-section">
                <button className="mp-btn-primary">
                  <Play size={20} />
                  Start Learning Now
                </button>
              </div> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mp-stats-grid">
          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-icon-purple">
              <Coins   size={24} />
            </div>
            <div className="mp-stat-content">
              <div className="mp-stat-value">{moduleData.credits}</div>
              <div className="mp-stat-label">Credits</div>
            </div>
          </div>
          
          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-icon-blue">
              <Award size={24} />
            </div>
            <div className="mp-stat-content">
              <div className="mp-stat-value">{moduleData.badges}</div>
              <div className="mp-stat-label">Badges</div>
            </div>
          </div>
          
          <div className="mp-stat-card">
            <div className="mp-stat-icon mp-icon-green">
              <Star size={24} />
            </div>
            <div className="mp-stat-content">
              <div className="mp-stat-value">{moduleData.stars  }</div>
              <div className="mp-stat-label">Stars</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mp-tabs">
          <button 
            className={`mp-tab ${activeTab === 'overview' ? 'mp-tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`mp-tab ${activeTab === 'curriculum' ? 'mp-tab-active' : ''}`}
            onClick={() => setActiveTab('curriculum')}
          >
            Curriculum
          </button>
          <button 
            className={`mp-tab ${activeTab === 'resources' ? 'mp-tab-active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
        </div>

        {/* Tab Content */}
        <div className="mp-content">
          {activeTab === 'overview' && (
            <>
              {/* What You'll Learn */}
              <section className="mp-section">
                <h2 className="mp-section-title">What you'll learn</h2>
                <div className="mp-outcomes-grid">
                  {moduleData.learningOutcomes?.map((outcome, i) => (
                    <div key={i} className="mp-outcome-item">
                      <CheckCircle size={20} className="mp-check-icon" />
                      <span>{outcome}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Prerequisites */}
              {moduleData.prerequisites?.length > 0 && (
                <section className="mp-section">
                  <h2 className="mp-section-title">
                    <BookOpen size={22} />
                    Prerequisites
                  </h2>
                  <ul className="mp-prerequisites-list">
                    {moduleData.prerequisites.map((pre, i) => (
                      <li key={i}>{pre}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Instructions */}
              {moduleData.instructions && (
                <section className="mp-section">
                  <h2 className="mp-section-title">
                    <MessageCircle size={22} />
                    Course Instructions
                  </h2>
                  <div className="mp-instruction-box">
                    <p>{moduleData.instructions}</p>
                  </div>
                </section>
              )}
            </>
          )}

          {activeTab === 'curriculum' && (
            <section className="mp-section">
              <h2 className="mp-section-title">Course Content</h2>
              <div className="mp-curriculum-info">
                <p className="mp-curriculum-meta">
                  <Clock size={16} /> {moduleData.duration} mins total length
                </p>
              </div>
              {moduleData.richText ? (
                <div 
                  className="mp-curriculum-content"
                  dangerouslySetInnerHTML={{ __html: moduleData.richText }}
                />
              ) : (
                <div className="mp-info-box">
                  <Shield size={20} />
                  <p>Full curriculum will be available once you enroll in this module.</p>
                </div>
              )}
            </section>
          )}

          {activeTab === 'resources' && (
            <section className="mp-section">
              <h2 className="mp-section-title">Learning Resources</h2>
              
              <div className="mp-resources-grid">
                {moduleData.primaryFile && (
                  <a href={moduleData.primaryFile} target="_blank" rel="noopener noreferrer" className="mp-resource-card">
                    <div className="mp-resource-icon mp-icon-purple">
                      <FileText size={24} />
                    </div>
                    <div className="mp-resource-content">
                      <h3>Primary Course Material</h3>
                      <p>Main learning document</p>
                    </div>
                    <ExternalLink size={18} className="mp-external-icon" />
                  </a>
                )}
                
                {moduleData.additionalFile && (
                  <a href={moduleData.additionalFile} target="_blank" rel="noopener noreferrer" className="mp-resource-card">
                    <div className="mp-resource-icon mp-icon-blue">
                      <Download size={24} />
                    </div>
                    <div className="mp-resource-content">
                      <h3>Supplementary Materials</h3>
                      <p>Additional resources</p>
                    </div>
                    <ExternalLink size={18} className="mp-external-icon" />
                  </a>
                )}
                
                {moduleData.externalResource && (
                  <a href={moduleData.externalResource} target="_blank" rel="noopener noreferrer" className="mp-resource-card">
                    <div className="mp-resource-icon mp-icon-green">
                      <Globe size={24} />
                    </div>
                    <div className="mp-resource-content">
                      <h3>External Resource</h3>
                      <p>Reference material</p>
                    </div>
                    <ExternalLink size={18} className="mp-external-icon" />
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Tags Section */}
          {moduleData.tags?.length > 0 && (
            <section className="mp-section mp-tags-section">
              <h2 className="mp-section-title">
                <Tag size={22} />
                Topics Covered
              </h2>
              <div className="mp-tags-container">
                {moduleData.tags.map((tag, i) => (
                  <span key={i} className="mp-tag-badge">{tag}</span>
                ))}
              </div>
            </section>
          )}

          {/* Feedback Section */}
          {moduleData.enableFeedback && (
            <section className="mp-section">
              <div className="mp-feedback-box">
                <MessageCircle size={20} />
                <p>Share your feedback and help us improve this course for future learners.</p>
              </div>
            </section>
          )}
        </div>

      </div>

      <style>{`
        .mp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: flex-start;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1000;
          overflow-y: auto;
          padding: 20px 0;
        }

        .mp-modal-overlay.mp-visible {
          opacity: 1;
          pointer-events: all;
        }

        .mp-modal-container {
          background: #fff;
          max-width: 1000px;
          width: 95%;
          margin: 0 auto;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          position: relative;
        }

        .mp-modal-container.mp-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .mp-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .mp-close-btn:hover {
          background: #fff;
          transform: scale(1.1);
        }

        .mp-hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 50px 40px;
          border-radius: 12px 12px 0 0;
        }

        .mp-breadcrumb {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mp-separator {
          opacity: 0.6;
        }

        .mp-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          line-height: 1.2;
        }

        .mp-subtitle {
          font-size: 1.125rem;
          line-height: 1.6;
          opacity: 0.95;
          margin: 0 0 24px 0;
          max-width: 800px;
        }

        .mp-meta-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .mp-rating-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mp-rating-number {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .mp-stars-wrapper {
          display: flex;
          gap: 2px;
        }

        .star-filled {
          color: #f5c518;
        }

        .star-empty {
          color: rgba(255, 255, 255, 0.3);
        }

        .mp-divider {
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.25rem;
        }

        .mp-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.95rem;
        }

        .mp-cta-section {
          display: flex;
          gap: 12px;
        }

        .mp-btn-primary {
          background: #fff;
          color: #667eea;
          border: none;
          padding: 14px 32px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .mp-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .mp-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 40px 50px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .mp-stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .mp-stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mp-icon-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .mp-icon-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .mp-icon-green {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }

        .mp-icon-orange {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          color: white;
        }

        .mp-stat-content {
          flex: 1;
        }

        .mp-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
          margin-bottom: 4px;
        }

        .mp-stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight:500;
        }

        .mp-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid #e5e7eb;
          padding: 0 50px;
          background: white;
        }

        .mp-tab {
          background: none;
          border: none;
          padding: 16px 24px;
          font-size: 1rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }

        .mp-tab:hover {
          color: #667eea;
        }

        .mp-tab-active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .mp-content {
          padding: 40px 50px 50px;
          background: white;
          border-radius: 0 0 12px 12px;
        }

        .mp-section {
          margin-bottom: 40px;
        }

        .mp-section:last-child {
          margin-bottom: 0;
        }

        .mp-section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mp-outcomes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .mp-outcome-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .mp-check-icon {
          color: #10b981;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .mp-outcome-item span {
          font-size: 0.95rem;
          color: #374151;
          line-height: 1.5;
        }

        .mp-prerequisites-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mp-prerequisites-list li {
          padding: 12px 16px;
          background: #f9fafb;
          border-left: 3px solid #667eea;
          margin-bottom: 12px;
          border-radius: 4px;
          font-size: 0.95rem;
          color: #374151;
        }

        .mp-instruction-box {
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          padding: 20px;
        }

        .mp-instruction-box p {
          margin: 0;
          color: #1e40af;
          line-height: 1.6;
        }

        .mp-curriculum-info {
          margin-bottom: 20px;
        }

        .mp-curriculum-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .mp-info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #6b7280;
        }

        .mp-resources-grid {
          display: grid;
          gap: 16px;
        }

        .mp-resource-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .mp-resource-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .mp-resource-icon {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .mp-resource-content {
          flex: 1;
        }

        .mp-resource-content h3 {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .mp-resource-content p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .mp-external-icon {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .mp-tags-section {
          background: #f9fafb;
          padding: 30px;
          border-radius: 10px;
        }

        .mp-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mp-tag-badge {
          background: white;
          color: #667eea;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 2px solid #e0e7ff;
          transition: all 0.2s;
        }

        .mp-tag-badge:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .mp-feedback-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          color: #92400e;
        }

        @media (max-width: 768px) {
          .mp-hero-section {
            padding: 40px 24px 30px;
          }

          .mp-title {
            font-size: 1.75rem;
          }

          .mp-stats-grid {
            padding: 24px;
            grid-template-columns: 1fr;
          }

          .mp-tabs {
            padding: 0 24px;
          }

          .mp-content {
            padding: 24px;
          }

          .mp-outcomes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
export default ModulePreview;