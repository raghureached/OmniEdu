import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import SubmissionPopupSurveys from '../Surveys/SubmissionPopupSurveys';

const SurveyPreview = ({
    isOpen,
    onClose,
    formData,
    formElements,
    groups = [],
    feedback
}) => {
    const [sectionPreviewIndex, setSectionPreviewIndex] = useState(0);
    const [previewResponses, setPreviewResponses] = useState({});
    const [showSubmissionPopup, setShowSubmissionPopup] = useState(false);
    const [surveyStartTime, setSurveyStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showUnansweredHighlight, setShowUnansweredHighlight] = useState(false);
    const [highlightedUnansweredQuestions, setHighlightedUnansweredQuestions] = useState(new Set());
    const builtSections = React.useMemo(() => {
        if (!Array.isArray(formElements)) {
            return [{ title: formData?.title || '', description: formData?.description || '', items: [] }];
        }

        const sections = [];
        // Start with an implicit first section if the very first element isn't a section
        let current = { title: '', description: '', items: [] };

        for (const el of formElements) {
            if (el?.type === 'section') {
                // Push the previous section if it has any content
                if (current.items.length > 0 || current.title || current.description) {
                    sections.push(current);
                }
                current = { title: el.title || '', description: el.description || '', items: [] };
            } else {
                current.items.push(el);
            }
        }
        // Push last accumulated
        if (current.items.length > 0 || current.title || current.description) {
            sections.push(current);
        }
        // If there were no elements at all, still return one empty section
        if (sections.length === 0) {
            sections.push({ title: formData?.title || '', description: formData?.description || '', items: [] });
        }
        return sections;
    }, [formElements, formData?.title, formData?.description]);

    // Helper function to convert number to letter (0 -> A, 1 -> B, etc.)
    const getLetterFromIndex = (index) => {
        return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
    };
    const validateAllQuestionsAnswered = () => {
        const unansweredQuestions = [];

        // Check each section for unanswered questions
        builtSections.forEach((section, sectionIndex) => {
            section.items.forEach((el, itemIndex) => {
                if (el.type === 'question') {
                    const qKey = el.uuid || el._id || `sec-${sectionIndex}-q-${itemIndex}`;
                    const response = previewResponses[qKey];

                    // Check if question has a response based on question type
                    if (el.question_type === 'Multiple Choice') {
                        // Radio buttons store a number (0, 1, 2, etc.) or undefined
                        if (response === undefined || response === null) {
                            unansweredQuestions.push({
                                section: sectionIndex + 1,
                                question: el.question_text || `Question ${itemIndex + 1}`,
                                questionKey: qKey
                            });
                        }
                    } else if (el.question_type === 'Multi Select') {
                        // Checkboxes store an array or undefined
                        if (!response || (Array.isArray(response) && response.length === 0)) {
                            unansweredQuestions.push({
                                section: sectionIndex + 1,
                                question: el.question_text || `Question ${itemIndex + 1}`,
                                questionKey: qKey
                            });
                        }
                    } else if (el.question_type === 'Short Answer' || el.question_type === 'Paragraph') {
                        // Text inputs store a string or undefined
                        if (!response || response.trim() === '') {
                            unansweredQuestions.push({
                                section: sectionIndex + 1,
                                question: el.question_text || `Question ${itemIndex + 1}`,
                                questionKey: qKey
                            });
                        }
                    }
                    // Add more question types here as needed
                }
            });
        });

        // Note: Feedback is intentionally optional - no validation required
        // Users can leave feedback empty even if feedback.question_text exists

        return unansweredQuestions;
    };

    // Handle survey close with confirmation
    const handleClose = () => {
        if (window.confirm("Are you sure you want to close the survey? Any unsaved responses will be lost.")) {
            // User clicked OK - stop timer and show submission results
            setShowSubmissionPopup(true);
        }
        // If Cancel is clicked or dialog is dismissed, timer continues running
    };
    const handleSubmit = () => {
        const unansweredQuestions = validateAllQuestionsAnswered();

        if (unansweredQuestions.length > 0) {
            // Navigate to the first unanswered question's section
            const firstUnanswered = unansweredQuestions[0];
            const targetSectionIndex = Math.max(0, Math.min(firstUnanswered.section - 1, builtSections.length - 1));

            // Navigate to the section containing the first unanswered question
            setSectionPreviewIndex(targetSectionIndex);

            // Highlight ALL unanswered questions across ALL sections
            const allUnansweredKeys = unansweredQuestions.map(uq => uq.questionKey);
            setHighlightedUnansweredQuestions(new Set(allUnansweredKeys));

            // Enable highlighting display
            setShowUnansweredHighlight(true);

            // Show concise alert indicating navigation to unanswered question
            const totalUnanswered = unansweredQuestions.length;
            const questionWord = totalUnanswered === 1 ? 'question' : 'questions';
            alert(`Please answer all required questions before submitting.`);
            return;
        }

        // All questions answered, show submission popup
        setShowSubmissionPopup(true);
        // Clear highlighting since all questions are answered
        setShowUnansweredHighlight(false);
        setHighlightedUnansweredQuestions(new Set());
    };

    // Start timer when survey preview opens
    React.useEffect(() => {
        if (isOpen && !surveyStartTime) {
            setSurveyStartTime(Date.now());
            // Reset highlighting state when preview opens
            setShowUnansweredHighlight(false);
            setHighlightedUnansweredQuestions(new Set());
        }

        if (isOpen && surveyStartTime && !showSubmissionPopup) {
            const interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - surveyStartTime) / 1000));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isOpen, surveyStartTime, showSubmissionPopup]);

    // Update highlighting based on current responses (only when showUnansweredHighlight is true)
    React.useEffect(() => {
        if (!showUnansweredHighlight) {
            return;
        }

        const unansweredKeys = new Set();

        builtSections.forEach((section, sectionIndex) => {
            section.items.forEach((el, itemIndex) => {
                if (el.type === 'question') {
                    const qKey = el.uuid || el._id || `sec-${sectionIndex}-q-${itemIndex}`;
                    const response = previewResponses[qKey];

                    // Check if question is unanswered based on type
                    if (el.question_type === 'Multiple Choice') {
                        if (response === undefined || response === null) {
                            unansweredKeys.add(qKey);
                        }
                    } else if (el.question_type === 'Multi Select') {
                        if (!response || (Array.isArray(response) && response.length === 0)) {
                            unansweredKeys.add(qKey);
                        }
                    } else if (el.question_type === 'Short Answer' || el.question_type === 'Paragraph') {
                        if (!response || response.trim() === '') {
                            unansweredKeys.add(qKey);
                        }
                    }
                }
            });
        });

        setHighlightedUnansweredQuestions(unansweredKeys);
    }, [previewResponses, builtSections, showUnansweredHighlight]);
