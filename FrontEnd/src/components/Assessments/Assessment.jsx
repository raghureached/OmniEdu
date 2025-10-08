import React, { useState } from 'react';
import './Assessment.css';
import { MdQuestionAnswer, MdQuiz } from 'react-icons/md';
import { ChevronRight,Submit } from 'lucide-react';

// Props:
// - isOpen: controls modal visibility (default true)
// - onClose: callback when modal should close
// - previewMode: when true, timer freezes and submission/result screen is hidden
const AssessmentQuiz = ({ isOpen = true, onClose = () => {}, previewMode = true }) => {
  // Dummy assessment data based on your updated structure (no sections)
  const assessment = {
    title: 'JavaScript Basics',
    description: 'A quiz to test JavaScript fundamentals',
    tags: ['JS', 'Frontend', 'Logic'],
    duration: '30 mins',
    team: '671a03c8d2f3aabb556a8a4f',
    subteam: '671a03d7d2f3aabb556a8a51',
    attempts: 2,
    unlimited_attempts: false,
    percentage_to_pass: 70,
    display_answers_when: 'AfterPassing',
    status: 'Draft',
    created_by: '671a0432d2f3aabb556a8a55',
    questions: [
      {
        question_text: 'What is closure in JavaScript?',
        type: 'Multiple Choice',
        options: [
          'A function inside another function with access to parent scope',
          'A loop structure',
          'A type of variable',
          'A built-in object',
        ],
        correct_option: [0],
        total_points: 2,
        image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
      },
      {
        question_text: 'Which keyword declares a constant?',
        type: 'Multiple Select',
        options: ['var', 'let', 'const', 'define'],
        correct_option: [2],
        audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
    ],
  };

  // Questions live at the root now
  const questions = assessment.questions || [];

  // Parse duration like "30 mins" -> minutes
  const parseDuration = (durationStr) => {
    if (!durationStr || typeof durationStr !== 'string') return { hours: 0, minutes: 0, seconds: 0 };
    const lower = durationStr.toLowerCase();
    const num = parseInt(lower.replace(/[^0-9]/g, ''), 10);
    if (Number.isNaN(num)) return { hours: 0, minutes: 0, seconds: 0 };
    if (lower.includes('hour')) return { hours: num, minutes: 0, seconds: 0 };
    if (lower.includes('min')) return { hours: Math.floor(num / 60), minutes: num % 60, seconds: 0 };
    return { hours: 0, minutes: num, seconds: 0 };
  };

  const initialTime = parseDuration(assessment.duration);
  const [timeLeft, setTimeLeft] = useState({ hours: initialTime.hours, minutes: initialTime.minutes, seconds: initialTime.seconds });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(() => questions.map(() => [])); // array of arrays
  const [unsureFlags, setUnsureFlags] = useState(() => questions.map(() => false));
  const [submitted, setSubmitted] = useState(false);
  const [showNav, setShowNav] = useState(false);

  const currentQ = questions[currentIndex] || { options: [], correct_option: [], type: '' };
  const isMulti = (
    typeof currentQ.type === 'string' && currentQ.type.toLowerCase().includes('multiple select')
  ) || (Array.isArray(currentQ.correct_option) && currentQ.correct_option.length > 1);

  // Toggle answer by option index; single vs multi based on correct_option length
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
    if (previewMode) return; // freeze timer in preview mode
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (hours === 0 && minutes === 0 && seconds === 0) return prev;
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
    return () => clearInterval(timer);
  }, [previewMode]);

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const submit = () => {
    setSubmitted(true);
  };

  const calcScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const correct = (q.correct_option || []).slice().sort((a, b) => a - b);
      const chosen = (selectedAnswers[idx] || []).slice().sort((a, b) => a - b);
      const isCorrect = JSON.stringify(correct) === JSON.stringify(chosen);
      if (isCorrect) score += q.total_points ?? 1;
    });
    return score;
  };
  const allAnswered = selectedAnswers.every((arr) => arr.length > 0 || true); // allow skip
  const answeredCount = selectedAnswers.filter((arr) => arr.length > 0).length;
  const progressPct = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Close handling
  const handleClose = () => {
    if (previewMode || submitted) {
      onClose();
    } else {
      // Block closing unless submitted
      window.alert('You cannot close the assessment now. Only submitting will close the assessment.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="assess-modal-overlay" onClick={handleClose}>
      <div className="assess-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="assess-container">
          <div className="assess-header">
            <button className="assess-close-btn" title="Close" onClick={handleClose}>✕</button>
            <div className="assess-timer">
              <span className="assess-timer-icon">⏱</span>
              <span className="assess-timer-label">Time left:</span>
              <span className="assess-timer-digit">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="assess-timer-separator">:</span>
              <span className="assess-timer-digit">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="assess-timer-separator">:</span>
              <span className="assess-timer-digit">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
            <div className="assess-header-right">
              <button className="assess-nav-btn" onClick={() => setShowNav(true)}>📋 Questions Nav</button>
            </div>
          </div>

          {/* Progress Bar */}
          {!submitted && (
            <div className="assess-progress">
              <div className="assess-progress-track">
                <div className="assess-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="assess-progress-info">
                <span>{answeredCount}/{questions.length} answered</span>
                <span>{progressPct}%</span>
              </div>
            </div>
          )}

          <div className="assess-question-number">
            <span className="assess-q-icon">❓</span>
            Question {currentIndex + 1} of {questions.length}
          </div>

          <h2 className="assess-question-title">{currentQ.question_text}</h2>
          <p className="assess-instruction">{isMulti ? 'Select all that apply' : 'Select one'}</p>

          {/* Media (image/audio) */}
          {(currentQ.image_url || currentQ.audio_url) && (
            <div className="assess-media-container">
              {currentQ.image_url && (
                <img src={currentQ.image_url} alt="Question visual" className="assess-media-image" />
              )}
              {currentQ.audio_url && (
                <div style={{ marginTop: currentQ.image_url ? 16 : 0 }}>
                  <audio src={currentQ.audio_url} controls style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          <div className="assess-options-grid assess-options-list">
            {currentQ.options.map((opt, idx) => {
              const selected = (selectedAnswers[currentIndex] || []).includes(idx);
              const letter = String.fromCharCode(65 + idx);
              return (
                <div
                  key={idx}
                  className={`assess-option-card assess-option-row ${selected ? 'assess-option-selected' : ''}`}
                  onClick={() => toggleAnswer(idx)}
                  style={{backgroundColor: selected ? '#f0f5ff' : 'white'}}
                >
                  <div className="assess-option-letter">{letter}</div>
                  <div className="assess-option-text">{opt}</div>
                  {/* Show radio for single-select, checkbox for multi-select (right aligned) */}
                  <div className={isMulti ? `assess-option-checkbox ${selected ? 'assess-option-checkbox-checked' : ''}` : 'assess-option-radio'}>
                    {!isMulti && selected && <div className="assess-option-radio-inner"></div>}
                    {isMulti && selected && '✓'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="assess-actions">
            <div className="assess-actions-left">
              <button className="assess-btn assess-btn-secondary" disabled={currentIndex === 0} onClick={goPrev}>
                Previous
              </button>
            </div>
            <div className="assess-actions-right">
              <button
                className={`assess-btn assess-btn-review ${unsureFlags[currentIndex] ? 'is-marked' : ''}`}
                onClick={() =>
                  setUnsureFlags((prev) => {
                    const next = [...prev];
                    next[currentIndex] = !next[currentIndex];
                    return next;
                  })
                }
              >
                {unsureFlags[currentIndex] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              {currentIndex < questions.length - 1 ? (
                <button className="assess-btn assess-btn-primary" onClick={goNext}>
                  Save & Next <ChevronRight size={16}/>
                </button>
              ) : (
                previewMode ? (
                  <button className="assess-btn assess-btn-primary" onClick={handleClose}>
                    Close
                  </button>
                ) : (
                  <button className="assess-btn assess-btn-primary" onClick={submit} disabled={!allAnswered}>
                    Submit
                  </button>
                )
              )}
            </div>
          </div>

        </div>

        {submitted && !previewMode && (
          <div className="assess-content">
            <div className="assess-question-number">
              <span className="assess-q-icon">✅</span>
              Results
            </div>
            <h2 className="assess-question-title">{assessment.title} • Score</h2>
            <p className="assess-instruction">You scored {calcScore()} points.</p>
            <div className="assess-actions">
              <div className="assess-actions-left" />
              <div className="assess-actions-right">
                <button className="assess-btn assess-btn-primary" onClick={() => { setSubmitted(false); setCurrentIndex(0); }}>
                  Review
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Review Navigation Overlay */}
      {showNav && (
        <div className="assess-nav-overlay" onClick={() => setShowNav(false)}>
          <div className="assess-nav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="assess-nav-header">
              <h3>Question Review</h3>
              <button className="assess-close-btn" onClick={() => setShowNav(false)}>✕</button>
            </div>
            <div className="assess-nav-grid">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = (selectedAnswers[idx] || []).length > 0;
                const isUnsure = unsureFlags[idx];
                return (
                  <button
                    key={idx}
                    className={`assess-nav-item ${isCurrent ? 'is-current' : ''} ${isAnswered ? 'is-answered' : ''} ${isUnsure ? 'is-unsure' : ''}`}
                    onClick={() => { setCurrentIndex(idx); setShowNav(false); }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="assess-nav-legend">
              <span className="legend answered">Answered</span>
              <span className="legend unsure">Unsure</span>
              <span className="legend current">Current</span>
            </div>
          </div>
        </div>
      )}

      <div className="assess-footer">
        <span className="assess-footer-text">Have an issue with this question?</span>
        <button className="assess-report-btn">🚩 Report An Issue</button>
      </div>
        </div>
      </div>
  );
};

export default AssessmentQuiz;