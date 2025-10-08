import React, { useState } from 'react';
import './Assessment.css';
import { MdApps, MdQuestionAnswer, MdQuiz, MdTimer } from 'react-icons/md';
import { ChevronRight, Submit } from 'lucide-react';

// Props:
// - isOpen: controls modal visibility (default true)
// - onClose: callback when modal should close
// - previewMode: when true, timer freezes and submission/result screen is hidden
const AssessmentQuiz = ({ isOpen = true, onClose = () => { }, previewMode = true }) => {
  // Dummy assessment data based on your updated structure (no sections)
  const assessment = {
    title: 'JavaScript Fundamentals & Concepts',
    description: 'A comprehensive quiz designed to test your understanding of JavaScript fundamentals, ES6 concepts, and core programming logic.',
    tags: ['JavaScript', 'Frontend', 'Web', 'ES6', 'Logic'],
    duration: '45 mins',
    team: '671a03c8d2f3aabb556a8a4f',
    subteam: '671a03d7d2f3aabb556a8a51',
    attempts: 3,
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
      {
        question_text: 'Which of the following are JavaScript data types?',
        type: 'Multiple Select',
        options: ['String', 'Boolean', 'Character', 'Undefined'],
        correct_option: [0, 1, 3],
      },
      {
        question_text: 'What does `NaN` stand for?',
        type: 'Multiple Choice',
        options: ['Not a Number', 'Negative and Null', 'Number and Name', 'Null as Number'],
        correct_option: [0],
      },
      {
        question_text: 'Which of the following is not a JavaScript framework?',
        type: 'Multiple Choice',
        options: ['React', 'Angular', 'Vue', 'Django'],
        correct_option: [3],
      },
      {
        question_text: 'What is the output of `typeof null`?',
        type: 'Multiple Choice',
        options: ['null', 'undefined', 'object', 'boolean'],
        correct_option: [2],
      },
      {
        question_text: 'Which method converts JSON data to a JavaScript object?',
        type: 'Multiple Choice',
        options: ['JSON.parse()', 'JSON.stringify()', 'JSON.convert()', 'parse.JSON()'],
        correct_option: [0],
      },
      {
        question_text: 'Arrow functions in JavaScript automatically bind the `this` keyword.',
        type: 'True/False',
        options: ['True', 'False'],
        correct_option: [0],
      },
      {
        question_text: 'Which symbol is used for comments in JavaScript?',
        type: 'Multiple Select',
        options: ['// for single-line', '/* */ for multi-line', '# for inline', '-- for block'],
        correct_option: [0, 1],
      },
      {
        question_text: 'What will `2 + "2"` evaluate to?',
        type: 'Multiple Choice',
        options: ['4', '22', 'Error', 'NaN'],
        correct_option: [1],
      },
      {
        question_text: 'Which of the following creates a promise?',
        type: 'Multiple Choice',
        options: [
          'let p = new Promise((resolve, reject) => {})',
          'let p = Promise.create()',
          'let p = async() => {}',
          'let p = await Promise()',
        ],
        correct_option: [0],
      },
      {
        question_text: 'Which array method removes the last element from an array?',
        type: 'Multiple Choice',
        options: ['pop()', 'push()', 'shift()', 'unshift()'],
        correct_option: [0],
      },
      {
        question_text: 'Which of the following statements are true about `let`?',
        type: 'Multiple Select',
        options: [
          'It has block scope',
          'It can be redeclared in the same scope',
          'It can be reassigned',
          'It is hoisted but not initialized',
        ],
        correct_option: [0, 2, 3],
      },
      {
        question_text: 'What is event bubbling in JavaScript?',
        type: 'Multiple Choice',
        options: [
          'Events propagating from child to parent elements',
          'Events propagating from parent to child elements',
          'Events that stop propagation',
          'None of the above',
        ],
        correct_option: [0],
      },
      {
        question_text: 'What will `console.log([] == false)` print?',
        type: 'Multiple Choice',
        options: ['true', 'false', 'undefined', 'TypeError'],
        correct_option: [0],
      },
      {
        question_text: 'Which operator is used to spread elements in an array?',
        type: 'Multiple Choice',
        options: ['...', '==', '&&', '=>'],
        correct_option: [0],
        image_url: 'https://images.unsplash.com/photo-1590608897129-79da98d159d4?q=80&w=1200&auto=format&fit=crop',
      },
      {
        question_text: 'What will happen if you call a function before it is declared using `function` keyword?',
        type: 'Multiple Choice',
        options: ['Error occurs', 'Works fine due to hoisting', 'Function ignored', 'Undefined returned'],
        correct_option: [1],
      },
      {
        question_text: 'Which statement about async/await is true?',
        type: 'Multiple Select',
        options: [
          'await can only be used inside async functions',
          'async function always returns a Promise',
          'await blocks execution of code until the Promise is resolved',
          'await can be used in normal functions',
        ],
        correct_option: [0, 1, 2],
      },
      {
        question_text: 'What is the purpose of the "use strict" directive?',
        type: 'Multiple Choice',
        options: [
          'To write code in strict mode, avoiding silent errors',
          'To disable ES6 features',
          'To increase runtime speed',
          'To enable TypeScript-like syntax',
        ],
        correct_option: [0],
      },
      {
        question_text: 'Which of the following array methods return a new array?',
        type: 'Multiple Select',
        options: ['map()', 'filter()', 'forEach()', 'reduce()'],
        correct_option: [0, 1, 3],
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
  const [navFilter, setNavFilter] = useState('all'); // all | answered | not_answered | unsure

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
    if(window.confirm("Closing Assessment will result in submission of assessment. Are you sure you want to close?")) {
      onClose();
    }else{
      return;
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
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="assess-timer-icon"><MdTimer  size={16} /></span>
                <span className="assess-timer-label" style={{ fontWeight: "800" }}>Time left:</span>
              </span>
              <span className="assess-timer-digit">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="assess-timer-separator">:</span>
              <span className="assess-timer-digit">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="assess-timer-separator">:</span>
              <span className="assess-timer-digit">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
            <div className="assess-header-right">
              <button className="assess-nav-btn" style={{fontWeight:"700"}} onClick={() => setShowNav(true)}><MdApps size={16} /> Questions Nav</button>
            </div>
          </div>

          <div className="assess-question-number" style={{marginBottom:"20px"}}>
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
                  style={{ backgroundColor: selected ? '#f0f5ff' : 'white' }}
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

          <div className="assess-actions-preview">
            <div className="assess-actions-preview-left">
              <button className="assess-btn assess-btn-secondary" disabled={currentIndex === 0} onClick={goPrev}>
                Previous
              </button>
            </div>
            <div className="assess-actions-preview-right">
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
                  Save & Next <ChevronRight size={16} />
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
            <div className="assess-actions-preview">
              <div className="assess-actions-preview-left" />
              <div className="assess-actions-preview-right">
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
                <h3>Quiz Navigation • {navCounts.total} Questions</h3>
                <button className="assess-close-btn" onClick={() => setShowNav(false)}>✕</button>
              </div>
              <div className="assess-nav-body">
                <div className="assess-nav-sidebar">
                  <div className="assess-nav-filter-title">Show question</div>
                  <button
                    className={`assess-nav-filter ${navFilter === 'all' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('all')}
                  >
                    <span className="filter-label">All Question</span>
                    <span className="filter-badge">{navCounts.total}</span>
                  </button>
                  <button
                    className={`assess-nav-filter ${navFilter === 'answered' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('answered')}
                  >
                    <span className="filter-label">Answered</span>
                    <span className="filter-badge">{navCounts.answered}</span>
                  </button>
                  <button
                    className={`assess-nav-filter ${navFilter === 'not_answered' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('not_answered')}
                  >
                    <span className="filter-label">Not Answered</span>
                    <span className="filter-badge">{navCounts.notAnswered}</span>
                  </button>
                  <button
                    className={`assess-nav-filter ${navFilter === 'unsure' ? 'is-active' : ''}`}
                    onClick={() => setNavFilter('unsure')}
                  >
                    <span className="filter-label">Not Sure</span>
                    <span className="filter-badge">{navCounts.unsure}</span>
                  </button>
                  <div className="assess-nav-hint">Choose tab to filter questions.</div>
                </div>
                <div className="assess-nav-main">
                  <div className="assess-nav-list-title">List Number Question</div>
                  <div className="assess-nav-circles">
                    {filteredIndices.map((idx) => {
                      const isCurrent = idx === currentIndex;
                      const isAnswered = (selectedAnswers[idx] || []).length > 0;
                      const isUnsure = !!unsureFlags[idx];
                      return (
                        <button
                          key={idx}
                          className={`assess-circle ${isCurrent ? 'is-current' : ''} ${isAnswered ? 'is-answered' : ''} ${isUnsure ? 'is-unsure' : ''}`}
                          onClick={() => { setCurrentIndex(idx); setShowNav(false); }}
                          title={`Question ${idx + 1}`}
                        >
                          <span>{idx + 1}</span>
                          {isUnsure && <span className="assess-circle-dot" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
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