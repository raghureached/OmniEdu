import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Plus, X, Upload, Copy, Eye, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../services/api.js';
import './QuestionsForm-survey.css';
import '../GlobalAssessments Old/QuestionsForm.css';
import RichText from './RichTextSurvey.jsx';
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
    // Toggle visibility of the feedback text box
    const [feedbackTextOpen, setFeedbackTextOpen] = useState(true);
    // Section-based preview index (for section pagination in preview)
    const [sectionPreviewIndex, setSectionPreviewIndex] = useState(0);
    // Local responses for preview interaction (radio/checkbox selections)
    const [previewResponses, setPreviewResponses] = useState({});
    // Thumbnail preview modal for Step 1
    const [thumbPreviewOpen, setThumbPreviewOpen] = useState(false);
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
    const [aiProcessing, setAiProcessing] = useState(false);
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


    const enhanceTexthelper = async (title) => {
        try {
            setAiProcessing(true);
            const response = await api.post('/api/globalAdmin/enhanceSurvey', { title });
            setFormData({ ...formData, title: response.data.data.title, description: response.data.data.description, tags: response.data.data.tags });
        } catch (error) {
            console.error('Error enhancing text:', error);
        } finally {
            setAiProcessing(false);
        }
    }
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
            <div className="survey-assess-modal-overlay">
                <div className="survey-assess-modal-content">
                    {/* Modal Header */}
                    <div className="survey-assess-modal-header">
                        <div className="survey-assess-modal-header-content">
                            <div className="survey-assess-modal-icon">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2>{currentAssessment ? "Edit Survey" : "Create New Survey"}</h2>
                                <p className="assess-modal-subtitle">
                                    {currentAssessment ? (
                                        step === 1 ? "Step 1 of 3: Basic Information" :
                                            step === 2 ? "Step 2 of 3: Files and Resources" :
                                                "Step 3 of 3: Configurations & Metadata"
                                    ) : (
                                        step === 1 ? "Step 1 of 3: Basic Information" :
                                            step === 2 ? "Step 2 of 3: Questions and Resources" :
                                                "Step 3 of 3: Configurations & Metadata"
                                    )}
                                </p>
                            </div>
                        </div>
                        <button className="survey-assess-close-btn" onClick={() => setShowForm(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form + Preview Panel */}
                    <div className="survey-assess-modal-form-container">
                        {/* Left Side - Form */}
                        <div className="survey-assess-modal-form">
                            {/* Basic Information */}
                            {step === 1 &&
                                <div className="survey-assess-form-section">
                                    <h3 className="survey-assess-section-title">Basic Information</h3>

                                    <div className="survey-assess-form-grid">
                                        <div className="survey-assess-form-group">
                                            <label className="survey-assess-form-label">
                                                Survey Title<span className="survey-assess-required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="survey-assess-form-input"
                                                placeholder="Enter assessment title"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="survey-assess-form-group">
                                            <label className="survey-assess-form-label">Tags<span className="assess-required">*</span></label>
                                            <div className="survey-assess-tag-picker">
                                                <div className="survey-assess-tag-controls">
                                                    <input
                                                        type="text"
                                                        className="survey-assess-form-input"
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
                                                    <div className="survey-assess-chips">
                                                        {formData.tags.map((t, idx) => (
                                                            <span key={`${t}-${idx}`} className="survey-assess-chip">
                                                                {t}
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-chip-remove"
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

                                    <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">Description<span className="assess-required">*</span></label>
                                        <textarea
                                            className="survey-assess-form-textarea"
                                            placeholder="Provide a detailed description of this survey"
                                            rows={3}
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <button className='btn-primary' style={{ width: '70%', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => enhanceTexthelper(formData.title)}>{aiProcessing ? "Please Wait.." : "Create with AI ✨"}</button>

                                    {/* Thumbnail upload */}
                                    <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">Thumbnail</label>

                                        {formData.thumbnail_url ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 12,
                                                    background: '#eef2ff',
                                                    borderRadius: 10,
                                                    padding: '8px 12px',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            >
                                                <div style={{ color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {(formData.thumbnail_file && formData.thumbnail_file.name) || (String(formData.thumbnail_url).split('/').pop() || 'thumbnail')}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <button
                                                        type="button"
                                                        className="survey-assess-btn-link"
                                                        onClick={() => setThumbPreviewOpen(true)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', background: 'transparent' }}
                                                    >
                                                        <Eye size={16} /> Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="survey-assess-btn-link"
                                                        onClick={() => {
                                                            try {
                                                                if ((formData.thumbnail_url || '').startsWith('blob:')) URL.revokeObjectURL(formData.thumbnail_url);
                                                            } catch { }
                                                            setFormData({ ...formData, thumbnail_url: '', thumbnail_file: null });
                                                        }}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', background: 'transparent' }}
                                                    >
                                                        <X size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <input
                                                    type="file"
                                                    id="survey-thumb-input"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files && e.target.files[0];
                                                        if (!file) return;
                                                        const blobUrl = URL.createObjectURL(file);
                                                        setFormData({ ...formData, thumbnail_url: blobUrl, thumbnail_file: file });
                                                    }}
                                                />
                                                <label
                                                    htmlFor="survey-thumb-input"
                                                    className="survey-assess-btn-secondary"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                                >
                                                    <Upload size={16} /> Upload Thumbnail
                                                </label>
                                            </div>
                                        )}


                                    </div>

                                    {/* Thumbnail preview overlay modal */}
                                    {thumbPreviewOpen && formData.thumbnail_url && (
                                        <div className="assess-file-preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setThumbPreviewOpen(false); }}>
                                            <div className="assess-file-preview-modal">
                                                <div className="assess-file-preview-header">
                                                    <span className="assess-file-preview-title">File Preview</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setThumbPreviewOpen(false)}
                                                        aria-label="Close file preview"
                                                        className="assess-file-preview-close"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="assess-file-preview-body">
                                                    {(
                                                        (formData.thumbnail_file && typeof formData.thumbnail_file.type === 'string' && formData.thumbnail_file.type.startsWith('image/'))
                                                        || /\.(jpeg|jpg|png|gif|webp)$/i.test(String(formData.thumbnail_url || ''))
                                                        || String(formData.thumbnail_url || '').startsWith('blob:')
                                                    ) ? (
                                                        <img src={resolveUrl(formData.thumbnail_url)} alt="Thumbnail Preview" />
                                                    ) : (
                                                        <div>
                                                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 6 }}>
                                                                Preview available only for images.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}


                                </div>}

                            {/* Form Elements Section */}
                            {step === 2 && <div className="survey-assess-form-section">
                                <div className="survey-assess-form-elements-header">
                                    {(() => {
                                        const sectionCount = (formElements || []).filter(el => el.type === 'section').length;
                                        const questionCount = (formElements || []).filter(el => el.type === 'question').length;
                                        return (
                                            <h3 className="survey-assess-section-title">
                                                {/* Sections ({sectionCount}) · Questions ({questionCount}) */}
                                            </h3>
                                        );
                                    })()}
                                </div>

                                <div className="survey-assess-form-elements-container survey-assess-questions-container">
                                    {formElements.map((element, elementIndex) => (
                                        <div key={elementIndex} className={`survey-assess-form-element-card ${element.type}`}>
                                            {/* Info Box Element */}
                                            {element.type === 'info' && (
                                                <div className="survey-assess-info-element">
                                                    <div className="survey-assess-element-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span className="survey-assess-element-number">Info Box {elementIndex + 1}</span>
                                                        {formElements.length > 2 && (
                                                            <button
                                                                type="button"
                                                                className="survey-assess-remove-element"
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
                                                                className="survey-assess-duplicate-element"
                                                                title="Duplicate Info Box"
                                                                onClick={() => duplicateFormElement(elementIndex)}
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="survey-assess-info-content">
                                                        <div className="survey-assess-form-group">
                                                            <label className="survey-assess-form-label">Description</label>
                                                            <RichText
                                                                value={element.description || ''}
                                                                onChange={(html) => updateFormElementField(elementIndex, 'description', html)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {element.type === 'question' && (
                                                <div className="survey-assess-question-card">
                                                    <div className="survey-assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        {(() => {
                                                            // Determine section index (1-based) and question number within that section
                                                            const prior = formElements.slice(0, elementIndex);
                                                            const sectionsBefore = prior.filter(el => el.type === 'section').length;
                                                            const lastSectionIdx = (() => {
                                                                for (let i = elementIndex - 1; i >= 0; i--) {
                                                                    if (formElements[i]?.type === 'section') return i;
                                                                }
                                                                return -1;
                                                            })();
                                                            const qWithinSection = formElements
                                                                .slice(lastSectionIdx + 1, elementIndex + 1)
                                                                .filter(el => el.type === 'question').length;
                                                            const sectionNumber = sectionsBefore === 0 ? 1 : sectionsBefore;
                                                            return (
                                                                <span className="survey-assess-question-number">{`Question ${qWithinSection} of Section ${sectionNumber}`}</span>
                                                            );
                                                        })()}
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                            <button
                                                                type="button"
                                                                className="btn-primary"
                                                                title="Duplicate Question"
                                                                onClick={() => duplicateFormElement(elementIndex)} style={{ display: 'flex', gap: 8, border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                                            >
                                                                <Copy size={16} /> Duplicate
                                                            </button>
                                                            {formElements.length > 2 && (
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-remove-question"
                                                                    onClick={() => removeFormElement(elementIndex)}
                                                                    title="Remove Question"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="survey-assess-question-content">
                                                        {/* Instructions (optional) */}
                                                        <div className="survey-assess-form-group">
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <label className="survey-assess-form-label" style={{ marginBottom: 0 }}>Instructions (optional)</label>
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-btn-secondary"
                                                                    style={{ padding: '6px 10px', fontSize: 15, fontWeight: 'bold' }}
                                                                    onClick={() => setInstructionsOpen(prev => ({ ...prev, [elementIndex]: !prev[elementIndex] }))}
                                                                >
                                                                    {instructionsOpen[elementIndex] || !!(element.instruction_text) ? 'Hide' : 'Add'} Instructions
                                                                </button>
                                                            </div>
                                                            {(instructionsOpen[elementIndex] || !!(element.instruction_text)) && (
                                                                <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                                                                    <div className="survey-assess-form-group" style={{ marginBottom: 0 }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                                            <div style={{ fontSize: 12, color: '#64748b' }}></div>
                                                                            <button
                                                                                type="button"
                                                                                className="survey-assess-close-btn"
                                                                                aria-label="Clear and close instructions"
                                                                                title="Clear and close instructions"
                                                                                onClick={() => {
                                                                                    updateFormElementField(elementIndex, 'instruction_text', '');
                                                                                    setInstructionsOpen(prev => ({ ...prev, [elementIndex]: false }))
                                                                                }}
                                                                                style={{ color: '#dc2626', backgroundColor: '#fee2e2' }}
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        </div>
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
                                                        <div className="survey-assess-form-group">
                                                            <label className="survey-assess-form-label" style={{ marginTop: "10px" }}>Question Type<span className="assess-required">*</span></label>
                                                            <select
                                                                className="survey-assess-form-select"
                                                                value={element.question_type || ''}
                                                                onChange={e => updateFormElementField(elementIndex, 'question_type', e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Type</option>
                                                                <option value="Multiple Choice">Multiple Choice</option>
                                                                <option value="Multi Select">Multi Select</option>
                                                            </select>
                                                        </div>



                                                        {/* Question Text */}
                                                        <div className="survey-assess-form-group">
                                                            <label className="survey-assess-form-label">
                                                                Question Text<span className="form-required">*</span>
                                                            </label>
                                                            <textarea
                                                                className="survey-assess-form-textarea"
                                                                placeholder="Enter your question here..."
                                                                rows={2}
                                                                value={element.question_text || ''}
                                                                onChange={e => updateFormElementField(elementIndex, 'question_text', e.target.value)}
                                                                required
                                                            />
                                                        </div>

                                                        {/* Answer Options */}
                                                        <div className="survey-assess-form-group">
                                                            <label className="survey-assess-form-label">Answer Options</label>
                                                            {(element.question_type === 'Multiple Choice' || element.question_type === 'Multi Select') && (
                                                                <div className="survey-assess-options-container">
                                                                    {(element.options || []).map((opt, optIndex) => (
                                                                        <div key={optIndex} className="survey-assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
                                                                            <div className="survey-assess-option-index">{getLetterFromIndex(optIndex)}</div>
                                                                            <input
                                                                                type="text"
                                                                                className="survey-assess-form-input"
                                                                                placeholder={`Option ${getLetterFromIndex(optIndex)}`}
                                                                                value={opt}
                                                                                onChange={e => updateOption(elementIndex, optIndex, e.target.value)}
                                                                                required
                                                                            />
                                                                            {(element.options || []).length > 2 && (
                                                                                <button
                                                                                    type="button"
                                                                                    className="survey-assess-remove-option"
                                                                                    onClick={() => removeOption(elementIndex, optIndex)}
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    <button
                                                                        type="button"
                                                                        className="survey-assess-add-option"
                                                                        onClick={() => addOption(elementIndex)}
                                                                    >
                                                                        <Plus size={14} />
                                                                        Add Option
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Footer actions should be always visible, independent of question_type */}
                                                        <div className="survey-assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                                            {(() => {
                                                                const textOk = !!(element.question_text || '').trim();
                                                                const optsOk = Array.isArray(element.options) && element.options.filter(o => (o || '').trim()).length >= 2;
                                                                const qReady = textOk && optsOk;
                                                                const hint = qReady ? undefined : 'Enter question text and at least two options to enable';
                                                                return (
                                                                    <>
                                                                        <button type="button" className="btn-secondary" onClick={() => addFormElement('question', {}, elementIndex + 1)} disabled={!qReady} title={hint}>
                                                                            <Plus size={14} /> Add Question
                                                                        </button>
                                                                        <button type="button" className="btn-secondary" onClick={() => addFormElement('section')} disabled={!qReady} title={hint}>
                                                                            <Plus size={14} /> Add Section
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="survey-assess-btn-primary survey-assess-save-inline"
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
                                                <div className="survey-assess-question-card">
                                                    <div className="survey-assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        {(() => {
                                                            const thisSectionOrdinal = formElements.slice(0, elementIndex + 1).filter(el => el.type === 'section').length;
                                                            const totalSections = Math.max(1, (formElements || []).filter(el => el.type === 'section').length);
                                                            return (
                                                                <span className="survey-assess-question-number">{`Section ${thisSectionOrdinal} of ${totalSections}`}</span>
                                                            );
                                                        })()}
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                            {formElements.length > 2 && (
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-remove-question"
                                                                    onClick={() => removeFormElement(elementIndex)}
                                                                    title="Remove Section"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="survey-assess-section-content">
                                                        <div className="survey-assess-form-group">
                                                            {/* <label className="survey-assess-form-label">Section Description</label> */}
                                                            <RichText
                                                                value={element.description || ''}
                                                                onChange={(html) => updateFormElementField(elementIndex, 'description', html)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="survey-assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                        {(() => {
                                                            const raw = String(element.description || '');
                                                            const plain = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                                                            const ready = plain.length > 0;
                                                            const hint = ready ? undefined : 'Enter section description to enable';
                                                            return (
                                                                <button type="button" className="btn-secondary" onClick={() => addFormElement('question', {}, elementIndex + 1)} disabled={!ready} title={hint}>
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
                                            <button type="button" className="survey-assess-btn-secondary" onClick={() => setFeedbackOpen(true)}>
                                                Feedback Text
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* When feedback panel is open, allow adding questions above feedback (Create & Edit) */}
                                {feedbackOpen && (
                                    <div className="survey-assess-question-card" style={{ marginTop: '12px' }}>
                                        <div className="survey-assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className="survey-assess-question-number">Feedback</span>
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                {/* Remove entire feedback (clear all + close) */}
                                                <button
                                                    type="button"
                                                    className="survey-assess-remove-question"
                                                    aria-label="Remove entire feedback"
                                                    title="Remove entire feedback"
                                                    onClick={() => { setFeedback({ instructionTop: '', question_text: '', instructionBottom: '' }); setFeedbackInfoOpen(false); setFeedbackOpen(false); }}
                                                    style={{ color: '#dc2626', backgroundColor: '#fee2e2' }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="survey-assess-question-content">
                                            {feedbackTextOpen && (
                                                <div className="survey-assess-form-group">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <label className="assess-form-label" style={{ marginBottom: 0 }}>Text</label>
                                                        {/* Remove (hide) the text box and clear its data */}
                                                        <button
                                                            type="button"
                                                            className="survey-assess-remove-question"
                                                            aria-label="Remove text"
                                                            title="Remove text"
                                                            onClick={() => { setFeedbackTextOpen(false); setFeedback({ ...(feedback || {}), question_text: '' }); }}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        className="survey-assess-form-textarea"
                                                        placeholder="Enter feedback text..."
                                                        rows={3}
                                                        value={feedback?.question_text || ''}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            setFeedback({ ...(feedback || {}), question_text: v });
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {!feedbackInfoOpen && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    <button
                                                        type="button"
                                                        className="survey-assess-btn-secondary"
                                                        title="Add info"
                                                        onClick={() => setFeedbackInfoOpen(true)}
                                                    >
                                                        <Plus size={14} /> <span style={{ marginLeft: 6 }}>add Info</span>
                                                    </button>
                                                    {!feedbackTextOpen && (
                                                        <button
                                                            type="button"
                                                            className="survey-assess-btn-secondary"
                                                            title="Add text"
                                                            onClick={() => setFeedbackTextOpen(true)}
                                                        >
                                                            <Plus size={14} /> <span style={{ marginLeft: 6 }}>add Text</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {feedbackInfoOpen && (
                                                <div className="survey-assess-form-group" style={{ marginTop: 8 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <label className="survey-assess-form-label" style={{ marginBottom: 0 }}>Info</label>
                                                        <button
                                                            type="button"
                                                            className="survey-assess-remove-question"
                                                            aria-label="Close info"
                                                            title="Close info"
                                                            onClick={() => setFeedbackInfoOpen(false)}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="survey-assess-form-input"
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
                            {step === 3 && <div className='survey-assess-form-section'>
                                <div className="survey-assess-form-grid">

                                    <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">
                                            Team<span className="survey-assess-required">*</span>
                                        </label>
                                        <select
                                            className="survey-assess-form-select"
                                            value={formData.team || ''}
                                            onChange={e => {
                                                const teamId = e.target.value;
                                                // Reset sub-team when team changes
                                                setFormData({ ...formData, team: teamId, subteam: '' });
                                            }}
                                        >
                                            <option value="">Select Team</option>
                                            {groups.map(team => (
                                                <option key={team._id} value={team._id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="survey-assess-form-group">
                                        <label className="survey-assess-form-label">
                                            Sub-Team<span className="assess-required">*</span>
                                        </label>
                                        <select
                                            className="survey-assess-form-select"
                                            value={formData.subteam || ''}
                                            onChange={e => setFormData({ ...formData, subteam: e.target.value })}
                                            disabled={!formData.team}
                                        >
                                            <option value="">{formData.team ? 'Select Sub-Team' : 'Select Team first'}</option>
                                            {subTeams.map(st => (
                                                <option key={st._id} value={st._id}>
                                                    {st.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {/* <div className="assess-form-grid">
                                <div className="assess-form-group">
                                    <label className="assess-form-label">Pass Percentage (0-100)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="3"
                                        inputMode="numeric"
                                        className="assess-form-input"
                                        value={
                                            formData.percentage_to_pass === 0 || formData.percentage_to_pass
                                                ? formData.percentage_to_pass
                                                : ''
                                        }
                                        onChange={e => {
                                            const n = parseInt(e.target.value, 10);
                                            setFormData({
                                                ...formData,
                                                percentage_to_pass: Number.isNaN(n) ? '' : n,
                                            });
                                            if (passError) setPassError('');
                                        }}
                                        onBlur={e => {
                                            const n = parseInt(e.target.value, 10);
                                            let clamped = Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n));
                                            setFormData({ ...formData, percentage_to_pass: clamped });
                                            validatePass();
                                        }}
                                        onKeyDown={e => {
                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                                        }}
                                        placeholder="e.g., 60"
                                    />
                                    <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                    </small>
                                    {passError && (
                                        <div style={{ color: '#dc2626', marginTop: 6, fontSize: '0.875rem' }}>{passError}</div>
                                    )}
                                </div>
                                    <label className="assess-form-label">
                                        Display Answers<span className="assess-required">*</span>
                                    </label>
                                    <select
                                        className="assess-form-select"
                                        value={String(Boolean(formData.display_answers))}
                                        onChange={e => {
                                            const val = e.target.value === 'true';
                                            setFormData({
                                                ...formData,
                                                display_answers: val,
                                                 if turning off, clear the when value to avoid confusion
                                                 when enabling, default to AfterPassing if unlimited attempts, else AfterAssessment
                                                display_answers_when: val
                                                    ? (formData.unlimited_attempts ? 'AfterPassing' : (formData.display_answers_when || 'AfterAssessment'))
                                                    : '',
                                            });
                                        }}
                                    >
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Display Answers When
                                    </label>
                                    <select
                                        className="assess-form-select"
                                        value={formData.display_answers_when || ''}
                                        onChange={e => setFormData({ ...formData, display_answers_when: e.target.value })}
                                        disabled={!formData.display_answers}
                                    >
                                        <option value="">Select when to display</option>
                                        <option value="AfterAssessment">After submission</option>
                                        <option value="AfterPassing">After passing</option>
                                        <option value="AfterDueDate">After due date</option> 
                                         <option value="Always">Always</option>
                                        <option value="Never">Never</option>
                                    </select>
                                </div>
                            </div> */}
                            </div>}
                           
                            {/* Form Actions */}
                            <div className="survey-assess-form-actions">
                                {step === 3 ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)} disabled={step === 1}>
                                            <ChevronLeft size={16} />Previous
                                        </button>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={() => setAssessmentPreviewOpen(true)}
                                                title="Preview the entire assessment as the user sees it"
                                            >
                                                <Eye size={16} />
                                                <span>Preview Survey</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-secondary"
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
                                                className="btn-primary"
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)} disabled={step === 1}>
                                            <ChevronLeft size={16} />Previous
                                        </button>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                                Cancel
                                            </button>
                                            {step < 3 && <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>
                                                Next <ChevronRight size={16} />
                                            </button>}
                                        </div>
                                    </div>
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
                                        <div className="survey-gforms-card">
                                            <div className="survey-gforms-card-body">
                                                {/* Instructions (HTML) */}
                                                {element.instruction_text && (
                                                    <div
                                                        className="survey-assess-qpreview-instructions"
                                                        style={{ color: '#334155', marginBottom: 6 }}
                                                        dangerouslySetInnerHTML={{ __html: element.instruction_text }}
                                                    />
                                                )}
                                                {/* Question title (same class as survey preview) */}
                                                <div className="survey-gforms-question-title">{element.question_text || '—'}</div>
                                                {/* Options (end-user view: not showing correct answers) */}
                                                {(element.question_type === 'Multiple Choice' || element.question_type === 'Multi Select') && Array.isArray(element.options) && element.options.length > 0 && (
                                                    <div className="survey-assess-qpreview-options">
                                                        {element.options.map((opt, idx) => {
                                                            const isMulti = element.question_type === 'Multi Select';
                                                            const key = `__single_${questionPreviewIndex}`;
                                                            const selected = previewResponses[key];
                                                            const checked = isMulti
                                                                ? Array.isArray(selected) && selected.includes(idx)
                                                                : selected === idx;
                                                            const onChange = (e) => {
                                                                setPreviewResponses(prev => {
                                                                    if (isMulti) {
                                                                        const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
                                                                        const i = arr.indexOf(idx);
                                                                        if (e.target.checked && i === -1) arr.push(idx);
                                                                        if (!e.target.checked && i !== -1) arr.splice(i, 1);
                                                                        return { ...prev, [key]: arr };
                                                                    } else {
                                                                        return { ...prev, [key]: idx };
                                                                    }
                                                                });
                                                            };
                                                            return (
                                                                <label key={idx} className="survey-assess-qpreview-option">
                                                                    <input
                                                                        type={isMulti ? 'checkbox' : 'radio'}
                                                                        name={`preview-q-${questionPreviewIndex}`}
                                                                        checked={!!checked}
                                                                        onChange={onChange}
                                                                    />
                                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span style={{ fontWeight: 'bold', color: '#374151', minWidth: '20px' }}>
                                                                            {getLetterFromIndex(idx)}.
                                                                        </span>
                                                                        <span className="opt-text">{opt || `Option ${idx + 1}`}</span>
                                                                    </span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
            {assessmentPreviewOpen && (
                <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAssessmentPreviewOpen(false); }}>
                    <div className="survey-assess-apreview-modal">
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
                            <div className="survey-assess-qpreview-section">
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
                                                            {/* Instructions (HTML) */}
                                                            {el.instruction_text && (
                                                                <div
                                                                    className="survey-assess-qpreview-instructions"
                                                                    style={{ color: '#334155', marginBottom: 6 }}
                                                                    dangerouslySetInnerHTML={{ __html: el.instruction_text }}
                                                                />
                                                            )}
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
                                                            <div className="survey-assess-form-group">
                                                                {/* <label className="assess-form-label">Feedback</label> */}
                                                                <textarea
                                                                    className="survey-assess-form-textarea"
                                                                    placeholder={feedback.question_text}
                                                                    value={previewResponses.__feedbackText || ''}
                                                                    onChange={(e) => setPreviewResponses(prev => ({ ...prev, __feedbackText: e.target.value }))}
                                                                />
                                                            </div>
                                                        )}
                                                        {feedback?.instructionBottom && (
                                                            <div className="survey-assess-form-group">
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

                                        {/* Last Info element displayed as a card (preserve rich text) on the last section */}
                                        {sectionPreviewIndex === Math.max(0, builtSections.length - 1) && (() => {
                                            const infos = (formElements || []).filter(el => el?.type === 'info' && (el.description || '').trim());
                                            if (!infos.length) return null;
                                            const last = infos[infos.length - 1];
                                            const html = String(last.description || '').trim();
                                            if (!html) return null;
                                            return (
                                                <div className="survey-assess-qpreview-section">
                                                    <div className="survey-gforms-card">
                                                        <div className="survey-gforms-card-body">
                                                            {/* Optional title if present */}
                                                            {last.title && (
                                                                <div className="label" style={{ fontWeight: 700, marginBottom: 6 }}>{last.title}</div>
                                                            )}
                                                            <div style={{ color: '#334155' }}
                                                                dangerouslySetInnerHTML={{ __html: html }}
                                                            />
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
                                                            onClick={() => setSectionPreviewIndex(Math.min(builtSections.length - 1, sectionPreviewIndex + 1))}
                                                        >
                                                            Next
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="survey-assess-btn-primary"
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
