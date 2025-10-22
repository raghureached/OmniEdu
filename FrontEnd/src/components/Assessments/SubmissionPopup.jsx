import React, { useState } from 'react';
import './SubmissionPopup.css';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

const SubmissionPopup = ({ isOpen, onClose, assessmentData, answers, timeSpent, currentAttempt, onRetake }) => {
  const [feedbackReaction, setFeedbackReaction] = useState(null); // 'like' | 'dislike' | null
  const [feedbackComment, setFeedbackComment] = useState('');

  //console.log("assessments data in popup",assessmentData)
  if (!isOpen) return null;

  // Feedback helpers
  const toggleReaction = (type) => {
    setFeedbackReaction((prev) => (prev === type ? null : type));
  };
  const handleCommentChange = (e) => {
    const val = e.target.value.slice(0, 50);
    setFeedbackComment(val);
  };
  const handleFeedbackSubmit = () => {
    // TODO: wire to backend if needed
    alert(`Feedback submitted: ${feedbackReaction || 'no reaction'} | '${feedbackComment}'`);
    setFeedbackReaction(null);
    setFeedbackComment('');
    // Close resources and go to preview after feedback submission


  };
  // Calculate basic statistics
  const totalQuestions = assessmentData?.questions?.length || 0;
  const answeredQuestions = answers?.filter(answer => answer && answer.length > 0).length || 0;
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
  // Get from assessmentData
  const maxAttempts = assessmentData?.attempts;
  console.log(maxAttempts);
  const unlimitedAttempts = assessmentData?.unlimited_attempts || false;

  // For current attempt, you need to pass this as a prop or track it in parent component
  // For now, assuming this is attempt 1 (you'll need to track this in Assessment.jsx)
  const currentAttemptValue = currentAttempt || 1; // This should come from parent component

  const attemptsText = unlimitedAttempts ?
    `${currentAttemptValue} (Unlimited)` :
    `${maxAttempts-currentAttemptValue} of ${maxAttempts}`;
  // Calculate actual score based on correct answers
  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    assessmentData?.questions?.forEach((question, index) => {
      const userAnswer = answers[index] || [];
      const correctOption = question.correct_option;
      const questionPoints = question.total_points || 1;

      totalPoints += questionPoints;

      // Ensure correctAnswers is always an array
      const correctAnswers = Array.isArray(correctOption) ? correctOption : [correctOption];

      // Check if user's answer matches correct answer(s)
      if (question.type === 'Multiple Choice') {
        // Single answer
        if (userAnswer.length === 1 && correctAnswers.includes(userAnswer[0])) {
          earnedPoints += questionPoints;
        }
      } else {
        // Multiple select - all answers must match exactly
        if (userAnswer.length === correctAnswers.length &&
          userAnswer.every(ans => correctAnswers.includes(ans)) &&
          correctAnswers.every(ans => userAnswer.includes(ans))) {
          earnedPoints += questionPoints;
        }
      }
    });

    const passPercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    return { passPercentage, earnedPoints, totalPoints };
  };

  const { passPercentage, earnedPoints, totalPoints } = calculateScore();
  // Get passing threshold from assessment data
  const passingThreshold = assessmentData?.percentage_to_pass || 70;

  // Determine pass/fail status
  const getStatus = () => {
    if (passPercentage >= passingThreshold) {
      return { status: 'Passed', statusClass: 'status-passed' };
    } else {
      return { status: 'Failed', statusClass: 'status-failed' };
    }
  };

  const { status, statusClass } = getStatus();

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
            <h2 className="submission-popup-title">Assessment Submitted!</h2>
            <p className="submission-popup-subtitle">
              Your assessment has been successfully submitted.
            </p>
          </div>

          {/* Statistics */}
          {/* <div className="submission-popup-stats" >

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="stat-item">
                <div className="stat-label">Questions Completed</div>
                <div className="stat-value">{answeredQuestions} of {totalQuestions}</div>
              
              </div>
              <div className="stat-item">
                <div className="stat-label">Completion Rate</div>
                <div className="stat-value">{completionRate}%</div>
              </div>

              {timeSpent && (
                <div className="stat-item">
                  <div className="stat-label">Time Spent</div>
                  <div className="stat-value">{formatTime(timeSpent)}</div>
                </div>
              )}
            </div>


            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="stat-item">
                <div className="stat-label">Attempts</div>
                <div className="stat-value">{attemptsText}</div>
               
              </div>
              <div className="stat-item">
                <div className="stat-label">Pass Percentage</div>
                <div className="stat-value">{passPercentage}%</div>
              </div>


              <div className="stat-item">
                <div className="stat-label">Status</div>
                <div className={`stat-value ${status === 'Passed' ? 'status-passed' : 'status-failed'}`}>
                  {status}
                </div>
              </div>

            </div>
          </div> */}
          <div className="submission-popup-stats">
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
    <div className="stat-item">
      <div className="stat-label">Questions Completed</div>
      <div className="stat-value">{answeredQuestions} of {totalQuestions}</div>
    </div>
    <div className="stat-item">
      <div className="stat-label">Completion Rate</div>
      <div className="stat-value">{completionRate}%</div>
    </div>
    {timeSpent && (
      <div className="stat-item">
        <div className="stat-label">Time Spent</div>
        <div className="stat-value">{formatTime(timeSpent)}</div>
      </div>
    )}
  </div>

  <div style={{ display: "flex", justifyContent: "space-between",borderBottom:"none" }}>
    <div className="stat-item">
      <div className="stat-label">Attempts Summary</div>
      <div className="stat-value">{maxAttempts>9?'Unlimited':attemptsText}</div>
    </div>
    <div className="stat-item">
      <div className="stat-label">Score Obtained</div>
      <div className="stat-value">{passPercentage}%</div>
    </div>
    <div className="stat-item">
      <div className="stat-label">Status</div>
      <div className={`stat-value ${status === 'Passed' ? 'status-passed' : 'status-failed'}`}>
        {status}
      </div>
    </div>
  </div>
</div>
          {/* For feedback */}
          <div className="global-preview-resources-content">
            {assessmentData.feedbackEnabled ? (
              <div className="global-preview-card" style={{ border: "none",background:"#f8fafc" }} >
                <div className="feedback-header-row" style={{ marginBottom: "20px" }}>
                  <h4 className="feedback-title">Feedback (Optional)</h4>
                  <div className="feedback-actions">
                    <button
                      type="button"
                      className={`feedback-btn ${feedbackReaction === 'like' ? 'active like' : ''}`}
                      onClick={() => toggleReaction('like')}
                      aria-pressed={feedbackReaction === 'like'}
                    >
                      <ThumbsUp size={16} /> Like
                    </button>
                    <button
                      type="button"
                      className={`feedback-btn ${feedbackReaction === 'dislike' ? 'active dislike' : ''}`}
                      onClick={() => toggleReaction('dislike')}
                      aria-pressed={feedbackReaction === 'dislike'}
                    >
                      <ThumbsDown size={16} /> Dislike
                    </button>
                  </div>
                </div>
                <div className="feedback-input-row">
                  <input
                    type="text"
                    className="feedback-input"
                    placeholder="Add a comment (max 50 chars)"
                    value={feedbackComment}
                    onChange={handleCommentChange}
                    maxLength={50}
                  />
                  <div className="feedback-right">
                    <span className="feedback-count">{feedbackComment.length}/50</span>
                    {/* <button
                      type="button"
                      className="feedback-submit"
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackReaction && feedbackComment.trim().length === 0}
                    >
                      <Send size={14} /> Submit
                    </button> */}
                  </div>
                </div>
                {assessmentData.feedback && (
                  <div className="global-preview-iframe-container" style={{ marginTop: 8 }}>
                    <iframe src={assessmentData.feedback} frameBorder="0" title="Feedback"></iframe>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          {/* Actions */}
          {status === 'Failed' && onRetake ? (
  <div className="submission-popup-actions" style={{ display: "flex", justifyContent: "space-between",gap: "20px" }}>
    <button
      className="submission-popup-btn submission-popup-btn-secondary"
      onClick={onRetake}
    >
      Retake Assessment
    </button>
    <button
      className="submission-popup-btn submission-popup-btn-primary"
      onClick={onClose}
    >
      Close Assessment
    </button>
  </div>
) : (
  <div className="submission-popup-actions">
    <button
      className="submission-popup-btn submission-popup-btn-primary"
      onClick={onClose}
    >
      Close Assessment
    </button>
   
  </div>
)}
         

          {/* Footer message */}
         {status === 'Failed' ?( <div className="submission-popup-footer">
            <p>Thank you for completing the assessment!</p>
          
          </div>):(<div className="submission-popup-footer">
            <p>Thank you for completing the assessment!</p>
            <p> To view the answers,go to completed trainings tab</p>
          </div>)}
        </div>
      </div>
    </div>
  );
};

export default SubmissionPopup;