// Check if all questions in a given section are answered
const isSectionComplete = (sectionIndex) => {
    const section = builtSections[sectionIndex];
    if (!section) return true;

    return section.items.every((el, itemIndex) => {
        if (el.type !== 'question') return true;
        const qKey = el.uuid || el._id || `sec-${sectionIndex}-q-${itemIndex}`;
        const response = previewResponses[qKey];

        if (el.question_type === 'Multiple Choice') {
            return response !== undefined && response !== null;
        } else if (el.question_type === 'Multi Select') {
            return Array.isArray(response) && response.length > 0;
        } else if (el.question_type === 'Short Answer' || el.question_type === 'Paragraph') {
            return !!(response && response.trim() !== '');
        }
        return true;
    });
};

// Check if all questions in all sections are answered
const isSurveyComplete = () => {
    return builtSections.every((_, idx) => isSectionComplete(idx));
};

    if (!isOpen) return null;

    return (
        <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) { handleClose(); } }}>
            <div className="survey-assess-apreview-modal">
                <div className="survey-assess-qpreview-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Eye size={16} />
                        <span className="survey-assess-qpreview-title">Survey Preview</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="Close preview"
                        className="survey-assess-qpreview-close"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="survey-assess-qpreview-body">
                    {/* Header card like Google Forms */}
                    <div className="survey-assess-qpreview-section">
                        <div className="survey-gforms-card">
                            <div className="survey-gforms-card-topbar" />
                            <div className="survey-gforms-card-body">
                                <div className="survey-gforms-card-title">{formData.title || 'Untitled form'}</div>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                                    * All questions are mandatory
                                </div>
                                {/* {formData.description && sectionPreviewIndex === 0 && (
                                    <div className="survey-gforms-card-description" dangerouslySetInnerHTML={{ __html: formData.description }} />
                                )} */}
                            </div>
                        </div>
                    </div>

                    {(() => {
                        const s = builtSections[Math.min(sectionPreviewIndex, builtSections.length - 1)] || { title: '', description: '', items: [] };
                        return (
                            <>
                                {/* Section header card: always show section number; include optional title/description */}
                                <div className="survey-assess-qpreview-section">
                                    <div className="survey-gforms-card">
                                        <div className="survey-gforms-card-body">
                                            <div className="label" style={{ fontWeight: 700, fontSize: '17px', marginBottom: (s.title || s.description) ? 6 : 0 }}>
                                                Section {sectionPreviewIndex + 1}
                                            </div>
                                            {s.title && (
                                                <div className="label" style={{ fontWeight: 700, marginTop: 6, marginBottom: 6 }}>{s.title}</div>
                                            )}
                                            {s.description && (
                                                <div style={{ color: '#334155' }}
                                                    dangerouslySetInnerHTML={{ __html: s.description }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Items within the section */}
                                {s.items.map((el, idx) => (
                                    <div key={`sec-${sectionPreviewIndex}-item-${idx}`} className="survey-assess-qpreview-section">
                                        {el.type === 'info' && (
                                            <div className="survey-assess-qpreview-section">
                                                <div className="survey-gforms-card">
                                                    <div className="survey-gforms-card-body">
                                                        <div style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>
                                                            {(el.description || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {el.type === 'question' && (() => {
                                            // Calculate global question number across all sections
                                            let questionNumber = 0;
                                            for (let i = 0; i < sectionPreviewIndex; i++) {
                                                questionNumber += builtSections[i].items.filter(item => item.type === 'question').length;
                                            }
                                            questionNumber += idx + 1; // Add current question position in this section

                                            // Check if this question is highlighted as unanswered
                                            const qKey = el.uuid || el._id || `sec-${sectionPreviewIndex}-q-${idx}`;
                                            const isUnanswered = showUnansweredHighlight && highlightedUnansweredQuestions.has(qKey);

                                            return (
                                            <div className={`survey-gforms-card ${isUnanswered ? 'survey-unanswered-question' : ''}`}>
                                                <div className="survey-gforms-card-body">
                                                    {/* Instructions (HTML) */}
                                                    {/* { (
                                                        <div
                                                            className="survey-assess-qpreview-instructions"
                                                            style={{ color: '#334155', marginBottom: 6 }}
                                                            dangerouslySetInnerHTML={{ __html: "select one" }}
                                                        />
                                                    )} */}
                                                     {(el.question_type === 'Multiple Choice' || el.question_type === 'Multi Select') && (
                                                        <p className="survey-assess-qpreview-instruction" style={{ color: '#64748b', fontSize: '0.9rem',marginBottom: 8}}>
                                                            {el.question_type === 'Multi Select' ? 'Select all that apply' : 'Select one'}
                                                        </p>
                                                    )}
                                                    <div className={`survey-gforms-question-title ${isUnanswered ? 'survey-unanswered-title' : ''}`}>
                                                        <span style={{  marginRight: '8px', color: 'black' }}>
                                                            Q{questionNumber}.
                                                        </span>
                                                        {el.question_text || '—'}
                                                        <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                                                        {isUnanswered && (
                                                            <span style={{
                                                                color: '#ef4444',
                                                                fontSize: '0.8rem',
                                                                marginLeft: '8px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                (Unanswered)
                                                            </span>
                                                        )}
                                                    </div>
                                                   
                                                    {(el.question_type === 'Multiple Choice' || el.question_type === 'Multi Select') && Array.isArray(el.options) && el.options.length > 0 && (
                                                        <div className="survey-assess-qpreview-options">
                                                            {el.options.map((opt, oidx) => {
                                                                // Use a unique key per section+question to avoid collisions when ids are missing (e.g., duplicated unsaved questions)
                                                                const qKey = el.uuid || el._id || `sec-${sectionPreviewIndex}-q-${idx}`;
                                                                const isMulti = el.question_type === 'Multi Select';
                                                                const selected = previewResponses[qKey];
                                                                const checked = isMulti
                                                                    ? Array.isArray(selected) && selected.includes(oidx)
                                                                    : selected === oidx;
                                                                const onChange = (e) => {
                                                                    setPreviewResponses(prev => {
                                                                        if (isMulti) {
                                                                            const arr = Array.isArray(prev[qKey]) ? [...prev[qKey]] : [];
                                                                            const i = arr.indexOf(oidx);
                                                                            if (e.target.checked && i === -1) arr.push(oidx);
                                                                            if (!e.target.checked && i !== -1) arr.splice(i, 1);
                                                                            return { ...prev, [qKey]: arr };
                                                                        } else {
                                                                            return { ...prev, [qKey]: oidx };
                                                                        }
                                                                    });
                                                                };
                                                                return (
                                                                    <label key={`sec-${sectionPreviewIndex}-q-${idx}-opt-${oidx}`} className="survey-assess-qpreview-option">
                                                                        <input
                                                                            type={isMulti ? 'checkbox' : 'radio'}
                                                                            name={`sec-${sectionPreviewIndex}-q-${idx}`}
                                                                            checked={!!checked}
                                                                            onChange={onChange}
                                                                        />
                                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span style={{ fontWeight: 'bold', color: '#374151', minWidth: '20px' }}>
                                                                                {getLetterFromIndex(oidx)}.
                                                                            </span>
                                                                            <span className="opt-text">{opt || `Option ${oidx + 1}`}</span>
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    {(el.question_type === 'Short Answer' || el.question_type === 'Paragraph') && (
                                                        <div className="survey-assess-qpreview-text-input">
                                                            <textarea
                                                                className="survey-assess-form-textarea"
                                                                placeholder={el.question_type === 'Short Answer' ? 'Short answer...' : 'Long answer...'}
                                                                value={previewResponses[el.uuid || el._id || `sec-${sectionPreviewIndex}-q-${idx}`] || ''}
                                                                onChange={(e) => {
                                                                    const qKey = el.uuid || el._id || `sec-${sectionPreviewIndex}-q-${idx}`;
                                                                    setPreviewResponses(prev => ({ ...prev, [qKey]: e.target.value }));

                                                                    // Handle re-highlighting when question becomes unanswered again (only if highlighting is active)
                                                                    if (showUnansweredHighlight && !e.target.value.trim()) {
                                                                        setHighlightedUnansweredQuestions(current => new Set(current).add(qKey));
                                                                    }
                                                                }}
                                                                rows={el.question_type === 'Paragraph' ? 4 : 2}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            );
                                        })()}
                                    </div>
                                ))}

                                {/* Feedback block preview: input + info text box (only on last section) */}
                                { (sectionPreviewIndex === Math.max(0, builtSections.length - 1)) && (
                                    <div className="survey-assess-qpreview-section">
                                        <div className="survey-gforms-card">
                                            <div className="survey-gforms-card-body">
                                                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                                                    Additional Feedback / Comments (Optional)
                                                    { <span style={{ color: '#ef4444', marginLeft: '4px' }}></span>}
                                                </div>
                                                {(
                                                    <div className="survey-assess-form-group">
                                                        <textarea
                                                            className="survey-assess-form-textarea"
                                                            placeholder="Write your feedback here"
                                                            onChange={(e) => setPreviewResponses(prev => ({ ...prev, __feedbackText: e.target.value }))}
                                                        />
                                                    </div>
                                                )}
                                               
                                            </div>
                                            
                                        </div>
                                       
                                    </div>
                                )}

                                {/* Last Info element displayed as a card (preserve rich text) on the last section */}
                                {sectionPreviewIndex === Math.max(0, builtSections.length - 1) && (() => {
                                  
                                    return (
                                        <div className="survey-assess-qpreview-section">
                                            <div className="survey-gforms-card">
                                                <div className="survey-gforms-card-body">
                                                    {/* Optional title if present */}
                                                    
                                                        <div className="label" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>Thank you for participating. To finish survey, click on Submit button.</div>
                                                    
                                                   
                                            </div>
                                        </div>
                                        </div>
                                    );
                                })()}

                                {/* Navigation: Back (left), Counter (center), Next/Submit (right) */}
                                <div className="survey-assess-qpreview-section">
                                    <div className="survey-gforms-nav-3">
                                        <div className="survey-nav-left">
                                            <button
                                                type="button"
                                                className="survey-assess-btn-primary"
                                                disabled={sectionPreviewIndex <= 0}
                                                onClick={() => setSectionPreviewIndex(Math.max(0, sectionPreviewIndex - 1))}
                                            >
                                                Previous
                                            </button>
                                        </div>
                                        <div className="survey-nav-center" style={{ color: '#64748b', fontSize: '0.9rem', visibility: builtSections.length > 1 ? 'visible' : 'hidden' }}>
                                            Section {sectionPreviewIndex + 1} of {builtSections.length}
                                        </div>
                                        <div className="survey-nav-right" style={{ display: 'flex', gap: 8 }}>
                                        {sectionPreviewIndex < builtSections.length - 1 ? (
    <button
        type="button"
        className="survey-assess-btn-primary"
        disabled={!isSectionComplete(sectionPreviewIndex)}
        style={{
            backgroundColor: !isSectionComplete(sectionPreviewIndex) ? '#cbd5e1' : '#3b82f6',
            color: !isSectionComplete(sectionPreviewIndex) ? '#64748b' : 'white',
            cursor: !isSectionComplete(sectionPreviewIndex) ? 'not-allowed' : 'pointer',
            opacity: !isSectionComplete(sectionPreviewIndex) ? 0.8 : 1,
        }}
        onClick={() => setSectionPreviewIndex(Math.min(builtSections.length - 1, sectionPreviewIndex + 1))}
    >
        Next
    </button>
) : (
    <button
        type="button"
        className="survey-assess-btn-primary"
        disabled={!isSurveyComplete()}
        style={{
            backgroundColor: !isSurveyComplete() ? '#cbd5e1' : '#3b82f6',
            color: !isSurveyComplete() ? '#64748b' : 'white',
            cursor: !isSurveyComplete() ? 'not-allowed' : 'pointer',
            opacity: !isSurveyComplete() ? 0.8 : 1,
        }}
        onClick={handleSubmit}
    >
        Submit
    </button>
)}


                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Submission Popup for Survey */}
            <SubmissionPopupSurveys
                isOpen={showSubmissionPopup}
                onClose={() => {
                    setShowSubmissionPopup(false);
                    onClose(); // Close the entire modal when submission popup closes
                }}
                assessmentData={{
                    questions: formElements.filter(el => el.type === 'question'),
                    title: formData.title,
                    feedback: feedback
                }}
                answers={Object.entries(previewResponses)
                    .filter(([key]) => key !== '__feedbackText')
                    .map(([key, value]) => value)
                }
                timeSpent={elapsedTime}
            />
        </div>
    );
};

export default SurveyPreview;
