import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SubmissionPopupSurveys.css';

const SubmissionPopupSurveys = ({ isOpen, onClose, assessmentData, answers, timeSpent, updateDB = true, feedback }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  // console.log(assessmentData)
  useEffect(() => {
    let timer;
    const submit = async () => {
      try {
        if (updateDB && !submitted) {
          await api.post('/api/user/submitSurvey', {
            surveyId: assessmentData?._id,
            surveyAssignmentId: assessmentData?.assignment_id || undefined,
            answers,
            timeSpent,
            feedback,
          });
          setSubmitted(true);
        }
      } catch (e) {
        // swallow error for UX; optionally add toast
      } finally {
        timer = setTimeout(() => setIsLoading(false), 1500);
      }
    };
    if (isOpen) {
      setIsLoading(true);
      submit();
    } else {
      setIsLoading(true);
      setSubmitted(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, updateDB, assessmentData?._id]);

  if (!isOpen) return null;

  // Calculate basic statistics
  const totalQuestions = assessmentData?.questions?.length || 0;

  // Fix: Properly handle different answer types (numbers for single choice, arrays for multi-select, strings for text)
  const answeredQuestions = answers?.filter(answer => {
    if (answer === null || answer === undefined) return false;
    if (typeof answer === 'string') return answer.trim().length > 0;
    if (typeof answer === 'number') return true; // Single choice selections are stored as numbers (0, 1, 2, etc.)
    if (Array.isArray(answer)) return answer.length > 0; // Multi-select stores array of indices
    return false;
  }).length || 0;

  const completionRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Format time spent
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoading) {
    return (
      <div className="submission-popup-overlay" onClick={onClose}>
        <div className="submission-popup-panel loading" onClick={(e) => e.stopPropagation()}>
          <div className="loader-container">
            <div className="loader"></div>
            <p>Submitting your survey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-popup-overlay" onClick={onClose}>
      <div className="submission-popup-panel" onClick={(e) => e.stopPropagation()}>
        <div className="submission-popup-content">
          {/* Header */}
          <div className="submission-popup-header">
            <div className="submission-popup-icon">

              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradientStroke" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#7B8CFA" />
                    <stop offset="100%" stop-color="#6257E1" />
                  </linearGradient>
                </defs>
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="url(#gradientStroke)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>


            </div>
            <h2 className="submission-popup-title">Survey Submitted!</h2>
            <p className="submission-popup-subtitle">
              Your survey has been successfully submitted.
            </p>
          </div>

          {/* Statistics */}
          <div className="submission-popup-stats" style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="stat-item">
              <div className="stat-label">Questions Completed</div>
              <div className="stat-value">{answeredQuestions} of {totalQuestions}</div>
             
            </div>
           
              <div className="stat-item">
                <div className="stat-label">Completion Rate</div>
                <div className="stat-value">{completionRate}%</div>
              </div>

              {timeSpent && timeSpent > 0 && (
                <div className="stat-item">
                  <div className="stat-label">Time Spent</div>
                  <div className="stat-value">{formatTime(timeSpent)}</div>
                </div>
              )}
            
          </div>

          {/* Actions */}
          <div className="submission-popup-actions">
            <button
              className="submission-popup-btn submission-popup-btn-primary"
              onClick={onClose}
            >
              Close Survey
            </button>
          </div>

          {/* Footer message */}
          <div className="submission-popup-footer">
            <p>Thank you for completing the survey!</p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPopupSurveys;
