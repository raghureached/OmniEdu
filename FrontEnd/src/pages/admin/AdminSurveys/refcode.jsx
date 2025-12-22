import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Plus, X, Upload, Copy, Eye, Info } from 'lucide-react';
import api from '../../../services/api';
import './QuestionsForm-survey.css';
import '../GlobalAssessments/QuestionsForm.css';
import RichText from '../Surveys/RichTextSurvey.jsx';
import CustomSelect from '../../../components/dropdown/DropDown';
// Minimal URL resolver for previews (can be enhanced to handle relative URLs)
const resolveUrl = (u) => u;

const QuestionsForm = ({
    currentAssessment,
    formData,
    setFormData,
    formElements,
    showForm,
    setShowForm,
    uploadedFiles,
    handleSaveAssessment,
    handleEditAssessment,
    handleUpdateAssessment,
    handleDeleteAssessment,
    updateFormElementField,
    addFormElement,
    removeFormElement,
    addOption,
    updateOption,
    removeOption,
    duplicateFormElement,
    groups = [],
    feedback,
    setFeedback,
}) => {
    // Local UI state for question preview modal; holds the qIndex or null
    const [questionPreviewIndex, setQuestionPreviewIndex] = useState(null);
    const [instructionsOpen, setInstructionsOpen] = useState({});
    // Whole-assessment preview modal
    const [assessmentPreviewOpen, setAssessmentPreviewOpen] = useState(false);
    // Feedback section toggle (UI only)
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackInfoOpen, setFeedbackInfoOpen] = useState(false);
    // Section-based preview index (for section pagination in preview)
    const [sectionPreviewIndex, setSectionPreviewIndex] = useState(0);
    // Local responses for preview interaction (radio/checkbox selections)
    const [previewResponses, setPreviewResponses] = useState({});
    // Wizard step (1: Basic, 2: Elements, 3: Settings/Review)
    const [step, setStep] = useState(1);
    // Input state for tag entry
    const [tagInput, setTagInput] = useState('');
    // Local validation message for pass percentage
    const [passError, setPassError] = useState('');

    // Derive sub-teams for the selected team
    const selectedTeam = groups.find(t => String(t._id) === String(formData.team));
    const subTeams = selectedTeam?.subTeams || [];

   
    // Auto-open feedback panel in edit mode when the survey already has feedback
    useEffect(() => {
        const hasFeedback = [
            feedback?.instructionTop,
            feedback?.question_text,
            feedback?.instructionBottom,
        ].some(v => (v || '').trim() !== '');
        if (hasFeedback) {
            setFeedbackOpen(true);
        }
    }, [feedback?.instructionTop, feedback?.question_text, feedback?.instructionBottom]);
    
    // Build sections from formElements similar to Google Forms: a section header splits pages
    const builtSections = useMemo(() => {
        const sections = [];
        // Start with an implicit first section if the very first element isn't a section
        let current = { title: '', description: '', items: [] };

        for (const el of formElements || []) {
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

    // Reset section pagination when opening preview
    useEffect(() => {
        if (assessmentPreviewOpen) setSectionPreviewIndex(0);
    }, [assessmentPreviewOpen]);
    // Ensure Step 2 starts with Section first, then one Question (run once per entry)
    const initializedStep2 = useRef(false);
    useEffect(() => {
        if (step !== 2 || !Array.isArray(formElements)) return;
        if (initializedStep2.current) return;

        const hasSection = formElements.some(el => el.type === 'section');
        const hasQuestion = formElements.some(el => el.type === 'question');

        // If empty, start with a Section only (no default Question)
        if (formElements.length === 0) {
            addFormElement('section');
            initializedStep2.current = true;
            return;
        }

        // Add missing building blocks at most once
        let added = false;
        if (!hasSection) {
            // If there is no section, remove any existing questions so only a section shows by default
            const qIdxs = (formElements || []).map((el, i) => el?.type === 'question' ? i : -1).filter(i => i >= 0).reverse();
            qIdxs.forEach(i => removeFormElement(i));
            addFormElement('section');
            added = true;
        }
        // Do not auto-add a default question; user will add questions explicitly

        initializedStep2.current = true;
        // Note: if you later implement reordering, you can place section/question at desired positions.
    }, [step]);
    // Helper function to convert number to letter (0 -> A, 1 -> B, etc.)
    const getLetterFromIndex = (index) => {
        return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
    };

    

    const validatePass = () => {
        const v = formData.percentage_to_pass;
        const isValid = Number.isInteger(v) && v >= 0 && v <= 100;
        setPassError(isValid ? '' : 'Pass percentage must be an integer between 0 and 100');
        return isValid;
    };

    // Close modals on ESC key
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                if (assessmentPreviewOpen) {
                    setAssessmentPreviewOpen(false);
                } else if (questionPreviewIndex !== null) {
                    setQuestionPreviewIndex(null);
                }
            }
        };
        const anyOpen = assessmentPreviewOpen || questionPreviewIndex !== null;
        if (anyOpen) {
            document.addEventListener('keydown', handleKey);
            return () => document.removeEventListener('keydown', handleKey);
        }
    }, [assessmentPreviewOpen, questionPreviewIndex]);

    return (
        <>
        <div className="assess-modal-overlay">
            <div className="assess-modal-content">
                {/* Modal Header */}
                <div className="assess-modal-header">
                    <div className="assess-modal-header-content">
                        <div className="assess-modal-icon">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2>{currentAssessment ? "Edit Survey" : "Create New Survey"}</h2>
                            <p className="assess-modal-subtitle">
                                {currentAssessment
                                    ? "Update survey details and questions"
                                    : "Build a comprehensive survey"}
                            </p>
                        </div>
                    </div>
                    <button className="assess-close-btn" onClick={() => setShowForm(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Form + Preview Panel */}
                <div className="assess-modal-form-container">
                    {/* Left Side - Form */}
                    <div className="assess-modal-form">
                        {/* Basic Information */}
                        {step === 1 &&
                            <div className="assess-form-section">
                                <h3 className="assess-section-title">Basic Information</h3>

                                <div className="assess-form-grid">
                                    <div className="assess-form-group">
                                        <label className="assess-form-label">
                                            Survey Title<span className="assess-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="assess-form-input"
                                            placeholder="Enter assessment title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="assess-form-group">
                                        <label className="assess-form-label">Tags</label>
                                        <div className="assess-tag-picker">
                                            <div className="assess-tag-controls">
                                                <input
                                                    type="text"
                                                    className="assess-form-input"
                                                    placeholder="Type a tag and press Enter"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const t = tagInput.trim();
                                                            if (!t) return;
                                                            const current = Array.isArray(formData.tags) ? formData.tags : [];
                                                            if (!current.includes(t)) {
                                                                setFormData({ ...formData, tags: [...current, t] });
                                                            }
                                                            setTagInput('');
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {(formData.tags && formData.tags.length > 0) && (
                                                <div className="assess-chips">
                                                    {formData.tags.map((t, idx) => (
                                                        <span key={`${t}-${idx}`} className="assess-chip">
                                                            {t}
                                                            <button
                                                                type="button"
                                                                className="assess-chip-remove"
                                                                aria-label={`Remove ${t}`}
                                                                onClick={() => {
                                                                    const next = (formData.tags || []).filter(x => x !== t);
                                                                    setFormData({ ...formData, tags: next });
                                                                }}
                                                                style={{ color: "#1e40af", fontSize: "17px" }}
                                                            >
                                                                {/* <X size={10} /> x */}x
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>

                                <div className="assess-form-group">
                                    <label className="assess-form-label">Description</label>
                                    <textarea
                                        className="assess-form-textarea"
                                        placeholder="Provide a detailed description of this survey"
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                               
                            </div>}

                        {/* Form Elements Section */}
                        {step === 2 && <div className="assess-form-section">
                            <div className="assess-form-elements-header">
                                {(() => {
                                    const sectionCount = (formElements || []).filter(el => el.type === 'section').length;
                                    const questionCount = (formElements || []).filter(el => el.type === 'question').length;
                                    return (
                                        <h3 className="assess-section-title">
                                            Sections ({sectionCount}) · Questions ({questionCount})
                                        </h3>
                                    );
                                })()}
                            </div>

                            <div className="assess-form-elements-container assess-questions-container">
                                {formElements.map((element, elementIndex) => (
                                    <div key={elementIndex} className={`assess-form-element-card ${element.type}`}>
                                        {/* Info Box Element */}
                                        {element.type === 'info' && (
                                            <div className="assess-info-element">
                                                <div className="assess-element-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span className="assess-element-number">Info Box {elementIndex + 1}</span>
                                                    {formElements.length > 2 && (
                                                        <button
                                                            type="button"
                                                            className="assess-remove-element"
                                                            onClick={() => removeFormElement(elementIndex)}
                                                            title="Remove Info Box"
                                                            style={{ marginLeft: 8 }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                        <button
                                                            type="button"
                                                            className="assess-duplicate-element"
                                                            title="Duplicate Info Box"
                                                            onClick={() => duplicateFormElement(elementIndex)}
                                                        >
                                                            <Copy size={16} /> 
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="assess-info-content">
                                                    <div className="assess-form-group">
                                                        <label className="assess-form-label">Description</label>
                                                        <RichText
                                                            value={element.description || ''}
                                                            onChange={(html) => updateFormElementField(elementIndex, 'description', html)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {element.type === 'question' && (
                                            <div className="assess-question-card">
                                                <div className="assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span className="assess-question-number">{`Question ${formElements.slice(0, elementIndex + 1).filter(el => el.type === 'question').length}`}</span>
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                        <button
                                                            type="button"
                                                            className="assess-duplicate-element"
                                                            title="Duplicate Question"
                                                            onClick={() => duplicateFormElement(elementIndex)}
                                                        >
                                                            <Copy size={16} /> Duplicate
                                                        </button>
                                                        {formElements.length > 2 && (
                                                            <button
                                                                type="button"
                                                                className="assess-remove-question"
                                                                onClick={() => removeFormElement(elementIndex)}
                                                                title="Remove Question"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="assess-question-content">
                                                    {/* Instructions (optional) */}
                                                    <div className="assess-form-group">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <label className="assess-form-label" style={{ marginBottom: 0 }}>Instructions (optional)</label>
                                                            <button
                                                                type="button"
                                                                className="assess-btn-secondary"
                                                                style={{ padding: '6px 10px', fontSize: 12 }}
                                                                onClick={() => setInstructionsOpen(prev => ({ ...prev, [elementIndex]: !prev[elementIndex] }))}
                                                            >
                                                                {instructionsOpen[elementIndex] || !!(element.instruction_header || element.instruction_text) ? 'Hide' : 'Add'} Instructions
                                                            </button>
                                                        </div>
                                                            {(instructionsOpen[elementIndex] || !!(element.instruction_text)) && (
                                                            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                                                                <div className="assess-form-group" style={{ marginBottom: 0 }}>
                                                                    {/* <label className="assess-form-label">Instruction Text</label> */}
                                                                    <RichText
                                                                        value={element.instruction_text || ''}
                                                                        onChange={(html) => {
                                                                            updateFormElementField(elementIndex, 'instruction_text', html);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Question Type */}
                                                    <div className="assess-form-group">
                                                        <label className="assess-form-label" style={{marginTop:"10px"}}>Question Type</label>
                                                        <CustomSelect
                                                            className="assess-form-select"
                                                            value={element.question_type || ''}
                                                            options={[
                                                                { value: "", label: "Select Type" },
                                                                { value: "Multiple Choice", label: "Multiple Choice" },
                                                                { value: "Multi Select", label: "Multi Select" }
                                                            ]}
                                                            onChange={value => updateFormElementField(elementIndex, 'question_type', value)}
                                                            required
                                                            placeholder="Select Type"
                                                            searchable={false}
                                                        />
                                                    </div>

                                                    

                                                    {/* Question Text */}
                                                    <div className="assess-form-group">
                                                        <label className="assess-form-label">
                                                            Question Text<span className="form-required">*</span>
                                                        </label>
                                                        <textarea
                                                            className="assess-form-textarea"
                                                            placeholder="Enter your question here..."
                                                            rows={2}
                                                            value={element.question_text || ''}
                                                            onChange={e => updateFormElementField(elementIndex, 'question_text', e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Answer Options */}
                                                    <div className="assess-form-group">
                                                        <label className="assess-form-label">Answer Options</label>
                                                        {(element.question_type === 'Multiple Choice' || element.question_type === 'Multi Select') && (
                                                            <div className="assess-options-container">
                                                                {(element.options || []).map((opt, optIndex) => (
                                                                    <div key={optIndex} className="assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
                                                                        <div className="assess-option-index">{getLetterFromIndex(optIndex)}</div>
                                                                        <input
                                                                            type="text"
                                                                            className="assess-form-input"
                                                                            placeholder={`Option ${getLetterFromIndex(optIndex)}`}
                                                                            value={opt}
                                                                            onChange={e => updateOption(elementIndex, optIndex, e.target.value)}
                                                                            required
                                                                        />
                                                                        {(element.options || []).length > 2 && (
                                                                            <button
                                                                                type="button"
                                                                                className="assess-remove-option"
                                                                                onClick={() => removeOption(elementIndex, optIndex)}
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    className="assess-add-option"
                                                                    onClick={() => addOption(elementIndex)}
                                                                >
                                                                    <Plus size={14} />
                                                                    Add Option
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Footer actions should be always visible, independent of question_type */}
                                                    <div className="assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                                        {(() => {
                                                            const textOk = !!(element.question_text || '').trim();
                                                            const optsOk = Array.isArray(element.options) && element.options.filter(o => (o || '').trim()).length >= 2;
                                                            const qReady = textOk && optsOk;
                                                            const hint = qReady ? undefined : 'Enter question text and at least two options to enable';
                                                            return (
                                                                <>
                                                                    <button type="button" className="assess-btn-secondary" onClick={() => addFormElement('question', {}, elementIndex + 1)} disabled={!qReady} title={hint}>
                                                                        <Plus size={14} /> Add Question
                                                                    </button>
                                                                    <button type="button" className="assess-btn-secondary" onClick={() => addFormElement('section')} disabled={!qReady} title={hint}>
                                                                        <Plus size={14} /> Add Section
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="assess-btn-primary assess-save-inline"
                                                                        title={qReady ? 'Save and Preview this question' : hint}
                                                                        onClick={() => setQuestionPreviewIndex(elementIndex)}
                                                                        disabled={!qReady}
                                                                    >
                                                                        <Eye size={16} /> Preview Question
                                                                    </button>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Section Element */}
                                        {element.type === 'section' && (
                                            <div className="assess-question-card">
                                                <div className="assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span className="assess-question-number">{`Section ${formElements.slice(0, elementIndex + 1).filter(el => el.type === 'section').length}`}</span>
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                        {formElements.length > 2 && (
                                                            <button
                                                                type="button"
                                                                className="assess-remove-question"
                                                                onClick={() => removeFormElement(elementIndex)}
                                                                title="Remove Section"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="assess-section-content">
                                                    <div className="assess-form-group">
                                                        <label className="assess-form-label">Section Description</label>
                                                        <RichText
                                                            value={element.description || ''}
                                                            onChange={(html) => updateFormElementField(elementIndex, 'description', html)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    {(() => {
                                                        const raw = String(element.description || '');
                                                        const plain = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                                                        const ready = plain.length > 0;
                                                        const hint = ready ? undefined : 'Enter section description to enable';
                                                        return (
                                                            <button type="button" className="assess-btn-secondary" onClick={() => addFormElement('question', {}, elementIndex + 1)} disabled={!ready} title={hint}>
                                                                <Plus size={14} /> Add Question
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {!feedbackOpen && (
                                    <div style={{ marginTop: '20px', display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
                                        <button type="button" className="assess-btn-secondary" onClick={() => setFeedbackOpen(true)}>
                                            Feedback Text
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* When feedback panel is open, allow adding questions above feedback (Create & Edit) */}
                            {feedbackOpen && (
                              <div className="assess-question-card" style={{ marginTop: '12px' }}>
                                <div className="assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                  <span className="assess-question-number">Feedback</span>
                                </div>
                                <div className="assess-question-content">
                                  <div className="assess-form-group">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <label className="assess-form-label" style={{ marginBottom: 0 }}>Feedback Text</label>
                                      <button
                                        type="button"
                                        className="assess-remove-question"
                                        aria-label="Close feedback"
                                        title="Close feedback"
                                        onClick={() => setFeedbackOpen(false)}
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                    <textarea
                                      className="assess-form-textarea"
                                      placeholder="Enter feedback text..."
                                      rows={3}
                                      value={feedback?.question_text || ''}
                                      onChange={(e) => setFeedback({ ...feedback, question_text: e.target.value })}
                                    />
                                  </div>
                                  {!feedbackInfoOpen && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                      <button
                                        type="button"
                                        className="assess-btn-secondary"
                                        title="Add info"
                                        onClick={() => setFeedbackInfoOpen(true)}
                                      >
                                        <Info size={14} /> <span style={{ marginLeft: 6 }}>Info</span>
                                      </button>
                                    </div>
                                  )}
                                  {feedbackInfoOpen && (
                                    <div className="assess-form-group" style={{ marginTop: 8 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <label className="assess-form-label" style={{ marginBottom: 0 }}>Info</label>
                                        <button
                                          type="button"
                                          className="assess-remove-question"
                                          aria-label="Close info"
                                          title="Close info"
                                          onClick={() => setFeedbackInfoOpen(false)}
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        className="assess-form-input"
                                        placeholder="Enter info..."
                                        value={feedback?.instructionBottom || ''}
                                        onChange={(e) => setFeedback({ ...feedback, instructionBottom: e.target.value })}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          
                        </div>}
                        {/* next info */}
                        {step === 3 && <div className='assess-form-section'>
                           <div className="assess-form-grid">

                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Team<span className="assess-required">*</span>
                                    </label>
                                    <CustomSelect
                                        className="assess-form-select"
                                        value={formData.team || ''}
                                        options={[
                                            { value: "", label: "Select Team" },
                                            ...(groups.map(team => ({
                                                value: team._id,
                                                label: team.name
                                            })) || [])
                                        ]}
                                        onChange={value => {
                                            // Reset sub-team when team changes
                                            setFormData({ ...formData, team: value, subteam: '' });
                                        }}
                                        placeholder="Select Team"
                                    />
                                </div>

                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Sub-Team
                                    </label>
                                    <CustomSelect
                                        className="assess-form-select"
                                        value={formData.subteam || ''}
                                        options={[
                                            { value: "", label: formData.team ? 'Select Sub-Team' : 'Select Team first' },
                                            ...(subTeams.map(st => ({
                                                value: st._id,
                                                label: st.name
                                            })) || [])
                                        ]}
                                        onChange={value => setFormData({ ...formData, subteam: value })}
                                        placeholder={formData.team ? 'Select Sub-Team' : 'Select Team first'}
                                        disabled={!formData.team}
                                    />
                                </div>
                            </div>
                           
                        </div>}
                        <div style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', alignItems: 'center' }}>
                           {step > 1 && <button type="button" className="assess-btn-secondary" style={{ color: '#5570f1', borderColor: '#5570f1' }} onClick={() => setStep(step - 1)}>
                                Previous
                            </button>}
                           {step < 3 && <button type="button" className="assess-btn-secondary" style={{ color: '#5570f1', borderColor: '#5570f1' }} onClick={() => setStep(step + 1)}>
                                Next
                            </button>}

                        </div>
                        {/* Form Actions */}
                        <div className="assess-form-actions">
                            {step === 3 ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <button type="button" className="assess-btn-secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            className="assess-btn-secondary"
                                            onClick={() => setAssessmentPreviewOpen(true)}
                                            title="Preview the entire assessment as the user sees it"
                                        >
                                            <Eye size={16} />
                                            <span>Preview Survey</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="assess-btn-secondary"
                                            onClick={() => {
                                                // Force status to Draft, then trigger save/update
                                                setFormData(prev => ({ ...prev, status: 'Draft' }));
                                                setTimeout(() => {
                                                    if (currentAssessment) {
                                                        handleUpdateAssessment();
                                                    } else {
                                                        handleSaveAssessment();
                                                    }
                                                }, 0);
                                            }}
                                            title="Save this survey as Draft"
                                        >
                                            <FileText size={16} />
                                            <span>Save as Draft</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="assess-btn-primary"
                                            onClick={() => {
                                                if (currentAssessment) {
                                                    handleUpdateAssessment();
                                                } else {
                                                    handleSaveAssessment();
                                                }
                                            }}
                                        >
                                            <FileText size={16} />
                                            <span>{currentAssessment ? "Update Survey" : "Create Survey"}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button type="button" className="assess-btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Question Preview Modal (end-user view) */}
        {questionPreviewIndex !== null && formElements[questionPreviewIndex] && formElements[questionPreviewIndex].type === 'question' && (
            <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setQuestionPreviewIndex(null); }}>
                <div className="survey-assess-qpreview-modal">
                    <div className="survey-assess-qpreview-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Eye size={16} />
                            <span className="survey-assess-qpreview-title">Question Preview</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setQuestionPreviewIndex(null)}
                            aria-label="Close preview"
                            className="survey-assess-qpreview-close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {(() => {
                        const element = formElements[questionPreviewIndex];
                        return (
                            <div className="survey-assess-qpreview-body">
                                <div className="survey-gforms-container">
                                {/* Question type badge */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        backgroundColor: element.question_type === 'Multi Select' ? '#e0f2fe' : '#f0f9ff',
                                        color: element.question_type === 'Multi Select' ? '#0369a1' : '#0284c7',
                                        border: `1px solid ${element.question_type === 'Multi Select' ? '#bae6fd' : '#bfdbfe'}`
                                    }}>
                                        {element.question_type === 'Multi Select' ? 'Multi Select' : 'Multiple Choice'}
                                    </span>
                                </div>

                                {/* Question text */}
                                <div className="survey-assess-qpreview-section" >
                                    <div className="label">Question</div>
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a' }}>{element.question_text || '—'}</div>
                                </div>

                                {/* Options (end-user view: not showing correct answers) */}
                                {(element.question_type === 'Multiple Choice' || element.question_type === 'Multi Select') && Array.isArray(element.options) && element.options.length > 0 && (
                                    <div className="survey-assess-qpreview-section">
                                        <div className="label">Options</div>
                                        <div className="survey-assess-qpreview-options">
                                            {element.options.map((opt, idx) => (
                                                <label key={idx} className="survey-assess-qpreview-option">
                                                    <input type={element.question_type === 'Multi Select' ? 'checkbox' : 'radio'} disabled name={`preview-q-${questionPreviewIndex}`} />
                                                    <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                        <span style={{fontWeight: 'bold', color: '#374151', minWidth: '20px'}}>
                                                            {getLetterFromIndex(idx)}.
                                                        </span>
                                                        <span>{opt || `Option ${getLetterFromIndex(idx)}`}</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
        {assessmentPreviewOpen && (
            <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAssessmentPreviewOpen(false); }}>
                <div className="survey-assess-qpreview-modal">
                    <div className="survey-assess-qpreview-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Eye size={16} />
                            <span className="survey-assess-qpreview-title">Survey Preview </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAssessmentPreviewOpen(false)}
                            aria-label="Close preview"
                            className="survey-assess-qpreview-close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="survey-assess-qpreview-body">
                        {/* Class/Team name */}
                        {/* <div className="survey-assess-qpreview-section">
                            <div style={{ color: '#1d4ed8', fontWeight: 700 }}>
                                {(groups.find(t => String(t._id) === String(formData.team))?.name) || 'Class name'}
                                {formData.subteam ? ` / ${(groups.find(t => String(t._id) === String(formData.team))?.subTeams || []).find(st => String(st._id) === String(formData.subteam))?.name || ''}` : ''}
                            </div>
                        </div> */}

                        {/* Header card like Google Forms */}
                        <div classNa    me="survey-assess-qpreview-section">
                            <div className="survey-gforms-card">
                                <div className="survey-gforms-card-topbar" />
                                <div className="survey-gforms-card-body">
                                    <div className="survey-gforms-card-title">{formData.title || 'Untitled form'}</div>
                                    {formData.description && (
                                        <div className="survey-gforms-card-description" dangerouslySetInnerHTML={{ __html: formData.description }} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* (Removed top counter to place it near nav) */}

                        {(() => {
                            const s = builtSections[Math.min(sectionPreviewIndex, builtSections.length - 1)] || { title: '', description: '', items: [] };
                            return (
                                <>
                                    {/* Section Description inside a card (rich text) */}
                                    {(s.title || s.description) && (
                                        <div className="survey-assess-qpreview-section">
                                            <div className="survey-gforms-card">
                                                <div className="survey-gforms-card-body">
                                                    {s.title && (<div className="label" style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</div>)}
                                                    {s.description && (
                                                        <div style={{ color: '#334155' }}
                                                             dangerouslySetInnerHTML={{ __html: s.description }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                            {el.type === 'question' && (
                                                <div className="survey-gforms-card">
                                                    <div className="survey-gforms-card-body">
                                                        <div className="survey-gforms-question-title">{el.question_text || '—'}</div>
                                                        {(el.question_type === 'Multiple Choice' || el.question_type === 'Multi Select') && Array.isArray(el.options) && el.options.length > 0 && (
                                                            <div className="survey-assess-qpreview-options">
                                                                {el.options.map((opt, oidx) => {
                                                                const qKey = el.uuid || el._id || `q-${idx}`;
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
                                                                        <span className="opt-text">{opt || `Option ${oidx + 1}`}</span>
                                                                    </label>
                                                                );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Feedback block preview: input + info text box (only on last section) */}
                                    {(feedback?.question_text || feedback?.instructionBottom) && (sectionPreviewIndex === Math.max(0, builtSections.length - 1)) && (
                                        <div className="survey-assess-qpreview-section">
                                            <div className="survey-gforms-card">
                                                <div className="survey-gforms-card-body">
                                                    {feedback?.question_text && (
                                                        <div className="assess-form-group">
                                                            {/* <label className="assess-form-label">Feedback</label> */}
                                                            <textarea
                                                                className="assess-form-textarea"
                                                                placeholder={feedback.question_text}
                                                                value={previewResponses.__feedbackText || ''}
                                                                onChange={(e) => setPreviewResponses(prev => ({ ...prev, __feedbackText: e.target.value }))}
                                                            />
                                                        </div>
                                                    )}
                                                    {feedback?.instructionBottom && (
                                                        <div className="assess-form-group">
                                                            {/* <label className="assess-form-label">Info</label> */}
                                                            <div style={{ color: '#334155', whiteSpace: 'pre-wrap' }}>
                                                                {feedback.instructionBottom}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation: Back (left), Counter (center), Next/Submit (right) */}
                                    <div className="survey-assess-qpreview-section">
                                        <div className="survey-gforms-nav-3">
                                            <div className="survey-nav-left">
                                                <button
                                                    type="button"
                                                    className="assess-btn-secondary"
                                                    disabled={sectionPreviewIndex <= 0}
                                                    onClick={() => setSectionPreviewIndex(Math.max(0, sectionPreviewIndex - 1))}
                                                >
                                                    Back
                                                </button>
                                            </div>
                                            <div className="survey-nav-center" style={{ color: '#64748b', fontSize: '0.9rem', visibility: builtSections.length > 1 ? 'visible' : 'hidden' }}>
                                                Section {sectionPreviewIndex + 1} of {builtSections.length}
                                            </div>
                                            <div className="survey-nav-right" style={{ display: 'flex', gap: 8 }}>
                                                {sectionPreviewIndex < builtSections.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        className="assess-btn-primary"
                                                        onClick={() => setSectionPreviewIndex(Math.min(builtSections.length - 1, sectionPreviewIndex + 1))}
                                                    >
                                                        Next
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="assess-btn-primary"
                                                        onClick={() => setAssessmentPreviewOpen(false)}
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
                </div>
           
        )}
    </>
    );
};

export default QuestionsForm;
