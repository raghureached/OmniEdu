import React, { useState, useEffect } from 'react';
import { Gift, Star, Trophy, Sparkles, X } from 'lucide-react';
import './GiftPopup.css';

const GiftPopup = ({ isVisible, onClose, stickinessScore }) => {
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsUnwrapped(false);
      setShowConfetti(false);
      setTimeout(() => setIsUnwrapped(true), 1000);
      setTimeout(() => setShowConfetti(true), 1000);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getTopPercentage = () => {
    if (stickinessScore) return "Top 1%";
    // if (stickinessScore >= 70) return "Top 5%";
    // if (stickinessScore >= 60) return "Top 10%";
    // if (stickinessScore >= 50) return "Top 25%";
    return "Top 50%";
  };

  const getAchievementLevel = () => {
    if (stickinessScore) return "Elite Performer";
    // if (stickinessScore >= 70) return "Outstanding";
    // if (stickinessScore >= 60) return "Excellent";
    // if (stickinessScore >= 50) return "Great";
    return "Good";
  };

  const getAchievementColor = () => {
    if (stickinessScore ) return "#FFD700";
    // if (stickinessScore >= 80) return "#FFD700";
    // if (stickinessScore >= 70) return "#C0C0C0";
    // if (stickinessScore >= 60) return "#CD7F32";
    return "#1C88C7";
  };

  return (
    <div className="gift-popup-overlay">
      <div className="gift-popup-container">
        <button className="gift-popup-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="gift-content">
          <div className={`gift-box ${isUnwrapped ? 'unwrapped' : ''}`}>
            {!isUnwrapped ? (
              <div className="gift-wrapped">
                <Gift size={80} className="gift-icon" />
                <div className="gift-ribbon"></div>
                {/* <p className="gift-hint">Click to unwrap your achievement!</p> */}
              </div>
            ) : (
              <div className="gift-revealed">
                <div className="achievement-header">
                  <Trophy 
                    size={60} 
                    style={{ color: getAchievementColor() }} 
                    className="trophy-icon"
                  />
                  <Sparkles size={30} className="sparkle-icon sparkle-1" />
                  <Sparkles size={25} className="sparkle-icon sparkle-2" />
                  <Sparkles size={20} className="sparkle-icon sparkle-3" />
                </div>
                
                <div className="achievement-text">
                  <h2 className="achievement-title">Congratulations!</h2>
                  <div className="achievement-badge">
                    <span className="top-percentage">{getTopPercentage()}</span>
                    <span className="achievement-level">{getAchievementLevel()}</span>
                  </div>
                  <p className="achievement-description">
                    Your platform stickiness of <strong>{stickinessScore}%</strong> puts you among the elite performers in the organization!
                  </p>
                </div>

                <div className="achievement-stats">
                  <div className="stat-item">
                    <Star size={16} />
                    <span>Exceptional user engagement</span>
                  </div>
                  <div className="stat-item">
                    <Star size={16} />
                    <span>Outstanding retention rate</span>
                  </div>
                  <div className="stat-item">
                    <Star size={16} />
                    <span>Leading organizational impact</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {showConfetti && (
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#32CD32'][i % 5]
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftPopup;
