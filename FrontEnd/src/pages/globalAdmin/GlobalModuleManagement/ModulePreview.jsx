import React, { useState, useEffect } from 'react';
import { Play, FileText, Clock, Award, Calendar, Tag, Globe, Eye, Download, X, Star, Users, BookOpen, Target, CheckCircle, ExternalLink, MessageCircle, Zap } from 'lucide-react';
import './ModulePreview.css';
import { useParams } from 'react-router-dom';

const ModulePreview = ({ moduleData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  // console.log(moduleData);
  const moduleId = useParams();
  console.log(moduleId)
  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!moduleData) return null;

  const {
    title = "Module Title",
    primaryFile = null,
    duration = "2 hours",
    tags = ["JavaScript", "React", "Frontend"],
    description = "This is a comprehensive module that covers advanced concepts and practical implementations.",
    learningOutcomes = ["Understand core concepts", "Apply practical skills", "Build real projects"],
    additionalFile = null,
    difficultyLevel = "Intermediate",
    prerequisites = "Basic knowledge of HTML, CSS, and JavaScript",
    credits = 3,
    stars = 4.8,
    badges = 2,
    team = "Development Team",
    category = "Web Development",
    trainingType = "Interactive",
    instructions = "Complete all sections and submit the final project for evaluation.",
    externalResource = "https://example.com/resources",
    enableFeedback = true
  } = moduleData;

  const getDifficultyClass = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'difficulty-beginner';
      case 'intermediate': return 'difficulty-intermediate';
      case 'advanced': return 'difficulty-advanced';
      default: return 'difficulty-default';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`star ${i < Math.floor(rating) ? 'star-filled' : 'star-empty'}`}
      />
    ));
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`modal-container ${isVisible ? 'visible' : ''}`}>
        {/* Header */}
        <div className="modal-header">
          <button onClick={handleClose} className="close-button">
            <X className="close-icon" />
          </button>
          
          <div className="header-content">
            <div className="category-badge">
              <BookOpen className="category-icon" />
              <span className="category-text">{category}</span>
            </div>
            <h1 className="module-title">{title}</h1>
            
            <div className="module-info">
              <div className="info-item">
                <Clock className="info-icon" />
                <span>{duration}</span>
              </div>
              <div className="info-item">
                <Users className="info-icon" />
                <span>{team}</span>
              </div>
              <div className="info-item rating">
                {renderStars(stars)}
                <span className="rating-number">{stars}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          <div className="content-inner">
            {/* Stats Row */}
            <div className="stats-grid">
              <div className="stat-card credits">
                <Award className="stat-icon" />
                <div className="stat-number">{credits}</div>
                <div className="stat-label">Credits</div>
              </div>
              <div className="stat-card badges">
                <Zap className="stat-icon" />
                <div className="stat-number">{badges}</div>
                <div className="stat-label">Badges</div>
              </div>
              <div className="stat-card training">
                <Target className="stat-icon" />
                <div className="stat-text">{trainingType}</div>
                <div className="stat-sublabel">Training Type</div>
              </div>
              <div className="stat-card difficulty">
                <div className={`difficulty-badge ${getDifficultyClass(difficultyLevel)}`}>
                  {difficultyLevel}
                </div>
                <div className="stat-sublabel">Difficulty</div>
              </div>
            </div>

            {/* Description */}
            <div className="section description-section">
              <h3 className="section-title">
                <FileText className="section-icon" />
                Description
              </h3>
              <p className="description-text">{description}</p>
            </div>

            {/* Learning Outcomes */}
            <div className="section">
              <h3 className="section-title outcomes-title">
                <Target className="section-icon outcomes-icon" />
                Learning Outcomes
              </h3>
              <div className="outcomes-list">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="outcome-item">
                    <CheckCircle className="outcome-check" />
                    <span className="outcome-text">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {prerequisites && (
              <div className="section">
                <h3 className="section-title prerequisites-title">
                  <BookOpen className="section-icon prerequisites-icon" />
                  Prerequisites
                </h3>
                <p className="prerequisites-text">{prerequisites}</p>
              </div>
            )}

            {/* Instructions */}
            {instructions && (
              <div className="section">
                <h3 className="section-title instructions-title">
                  <Eye className="section-icon instructions-icon" />
                  Instructions
                </h3>
                <p className="instructions-text">{instructions}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="section">
                <h3 className="section-title tags-title">
                  <Tag className="section-icon tags-icon" />
                  Tags
                </h3>
                <div className="tags-container">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files and Resources */}
            <div className="resources-grid">
              {primaryFile && (
                <div className="resource-card primary-file">
                  <h4 className="resource-title">
                    <FileText className="resource-icon" />
                    Primary File
                  </h4>
                  <p className="resource-text">{primaryFile}</p>
                </div>
              )}
              
              {additionalFile && (
                <div className="resource-card additional-file">
                  <h4 className="resource-title">
                    <Download className="resource-icon" />
                    Additional File
                  </h4>
                  <p className="resource-text">{additionalFile}</p>
                </div>
              )}
              
              {externalResource && (
                <div className="resource-card external-resource">
                  <h4 className="resource-title">
                    <Globe className="resource-icon" />
                    External Resource
                  </h4>
                  <a href={externalResource} target="_blank" rel="noopener noreferrer" className="resource-link">
                    View Resource <ExternalLink className="external-icon" />
                  </a>
                </div>
              )}
              
              {enableFeedback && (
                <div className="resource-card feedback">
                  <h4 className="resource-title">
                    <MessageCircle className="resource-icon" />
                    Feedback Enabled
                  </h4>
                  <p className="resource-text">Students can provide feedback on this module</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-footer">
            <div className="button-group">
              <button onClick={handleClose} className="button button-secondary">
                Close
              </button>
              <button className="button button-primary">
                <Play className="button-icon" />
                Start Module
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePreview;