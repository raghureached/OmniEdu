import React, { useState } from 'react';
import './Assessment.css';
import SubmissionPopup from './SubmissionPopup';
import { MdApps, MdQuestionAnswer, MdQuiz, MdTimer } from 'react-icons/md';
import { ChevronRight, Submit } from 'lucide-react';

const AssessmentQuiz = ({ isOpen = true, onClose = () => { }, previewMode = false, assessmentData, embedded, updateDB=true }) => {
  // Use assessment data from props, fallback to dummy data for backward compatibility
  // console.log("AssessmentQuiz received assessmentData:", assessmentData);
  const assessment = assessmentData || {}
  const resolveUrl = (u) => {
    if (!u) return u;

    if (typeof u === 'string' && (u.startsWith('blob:') || u.startsWith('data:'))) {
      return u;
    }
    return u;
  };
  const questions = assessment.questions || [];

  const parseDuration = (durationStr) => {
    if (!durationStr) return { hours: 0, minutes: 0, seconds: 0 };

    if (typeof durationStr === 'number') {
      return {
        hours: Math.floor(durationStr / 60),
        minutes: durationStr % 60,
        seconds: 0
      };
    }

    // Handle string formats like "30 mins", "45 mins", etc.
    if (typeof durationStr === 'string') {
      const lower = durationStr.toLowerCase();
      const num = parseInt(lower.replace(/[^0-9]/g, ''), 10);
      if (Number.isNaN(num)) return { hours: 0, minutes: 0, seconds: 0 };
      if (lower.includes('hour')) return { hours: num, minutes: 0, seconds: 0 };
      if (lower.includes('min')) return { hours: Math.floor(num / 60), minutes: num % 60, seconds: 0 };
      return { hours: 0, minutes: num, seconds: 0 };
    }

    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const initialTime = parseDuration(assessment.duration);

  const [timeLeft, setTimeLeft] = useState({ hours: initialTime.hours, minutes: initialTime.minutes, seconds: initialTime.seconds });
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize state based on questions length
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [unsureFlags, setUnsureFlags] = useState([]);
  const [showNav, setShowNav] = useState(false);
  const [navFilter, setNavFilter] = useState('all'); // all | answered | not_answered | unsure

  // Submission popup state
  const [showSubmissionPopup, setShowSubmissionPopup] = useState(false);
  const [submissionTimeSpent, setSubmissionTimeSpent] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(1);

  // Initialize arrays when questions change
  React.useEffect(() => {
    setSelectedAnswers(new Array(questions.length).fill([]));
    setUnsureFlags(new Array(questions.length).fill(false));
  }, [questions.length]);

  const currentQ = questions[currentIndex] || { options: [], correct_option: [], type: '' };
  const isMulti = currentQ.type === 'Multi Select';

  // Toggle answer by option index; single vs multi based on question type
  const toggleAnswer = (optionIdx) => {
    setSelectedAnswers((prev) => {
      const next = [...prev];
      const curr = new Set(next[currentIndex]);
      if (isMulti) {
        if (curr.has(optionIdx)) curr.delete(optionIdx);
        else curr.add(optionIdx);
        next[currentIndex] = Array.from(curr).sort((a, b) => a - b);
      } else {
        next[currentIndex] = curr.has(optionIdx) ? [] : [optionIdx];
      }
      return next;
    });
  };

  // Timer
  React.useEffect(() => {
    if (previewMode || showSubmissionPopup) {
      setIsTimerActive(false);
      return; // freeze timer in preview mode or when submission popup is shown
    }

    setIsTimerActive(true); // Timer is active during assessment

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        // Check if time is already up
        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          setIsTimerActive(false);
          // Show time completed message and close
          setTimeout(() => {
            alert('Time is completed! Assessment will now close.');
            onClose();
          }, 100);
          return prev;
        }

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => {
      clearInterval(timer);
      setIsTimerActive(false);
    };
  }, [previewMode, showSubmissionPopup, onClose]);

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const submit = () => {
    // Calculate time spent (initial time minus time left)
    const initialSeconds = (initialTime.hours * 3600) + (initialTime.minutes * 60) + initialTime.seconds;
    const remainingSeconds = (timeLeft.hours * 3600) + (timeLeft.minutes * 60) + timeLeft.seconds;
    const timeSpent = initialSeconds - remainingSeconds;

    setSubmissionTimeSpent(timeSpent);
    setShowSubmissionPopup(true);
  };

  // Calculate score (kept for potential future use but not displayed)
  // Check if current question has an answer selected
  const currentQuestionAnswered = (selectedAnswers[currentIndex] || []).length > 0;
  const answeredCount = selectedAnswers.filter((arr) => arr.length > 0).length;
  const allQuestionsAnswered = selectedAnswers.length > 0 && selectedAnswers.every(arr => arr.length > 0);
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Navigation filter helpers
  const navCounts = React.useMemo(() => {
    const answered = selectedAnswers.filter((a) => a && a.length > 0).length;
    const unsure = unsureFlags.filter(Boolean).length;
    const total = questions.length;
    const notAnswered = Math.max(total - answered, 0);
    return { total, answered, notAnswered, unsure };
  }, [questions.length, selectedAnswers, unsureFlags]);

  const filteredIndices = React.useMemo(() => {
    const allIdx = questions.map((_, i) => i);
    if (navFilter === 'all') return allIdx;
    if (navFilter === 'answered') return allIdx.filter((i) => (selectedAnswers[i] || []).length > 0);
    if (navFilter === 'not_answered') return allIdx.filter((i) => (selectedAnswers[i] || []).length === 0);
    if (navFilter === 'unsure') return allIdx.filter((i) => !!unsureFlags[i]);
    return allIdx;
  }, [questions, selectedAnswers, unsureFlags, navFilter]);

  // Close handling
  const handleClose = () => {
    // In preview mode, close immediately without confirmation or submission popup
    if (previewMode) {
      onClose();
      return;
    }
    // Otherwise, confirm and proceed to submission popup
    if (window.confirm("Closing Assessment will result in submission of assessment. Are you sure you want to close?")) {
      setIsTimerActive(false); // Freeze timer immediately
      const initialSeconds = (initialTime.hours * 3600) + (initialTime.minutes * 60) + initialTime.seconds;
      const remainingSeconds = (timeLeft.hours * 3600) + (timeLeft.minutes * 60) + timeLeft.seconds;
      const timeSpent = initialSeconds - remainingSeconds;
      setSubmissionTimeSpent(timeSpent);
      setShowSubmissionPopup(true);
    } else {
      return;
    }
  };


  const hasImage = currentQ.file_url?.match(/\.(jpeg|jpg|png|gif)$/i);
  const hasVideo = currentQ.file_url?.match(/\.(mp4|webm|ogg)$/i);
  const hasVisualMedia = hasImage || hasVideo;


  return (
    <div className={embedded ? "" : "assesspreview-modal-overlay"} onClick={handleClose}>
      <div className="assesspreview-modal-panel" style={embedded ? {height:"85vh", width:"100%",minWidth:"100%"} : {}} onClick={(e) => e.stopPropagation()}>
        <div className="assesspreview-container">
          <div className="assesspreview-header" >
         
            <div className="assesspreview-timer" style={{paddingLeft:"10px"}}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="assesspreview-timer-icon"><MdTimer size={16} /></span>
                <span className="assesspreview-timer-label" style={{ fontWeight: "800" }}>Time left:</span>
                {isTimerActive && <span className="timer-indicator" title="Timer is running"></span>}
              </span>
              <span className={`assesspreview-timer-digit ${isTimerActive ? 'timer-active' : ''}`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="assesspreview-timer-separator">:</span>
              <span className={`assesspreview-timer-digit ${isTimerActive ? 'timer-active' : ''}`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="assesspreview-timer-separator">:</span>
              <span className={`assesspreview-timer-digit ${isTimerActive ? 'timer-active' : ''}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
              
            <div className="assesspreview-header-right">
            {embedded ? null : <button className="assesspreview-close-btn" title="Close" onClick={embedded ? null : handleClose}>✕</button>}
              <button className="assesspreview-nav-btn" style={{ fontWeight: "700", display: "none" }} onClick={() => setShowNav(true)}><MdApps size={16} /> Questions Nav</button>
            </div>
          </div>

          <div
            className="assesspreview-question-number"
            style={{ marginBottom: "20px", marginTop: "20px", ...(embedded ? { width: "85%" } : {}) }}
          >
            <span className="assesspreview-q-icon"></span>
            Question {currentIndex + 1} of {questions.length}
          </div>
          {hasVisualMedia ?(  <p className="assesspreview-instruction" style={{marginLeft:"65px"}}>{isMulti ? 'Select all that apply' : 'Select one'}</p>):(  <p className="assesspreview-instruction">{isMulti ? 'Select all that apply' : 'Select one'}</p>)}
        
          {hasVisualMedia ? (
           

              <h2 className="assesspreview-question-title" style={{marginLeft:"65px",maxWidth:"960px",paddingBottom:"20px"}}>Q{currentIndex + 1}. {currentQ.question_text}</h2>
           
          ) : (
            
            <h2 className="assesspreview-question-title"style={{paddingBottom:"10px"}}>Q{currentIndex + 1}. {currentQ.question_text}</h2>
          )}


          {/* Check if we have visual media (image or video) for side-by-side layout */}
          {(() => {
            if (!isOpen) return null;
            return (
              <>
                {/* Audio and PDF stay in their original position */}
                {currentQ.file_url?.match(/\.(mp3|wav|ogg)$/i) && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <audio src={resolveUrl(currentQ.file_url)} controls style={{ width: '600px', maxWidth: '80%' }} />
                  </div>
                )}
                {currentQ.file_url?.match(/\.pdf$/i) && (
                  <iframe src={resolveUrl(currentQ.file_url)} title="PDF Preview" style={{ width: '100%', height: 360, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                )}

                {/* Visual media (image/video) with side-by-side layout */}
                {hasVisualMedia ? (
                  <div className="assesspreview-side-by-side-layout">
                     <div className="assesspreview-media-section">
                      {hasImage && (
                        <img
                          src={resolveUrl(currentQ.file_url)}
                          alt="Question visual"
                          className="assesspreview-media-image"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '350px',
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            display: 'block',
                            minWidth: '100%',
                            minHeight: '350px',

                          }}
                        />
                      )}
                      {hasVideo && (
                        <video src={resolveUrl(currentQ.file_url)} controls  className="assesspreview-media-image" style={{
                          maxWidth: '100%',
                          maxHeight: '350px',
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          display: 'block',
                          minWidth: '100%',
                          minHeight: '350px',

                        }} />
                      )}
                    </div>
                    <div className="assesspreview-options-section" style={{marginRight:"22px"}}>
                      <div className={`assesspreview-options-grid assesspreview-options-list ${currentQ.options.length >=2 ? 'compact-options' : ''}`} >
                        <h4>Options</h4>
                        {currentQ.options.map((opt, idx) => {
                          const selected = (selectedAnswers[currentIndex] || []).includes(idx);
                          const letter = String.fromCharCode(65 + idx);
                          return (
                            <div
                              key={idx}
                              className={`assesspreview-option-card assesspreview-option-row ${selected ? 'assesspreview-option-selected' : ''}`}
                              onClick={() => toggleAnswer(idx)}
                              style={{ backgroundColor: selected ? '#f0f5ff' : 'white' }}
                            >
                              <div className={isMulti ? `assesspreview-option-checkbox ${selected ? 'assesspreview-option-checkbox-checked' : ''}` : 'assesspreview-option-radio'}>
                                {!isMulti && selected && <div className="assesspreview-option-radio-inner"></div>}
                                {isMulti && selected && '✓'}
                              </div>
                              <div className="assesspreview-option-letter">{letter}</div>

                              <div className="assesspreview-option-text">{opt}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                   
                  </div>
                ) : (
                  <>
                    {/* Normal layout for questions without visual media */}
                    <div className={`assesspreview-options-grid assesspreview-options-list`}>
                      {currentQ.options.map((opt, idx) => {
                        const selected = (selectedAnswers[currentIndex] || []).includes(idx);
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <div
                            key={idx}
                            className={`assesspreview-option-card assesspreview-option-row ${selected ? 'assesspreview-option-selected' : ''}`}
                            onClick={() => toggleAnswer(idx)}
                            style={{ backgroundColor: selected ? '#f0f5ff' : 'white' }}
                          >
                            <div className={isMulti ? `assesspreview-option-checkbox ${selected ? 'assesspreview-option-checkbox-checked' : ''}` : 'assesspreview-option-radio'}>
                              {!isMulti && selected && <div className="assesspreview-option-radio-inner"></div>}
                              {isMulti && selected && '✓'}
                            </div>
                            <div className="assesspreview-option-letter">{letter}</div>

                            <div className="assesspreview-option-text">{opt}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            );
          })()}

          <div className="assesspreview-actions-preview">
            <div className="assesspreview-actions-preview-left" style={{marginLeft:"20px"}}>
              <button className="assesspreview-btn assesspreview-btn-secondary" disabled={currentIndex === 0} onClick={goPrev}>
                Previous
              </button>
            </div>
            <div className="assesspreview-actions-preview-right" style={{marginRight:"20px"}}>
              <button
                className={`assesspreview-btn assesspreview-btn-review ${unsureFlags[currentIndex] ? 'is-marked' : ''}`}
                onClick={() =>
                  setUnsureFlags((prev) => {
                    const next = [...prev];
                    next[currentIndex] = !next[currentIndex];
                    return next;
                  })
                }
                style={{ display: 'none' }}
              >
                {unsureFlags[currentIndex] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              {currentIndex < questions.length - 1 ? (
               
                <button 
                className={`assesspreview-btn ${!currentQuestionAnswered ? 'assesspreview-btn-disabled' : 'assesspreview-btn-primary'}`} 
                onClick={goNext} 
                disabled={!currentQuestionAnswered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  opacity: !currentQuestionAnswered ? 0.7 : 1,
                  cursor: !currentQuestionAnswered ? 'not-allowed' : 'pointer'
                }}
              >
                Save & Next<ChevronRight size={16} />
              </button>
              ) : (
                previewMode ? (
                  <button className="assesspreview-btn assesspreview-btn-primary" onClick={handleClose}>
                    Close
                  </button>
                ) : (
                  <button 
                    className={`assesspreview-btn ${!allQuestionsAnswered ? 'assesspreview-btn-disabled' : 'assesspreview-btn-primary'}`} 
                    onClick={submit}
                    disabled={!allQuestionsAnswered}
                    style={{
                      opacity: !allQuestionsAnswered ? 0.7 : 1,
                      cursor: !allQuestionsAnswered ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Submit
                  </button>
                )
              )}
            </div>
          </div>

        </div>
        {showNav && (
          <div className="assesspreview-nav-overlay" onClick={() => setShowNav(false)}>
            <div className="assesspreview-nav-panel" onClick={(e) => e.stopPropagation()}>
              <div className="assesspreview-nav-header">
                <h3>Quiz Navigation • {navCounts.total} Questions</h3>
                <button className="assesspreview-close-btn" onClick={() => setShowNav(false)}>✕</button>
              </div>
              <div className="assesspreview-nav-body">
                <div className="assesspreview-nav-sidebar">
                  <div className="assesspreview-nav-filter-title">Show question</div>
                  <button
                    className={`assesspreview-nav-filter ${navFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('all')}
                  >
                    <span className="filter-label">All Question</span>
                    <span className="filter-badge">{navCounts.total}</span>
                  </button>
                  <button
                    className={`assesspreview-nav-filter ${navFilter === 'answered' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('answered')}
                  >
                    <span className="filter-label">Answered</span>
                    <span className="filter-badge">{navCounts.answered}</span>
                  </button>
                  <button
                    className={`assesspreview-nav-filter ${navFilter === 'not_answered' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('not_answered')}
                  >
                    <span className="filter-label">Not Answered</span>
                    <span className="filter-badge">{navCounts.notAnswered}</span>
                  </button>
                  <button
                    className={`assesspreview-nav-filter ${navFilter === 'unsure' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('unsure')}
                  >
                    <span className="filter-label">Not Sure</span>
                    <span className="filter-badge">{navCounts.unsure}</span>
                  </button>
                  <div className="assesspreview-nav-hint">Choose tab to filter questions.</div>
                </div>
                <div className="assesspreview-nav-main">
                  <div className="assesspreview-nav-list-title">List Number Question</div>
                  <div className="assesspreview-nav-circles">
                    {filteredIndices.map((idx) => {
                      const isCurrent = idx === currentIndex;
                      const isAnswered = (selectedAnswers[idx] || []).length > 0;
                      const isUnsure = !!unsureFlags[idx];
                      return (
                        <button
                          key={idx}
                          className={`assesspreview-circle ${isCurrent ? 'is-current' : ''} ${isAnswered ? 'is-answered' : ''} ${isUnsure ? 'is-unsure' : ''}`}
                          onClick={() => { setCurrentIndex(idx); setShowNav(false); }}
                          title={`Question ${idx + 1}`}
                        >
                          <span>{idx + 1}</span>
                          {isUnsure && <span className="assesspreview-circle-dot" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="assesspreview-footer">
          <span className="assesspreview-footer-text">Have an issue with this question?</span>
          <button className="assesspreview-report-btn">🚩 Report An Issue</button>
        </div>
      </div>

      {/* Submission Popup */}
      <SubmissionPopup
        isOpen={showSubmissionPopup}
        onClose={() => {
          setShowSubmissionPopup(false);
          // Call the original onClose prop (handleQuizClose from AssessmentPreview)
          // This will properly go to preview mode
          onClose();
        }}
        updateDB={updateDB}
        previewMode={previewMode}
        assessmentData={assessment}
        answers={selectedAnswers}
        timeSpent={submissionTimeSpent}
        currentAttempt={currentAttempt} // Track this in parent component
        onRetake={() => {
          // Check if user has exceeded maximum attempts
          if (!assessment.unlimited_attempts && currentAttempt >= assessment.attempts) {
            alert(`You have reached the maximum number of attempts (${assessment.attempts}).`);
            return;
          }
          
          setShowSubmissionPopup(false);
          // Increment attempt count for retake
          setCurrentAttempt(prev => prev + 1);
          // Reset assessment state for retake
          setCurrentIndex(0);
          setSelectedAnswers(new Array(questions.length).fill([]));
          setUnsureFlags(new Array(questions.length).fill(false));
          setTimeLeft({ hours: initialTime.hours, minutes: initialTime.minutes, seconds: initialTime.seconds });
          setIsTimerActive(!previewMode);
        }}
      />
    </div>
  );
};

export default AssessmentQuiz;