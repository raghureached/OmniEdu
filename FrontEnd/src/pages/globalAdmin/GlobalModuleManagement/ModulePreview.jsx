import React, { useState, useEffect } from 'react';
import { 
  Play, FileText, Clock, Award, Tag, Globe, 
  Download, X, Star, Users, BookOpen, Target, 
  CheckCircle, MessageCircle, ExternalLink, Zap 
} from 'lucide-react';
import './ModulePreview.css';

const ModulePreview = ({ moduleData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

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
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`star ${i < starsCount ? 'star-filled' : 'star-empty'}`}
      />
    ));
  };

  return (
    <div className={`modal-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`modal-container ${isVisible ? 'visible' : ''}`}>

        {/* Header */}
        <div className="modal-header">
          <button onClick={handleClose} className="close-btn">
            <X size={20} />
          </button>
          <h2 className="module-title">{moduleData.title}</h2>
          <div className="info-row">
            <div className="info-item"><Clock size={16} /> Duration: {moduleData.duration} mins</div>
            <div className="info-item"><Users size={16} /> Team: {moduleData.team?.name || 'N/A'}</div>
            <div className="info-item rating">
              {renderStars(moduleData.stars)}
              <span className="rating-text">{moduleData.stars}</span>
            </div>
          </div>
          <div className="info-row">
            <div className="info-item"><Award size={16} /> Credits: {moduleData.credits}</div>
            <div className="info-item"><Zap size={16} /> Badges: {moduleData.badges}</div>
            <div className="info-item">Training: {moduleData.trainingType}</div>
          </div>
        </div>

        {/* Description */}
        <section className="section">
          <h3><FileText size={18} /> Description</h3>
          <p>{moduleData.description}</p>
        </section>

        {/* Learning Outcomes */}
        <section className="section">
          <h3><Target size={18} /> Learning Outcomes</h3>
          <ul>
            {moduleData.learningOutcomes.map((outcome, i) => (
              <li key={i}><CheckCircle size={16} /> {outcome}</li>
            ))}
          </ul>
        </section>

        {/* Prerequisites */}
        {moduleData.prerequisites?.length > 0 && (
          <section className="section">
            <h3><BookOpen size={18} /> Prerequisites</h3>
            <ul>
              {moduleData.prerequisites.map((pre, i) => (
                <li key={i}>{pre}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Instructions */}
        {moduleData.instructions && (
          <section className="section">
            <h3><MessageCircle size={18} /> Instructions</h3>
            <p>{moduleData.instructions}</p>
          </section>
        )}

        {/* Tags */}
        {moduleData.tags?.length > 0 && (
          <section className="section tags-section">
            <h3><Tag size={18} /> Tags</h3>
            <div className="tags-container">
              {moduleData.tags.map((tag, i) => (
                <span key={i} className="tag-badge">{tag}</span>
              ))}
            </div>
          </section>
        )}

        {/* Files and External Resources */}
        <section className="section resources-section">
          <h3>Resources</h3>
          <ul className="resource-list">
            {moduleData.primaryFile && (
              <li>
                <FileText size={16} /> <a href={moduleData.primaryFile} target="_blank" rel="noopener noreferrer">Primary File</a>
              </li>
            )}
            {moduleData.additionalFile && (
              <li>
                <Download size={16} /> <a href={moduleData.additionalFile} target="_blank" rel="noopener noreferrer">Additional File</a>
              </li>
            )}
            {moduleData.externalResource && (
              <li>
                <Globe size={16} /> <a href={moduleData.externalResource} target="_blank" rel="noopener noreferrer">External Resource <ExternalLink size={14} /></a>
              </li>
            )}
          </ul>
        </section>

        {/* Feedback */}
        {moduleData.enableFeedback && (
          <section className="section feedback-section">
            <p>Students can provide feedback on this module.</p>
          </section>
        )}

        {/* Footer Action Buttons */}
        <div className="modal-footer">
          <button onClick={handleClose} className="btn btn-secondary">Close</button>
          <button className="btn btn-primary">
            <Play size={20} /> Start Module
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModulePreview;
