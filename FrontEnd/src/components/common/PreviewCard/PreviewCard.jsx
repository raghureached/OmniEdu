import React from 'react';
import './PreviewCard.css';

const PreviewCard = ({ imageUrl, title, description, onClose }) => {
  return (
    <div className="previewcard-container">
      <div className="previewcard-card">
        <button className="previewcard-close" aria-label="Close preview" onClick={onClose}>
          ×
        </button>
        <div className="previewcard-imageWrap">
          {imageUrl ? (
            <img src={imageUrl} alt={title || 'Thumbnail'} className="previewcard-image" />
          ) : (
            <div className="previewcard-image placeholder">No Image</div>
          )}
        </div>
        <div className="previewcard-content">
          {title ? <h3 className="previewcard-title">{title}</h3> : null}
          {description ? (
            <p className="previewcard-description">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PreviewCard;
