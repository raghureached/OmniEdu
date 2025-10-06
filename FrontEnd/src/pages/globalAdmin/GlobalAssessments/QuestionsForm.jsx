import React, { useEffect, useRef, useState } from 'react';
import { FileText, Plus, X, Upload, Copy, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../../services/api.js';
import './QuestionsForm.css';
import '../GlobalSurveys/QuestionsForm-survey.css';
import RichText from './RichTextSurvey.jsx';

const QuestionsForm = ({
    currentAssessment,
    formData,
    setFormData,
    questions,
    showForm,
    setShowForm,
    uploadedFiles,
    handleSaveAssessment,
    handleEditAssessment,
    handleUpdateAssessment,
    handleDeleteAssessment,
    updateQuestionField,
    addQuestion,
    addQuestionAfter,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    handleFileUpload,
    duplicateQuestion,
    groups = [],
    setSectionsPayload,
}) => {
    // console.log(formData)
    const [step, setStep] = useState(1);
    const [aiProcessing, setAiProcessing] = useState(false);
    const [passError, setPassError] = useState('');
    // Tags picker state (free-form)
    const [tagInput, setTagInput] = useState('');
    // Local UI state to toggle optional instructions per question index
    const [instructionsOpen, setInstructionsOpen] = useState({});
    // Local UI state to toggle file preview per question index
    const [previewOpen, setPreviewOpen] = useState({});
    // Local UI state for question preview modal; holds the qIndex or null
    const [questionPreviewIndex, setQuestionPreviewIndex] = useState(null);
    // Whole-assessment preview modal
    const [assessmentPreviewOpen, setAssessmentPreviewOpen] = useState(false);
    const [sectionPreviewIndex, setSectionPreviewIndex] = useState(0);
    const [previewResponses, setPreviewResponses] = useState({});
    // Thumbnail preview modal for Step 1
    const [thumbPreviewOpen, setThumbPreviewOpen] = useState(false);
    // Cache shuffled option orders by a stable key so options don't reshuffle on each selection
    const previewShuffleRef = useRef({});
    // UI-only sections for Step 2 (do not persist to backend payload)
    // afterIndex: -1 means before first question; otherwise section appears after question with that index
    const [sections, setSections] = useState([
        { afterIndex: -1, title: '', description: '' }
    ]);

    // Helpers: compute section index and question number within section for a given question index
    const getSectionIndexForQuestion = (qIndex) => {
        // Sections start at 1; count only real boundaries (afterIndex >= 0) before this question
        const before = sections
            .map(s => (typeof s.afterIndex === 'number' ? s.afterIndex : -1))
            .filter(a => a >= 0 && a < qIndex).length;
        return 1 + before;
    };
    const getQuestionNumberWithinSection = (qIndex) => {
        const boundaries = sections
            .map(s => (typeof s.afterIndex === 'number' ? s.afterIndex : -1))
            .filter(a => a >= 0 && a < qIndex);
        const last = boundaries.length ? Math.max(...boundaries) : -1;
        return qIndex - last;
    };
    const getTotalSections = () => 1 + sections.filter(s => (typeof s.afterIndex === 'number' && s.afterIndex >= 0)).length;
    // Given a section's array index, compute its 1-based absolute Section number based on order: -1 (top) first, then increasing afterIndex, ties by insertion order
    const getSectionNumberForSectionIndex = (sectionIdx) => {
        if (!sections || sectionIdx < 0 || sectionIdx >= sections.length) return 1;
        const ordered = sections
            .map((s, i) => ({ i, a: (typeof s.afterIndex === 'number' ? s.afterIndex : -1) }))
            .sort((x, y) => (x.a - y.a) || (x.i - y.i));
        const pos = ordered.findIndex(o => o.i === sectionIdx);
        return pos === -1 ? 1 : (pos + 1);
    };

    const addSectionAfter = (afterIndex) => {
        setSections(prev => [...prev, { afterIndex, title: '', description: '' }]);
    };
    const updateSection = (index, field, value) => {
        setSections(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };
    const removeSection = (index) => {
        setSections(prev => prev.filter((_, i) => i !== index));
    };

    // Derive sub-teams for the selected team
    const selectedTeam = groups.find(t => String(t._id) === String(formData.team));
    const subTeams = selectedTeam?.subTeams || [];

    // Helpers for duration in HH:MM without relying on browser time picker (to avoid AM/PM)
    const parseHm = (d) => {
        const [h = '0', m = '0'] = (d || '').split(':');
        const hh = Math.max(0, parseInt(h, 10) || 0);
        const mm = Math.max(0, Math.min(59, parseInt(m, 10) || 0));
        return { hh, mm };
    };
    const formatHm = (hh, mm) => `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    const enhanceTexthelper = async (title) => {
        try {
            setAiProcessing(true);
            const response = await api.post('/api/globalAdmin/enhanceAssessment', { title });
            setFormData({ ...formData, title: response.data.data.title, description: response.data.data.description, tags: response.data.data.tags });
        } catch (error) {
            console.error('Error enhancing text:', error);
        } finally {
            setAiProcessing(false);
        }
    };
    // Ensure preview uses absolute URL when backend returns relative path like /uploads/xyz
    const resolveUrl = (u) => {
        if (!u) return u;
        const base = api?.defaults?.baseURL;
        // Determine the backend origin from api baseURL or window origin
        let backendOrigin = '';
        if (base && /^https?:\/\//i.test(base)) {
            try {
                const b = new URL(base);
                backendOrigin = `${b.protocol}//${b.host}`;
            } catch {
                backendOrigin = base.replace(/\/+$/, '');
            }
        } else {
            backendOrigin = window.location.origin;
        }

        // If URL is absolute
        if (/^https?:\/\//i.test(u)) {
            // Keep third-party URLs (e.g., Cloudinary) intact
            try {
                const abs = new URL(u);
                const backend = new URL(backendOrigin);
                // If this absolute URL appears to be from our backend (by pathname like /uploads)
                if (abs.pathname.startsWith('/uploads')) {
                    // Rebuild using backend origin to avoid mixed-content or wrong host
                    return `${backend.protocol}//${backend.host}${abs.pathname}${abs.search || ''}`;
                }
                return u;
            } catch {
                return u;
            }
        }

        // Otherwise treat as relative path and prefix backend origin
        const path = u.startsWith('/') ? u : `/${u}`;
        return `${backendOrigin}${path}`;
    };

    // Helper function to convert number to letter (0 -> A, 1 -> B, etc.)
    const getLetterFromIndex = (index) => {
        return String.fromCharCode(65 + index); // 65 is ASCII code for 'A'
    };

    const validatePass = () => {
        const v = formData.percentage_to_pass;
        const isValid = v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0 && Number(v) <= 100);
        setPassError(isValid ? '' : 'Pass percentage must be an integer between 0 and 100');
        return isValid;
    };

    // Build section pages for preview: start with top-level section, then split on sections after questions
    const builtSections = React.useMemo(() => {
        const pages = [];
        if (!Array.isArray(questions)) return pages;
        const topSections = (sections || []).filter(s => s.afterIndex === -1);
        const afterMap = new Map();
        (sections || []).forEach(s => { if (s.afterIndex >= 0) afterMap.set(s.afterIndex, s); });

        let current = { section: topSections[0] || { description: '' }, questions: [] };
        questions.forEach((q, idx) => {
            current.questions.push({ ...q, __index: idx });
            if (afterMap.has(idx)) {
                pages.push(current);
                current = { section: afterMap.get(idx) || { description: '' }, questions: [] };
            }
        });
        // Push last page if it has content or a section description
        if (current.questions.length > 0 || (current.section && (current.section.description || '').trim())) {
            pages.push(current);
        }
        // If no pages, add one empty page (allows preview open gracefully)
        if (pages.length === 0) pages.push({ section: { description: '' }, questions: [] });
        return pages;
    }, [sections, questions]);

    // Push mapped sections (title, description, questions) to parent for payload
    useEffect(() => {
        if (typeof setSectionsPayload !== 'function') return;
        const toPlain = (html) => String(html || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        const mapped = (builtSections || []).map(p => ({
            title: (p.section?.title || '').toString(),
            description: toPlain(p.section?.description || ''),
            questions: (p.questions || []).map(q => ({
                question_text: q.question_text || '',
                type: q.type || '',
                options: Array.isArray(q.options) ? q.options : [],
                // correct_option can be string/number/array here; parent will normalize
                correct_option: q.correct_option,
                total_points: Number.isFinite(q.total_points) ? q.total_points : 1,
              }))
        }));
        setSectionsPayload(mapped);
    }, [builtSections, setSectionsPayload]);

    // Reset preview index when opening
    React.useEffect(() => {
        if (assessmentPreviewOpen) setSectionPreviewIndex(0);
    }, [assessmentPreviewOpen]);

    // Reset sections when creating a new assessment or ensure at least one section exists
    useEffect(() => {
        if (showForm) {
            if (!currentAssessment) {
                // Creating new assessment - start with one default section
                setSections([{ afterIndex: -1, title: '', description: '' }]);
            } else {
                // Editing existing assessment - ensure at least one section exists for organization
                setSections(prev => prev.length > 0 ? prev : [{ afterIndex: -1, title: '', description: '' }]);
            }
        }
    }, [currentAssessment, showForm]);

    return (
        <>
        <div className="addOrg-modal-overlay">
            <div className="addOrg-modal-content">
                {/* Modal Header */}
                <div className="assess-modal-header">
                    <div className="assess-modal-header-content">
                        <div className="assess-modal-icon">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2>{currentAssessment ? "Edit Assessment" : "Create New Assessment"}</h2>
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
                                            Assessment Title<span className="assess-required">*</span>
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
                                        <label className="assess-form-label">Tags<span className="assess-required">*</span></label>
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
                                                                {/* <X size={12} /> */} X
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>

                                <div className="assess-form-group">
                                    <label className="assess-form-label">Description<span className="assess-required">*</span></label>
                                    <textarea
                                        className="assess-form-textarea"
                                        placeholder="Provide a detailed description of this assessment"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            <button className='btn-primary' style={{ width: '70%', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => enhanceTexthelper(formData.title, formData.description)}>{aiProcessing ? "Please Wait.." : "Create with AI ✨"}</button>


                                {/* Thumbnail upload */}
                                <div className="assess-form-group">
                                    <label className="assess-form-label">Thumbnail</label>

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
                                                        try { if ((formData.thumbnail_url || '').startsWith('blob:')) URL.revokeObjectURL(formData.thumbnail_url); } catch {}
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
                                                id="assess-thumb-input"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files && e.target.files[0];
                                                    if (!file) return;
                                                    const blobUrl = URL.createObjectURL(file);
                                                    setFormData({ ...formData, thumbnail_url: blobUrl, thumbnail_file: file });
                                                }}
                                            />
                                            <label htmlFor="assess-thumb-input" className="assess-upload-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
      

                        {/* Questions Section */}
                        {step === 2 && <div className="assess-form-section">
                            <div className="assess-questions-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {/* <h3 className="assess-section-title" style={{ margin: 0 }}>Questions ({questions.length})</h3> */}
                               
                            </div>

                            {/* Top-level sections before the first question */}
                            {sections.map((s, sIdx) => s.afterIndex === -1 && (
                                <div key={`sec-top-${sIdx}`} className="assess-question-card">
                                    <div className="assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                        <span className="assess-question-number">Section {getSectionNumberForSectionIndex(sIdx)} of {getTotalSections()}</span>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                            {(sections.filter(sec => sec.afterIndex === -1).length > 1) && (
                                                <button
                                                    type="button"
                                                    className="assess-remove-question"
                                                    onClick={() => removeSection(sIdx)}
                                                    title="Remove Section"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="assess-form-group">
                                        <label className="assess-form-label">Section Title</label>
                                        <input
                                            type="text"
                                            className="assess-form-input"
                                            placeholder="Enter section title"
                                            value={s.title || ''}
                                            onChange={(e) => updateSection(sIdx, 'title', e.target.value)}
                                        />
                                        {/* <label className="assess-form-label">Section Description</label> */}
                                        <RichText
                                            value={s.description || ''}
                                            onChange={(html) => updateSection(sIdx, 'description', html)}
                                            placeholder="Describe this section"
                                        />
                                    </div>
                                    <div className="assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                        {(() => {
                                            const plain = String(s.description || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                                            const ready = plain.length > 0;
                                            return (
                                                <button
                                                    type="button"
                                                    className="survey-assess-btn-secondary"
                                                    onClick={() => addQuestionAfter(-1)}
                                                    disabled={!ready}
                                                    title={ready ? undefined : 'Enter section text to enable adding a question'}
                                                >
                                                    <Plus size={14} /> Add Question
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}

                            <div className="assess-questions-container">
                                {questions.map((q, qIndex) => (
                                    <React.Fragment key={qIndex}>
                                        <div className="assess-question-card">
                                        <div className="assess-question-header">
                                            {(() => { const secIdx = getSectionIndexForQuestion(qIndex); const qNum = getQuestionNumberWithinSection(qIndex); return (
                                                <span className="assess-question-number">Question {qNum} of Section {secIdx}</span>
                                            ); })()}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className="assess-duplicate-question"
                                                    title="Duplicate Question"
                                                    onClick={() => duplicateQuestion(qIndex)} style={{ display: 'flex', gap: 8,border: '1px solid #e2e8f0',borderRadius: '8px' }}
                                                > 
                                                    <Copy size={16} />  Duplicate
                                                </button>
                                                {questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="assess-remove-question"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        title="Remove Question"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Container with left side for inputs and right side for preview */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                            <div style={{ flex: 2 }}>
                                                {/* Optional Instructions (above Question Type) */}
                                                <div className="assess-form-group">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label className="assess-form-label" style={{ marginBottom: 0 }}>Instructions (optional)</label>
                                                        <button
                                                            type="button"
                                                            className="survey-assess-btn-secondary"
                                                            style={{ padding: '6px 10px', fontSize: 15, fontWeight: 'bold' }}
                                                            onClick={() => setInstructionsOpen(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                                                        >
                                                            {instructionsOpen[qIndex] || !!q.instructions ? 'Hide' : 'Add'} Instructions
                                                        </button>
                                                    </div>
                                                    {(instructionsOpen[qIndex] || !!q.instructions) && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                                                                <button
                                                                    type="button"
                                                                    className="assess-remove-question"
                                                                    aria-label="Close instructions"
                                                                    title="Close instructions"
                                                                    onClick={() => {
                                                                        // Clear instruction text and hide the instruction box
                                                                        updateQuestionField(qIndex, 'instructions', '');
                                                                        setInstructionsOpen(prev => ({ ...prev, [qIndex]: false }));
                                                                    }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                            <div className="assess-instructions-box">
                                                                <RichText
                                                                    value={q.instructions || ''}
                                                                    onChange={(html) => updateQuestionField(qIndex, 'instructions', html)}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Question Type */}
                                                <div className="assess-form-group">
                                                    <label className="assess-form-label" style={{marginTop:"10px"}}>Question Type<span className="assess-required">*</span></label>
                                                    <select
                                                        className="assess-form-input"
                                                        value={q.type}
                                                        onChange={e => updateQuestionField(qIndex, 'type', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="Multiple Choice">Multiple Choice</option>
                                                        <option value="Multi Select">Multi Select</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attach File + Upload */}
                                        <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                            <label className="assess-form-label">Attach File (Optional)</label>
                                            <div
                                                className="assess-file-upload-container"
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                            >
                                                <select
                                                    className="assess-form-select"
                                                    value={q.file_url || ''}
                                                    onChange={e => updateQuestionField(qIndex, 'file_url', e.target.value)}
                                                >
                                                    <option value="">No file selected</option>
                                                    {/* Show existing file option if it's not part of uploadedFiles list */}
                                                    {q.file_url && !uploadedFiles.includes(q.file_url) && (
                                                        <option value={q.file_url}>
                                                            {q.file_url.split('/').pop() || 'Current File'}
                                                        </option>
                                                    )}
                                                    {uploadedFiles.map((fUrl, i) => (
                                                        <option key={i} value={fUrl}>
                                                            {`Uploaded File ${i + 1}`}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div
                                                    className="assess-file-upload"
                                                    style={{ position: 'relative' }}
                                                >
                                                    <input
                                                        type="file"
                                                        id={`file-${qIndex}`}
                                                        className="assess-file-input"
                                                        onChange={e => handleFileUpload(e, qIndex)}
                                                    />
                                                    <label
                                                        htmlFor={`file-${qIndex}`}
                                                        className="assess-file-label"
                                                        style={{
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                        }}
                                                    >
                                                        <Upload size={16} />
                                                        Upload File
                                                    </label>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="assess-preview-toggle"
                                                    title="Preview File"
                                                    onClick={() => setPreviewOpen(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                                                    disabled={!q.file_url}
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    <Eye size={16} /> {previewOpen[qIndex] ? 'Hide Preview' : 'Preview'}
                                                </button>
                                            </div>

                                            {/* File name display */}
                                            {q.file_url && (
                                                <div
                                                    style={{
                                                        marginTop: '6px',
                                                        fontSize: '0.9rem',
                                                        color: '#64748b',
                                                    }}
                                                >
                                                    File: {q.file_url.split('/').pop()}
                                                </div>
                                            )}
                                        </div>


                                        {/* Preview overlay (opens on clicking Preview; closes with X) */}
                                        {previewOpen[qIndex] && (
                                            <div className="assess-file-preview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPreviewOpen(prev => ({ ...prev, [qIndex]: false })); }}>
                                                <div className="assess-file-preview-modal">
                                                    <div className="assess-file-preview-header">
                                                        <span className="assess-file-preview-title">File Preview</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewOpen(prev => ({ ...prev, [qIndex]: false }))}
                                                            aria-label="Close file preview"
                                                            className="assess-file-preview-close"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                    <div className="assess-file-preview-body">
                                                        {q.file_url ? (
                                                            <>
                                                                {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                                                    <img src={resolveUrl(q.file_url)} alt="Preview" />
                                                                )}
                                                                {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                                                    <video src={resolveUrl(q.file_url)} controls />
                                                                )}
                                                                {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                                                    <audio src={resolveUrl(q.file_url)} controls />
                                                                )}
                                                                {q.file_url.match(/\.pdf$/i) && (
                                                                    <iframe src={resolveUrl(q.file_url)} title="PDF Preview" />
                                                                )}
                                                                {!q.file_url.match(/\.(jpeg|jpg|png|gif|mp4|webm|ogg|mp3|wav|pdf)$/i) && (
                                                                    <div>
                                                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 6 }}>
                                                                            Preview not supported for this file type.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p>No file attached.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                        {/* Question Text */}
                                        <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                            <label className="assess-form-label">
                                                Question Text<span className="assess-required">*</span>
                                            </label>
                                            <textarea
                                                className="assess-form-textarea"
                                                placeholder="Enter your question here..."
                                                rows={2}
                                                value={q.question_text}
                                                onChange={e => updateQuestionField(qIndex, 'question_text', e.target.value)}
                                                required
                                            />
                                        </div>
                                        {/* Answer Options and Correct Answer Index */}
                                        <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                            <label className="assess-form-label">Answer Options</label>
                                            {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && <div className="assess-options-container">
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}>
                                                        <div className="assess-option-index">{getLetterFromIndex(optIndex)}</div>
                                                        <input
                                                            type="text"
                                                            className="assess-form-input"
                                                            placeholder={`Option ${getLetterFromIndex(optIndex)}`}
                                                            value={opt}
                                                            onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                                                            required
                                                        />
                                                        {q.options.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="assess-remove-option"
                                                                onClick={() => removeOption(qIndex, optIndex)}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    className="assess-add-option"
                                                    onClick={() => addOption(qIndex)}
                                                >
                                                    <Plus size={14} />
                                                    Add Option
                                                </button>
                                                {/* Correct Answer Index(es) + Save aligned right */}
                                                <div className="assess-correct-row">
                                                    <div className="assess-form-group assess-correct-group">
                                                        <label className="assess-form-label">{q.type === 'Multi Select' ? 'Correct Answer ' : 'Correct Answer '}</label>
                                                        <input
                                                            type="text"
                                                            className="assess-form-input"
                                                            placeholder={q.type === 'Multi Select' ? 'e.g., A,C for multiple' : 'e.g., A'}
                                                            value={
                                                                (() => {
                                                                    if (Array.isArray(q.correct_option)) {
                                                                        return q.correct_option.map(idx => {
                                                                            if (typeof idx === 'number') {
                                                                                return getLetterFromIndex(idx);
                                                                            }
                                                                            return getLetterFromIndex(0); // fallback
                                                                        }).join(',');
                                                                    }
                                                                    if (typeof q.correct_option === 'number') {
                                                                        return getLetterFromIndex(q.correct_option);
                                                                    }
                                                                    if (typeof q.correct_option === 'string' && q.correct_option !== '') {
                                                                        // If it's already a letter string, return as-is
                                                                        return q.correct_option.toUpperCase();
                                                                    }
                                                                    return '';
                                                                })()
                                                            }
                                                            onChange={e => {
                                                                const value = e.target.value.toUpperCase();
                                                                // Allow letters A-Z, commas, and spaces
                                                                if (/^[A-Z,\s]*$/.test(value) || value === '') {
                                                                    updateQuestionField(qIndex, 'correct_option', value);
                                                                }
                                                            }}
                                                            onBlur={e => {
                                                                // Parse and normalize on blur - convert letters to numbers for backend
                                                                const raw = String(e.target.value || '');
                                                                const parts = raw.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
                                                                if (parts.length === 0) {
                                                                    updateQuestionField(qIndex, 'correct_option', '');
                                                                    return;
                                                                }
                                                                if (parts.length > 1) {
                                                                    const arr = parts
                                                                        .map(s => {
                                                                            if (/^[A-Z]$/.test(s)) {
                                                                                return s.charCodeAt(0) - 65;
                                                                            }
                                                                            return -1;
                                                                        })
                                                                        .filter(n => n >= 0);
                                                                    const uniqueSorted = Array.from(new Set(arr)).sort((a, b) => a - b);
                                                                    updateQuestionField(qIndex, 'correct_option', uniqueSorted);
                                                                } else {
                                                                    if (/^[A-Z]$/.test(parts[0])) {
                                                                        const letterIndex = parts[0].charCodeAt(0) - 65;
                                                                        updateQuestionField(qIndex, 'correct_option', letterIndex);
                                                                    } else {
                                                                        updateQuestionField(qIndex, 'correct_option', '');
                                                                    }
                                                                }
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                </div>



                                            </div>}

                                            {/* Footer actions similar to Surveys: Add Question + Add Section gated by readiness */}
                                            <div className="assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                                {(() => {
                                                    const textOk = !!(q.question_text || '').trim();
                                                    const optsOk = Array.isArray(q.options) && q.options.filter(o => (o || '').trim()).length >= 2;
                                                    const qReady = textOk && optsOk;
                                                    const hint = qReady ? undefined : 'Enter question text and at least two options to enable';
                                                    return (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="survey-assess-btn-secondary"
                                                                onClick={() => addQuestionAfter(qIndex)}
                                                                disabled={!qReady}
                                                                title={hint}
                                                            >
                                                                <Plus size={14} /> Add Question
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="survey-assess-btn-secondary"
                                                                onClick={() => addSectionAfter(qIndex)}
                                                                disabled={!qReady}
                                                                title={hint}
                                                            >
                                                                <Plus size={14} /> Add Section
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="assess-btn-primary assess-save-inline"
                                                                title={qReady ? 'Save and Preview this question' : hint}
                                                                onClick={() => setQuestionPreviewIndex(qIndex)}
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
                                        {/* Render sections that come after this question */}
                                        {sections.map((sec, sIdx) => (
                                            sec.afterIndex === qIndex && (
                                                <div key={`sec-after-${qIndex}-${sIdx}`} className="assess-question-card">
                                                    <div className="assess-question-header" style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span className="assess-question-number">Section {getSectionNumberForSectionIndex(sIdx)} of {getTotalSections()}</span>
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                            <button
                                                                type="button"
                                                                className="assess-remove-question"
                                                                onClick={() => removeSection(sIdx)}
                                                                title="Remove Section"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="assess-form-group">
                                                        <label className="assess-form-label">Section Title</label>
                                                        <input
                                                            type="text"
                                                            className="assess-form-input"
                                                            placeholder="Enter section title"
                                                            value={sec.title || ''}
                                                            onChange={(e) => updateSection(sIdx, 'title', e.target.value)}
                                                        />
                                                        {/* <label className="assess-form-label">Section Description</label> */}
                                                        <RichText
                                                            value={sec.description || ''}
                                                            onChange={(html) => updateSection(sIdx, 'description', html)}
                                                            placeholder="Describe this section"
                                                        />
                                                    </div>
                                                    <div className="assess-correct-row" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                                                        {(() => {
                                                            const plain = String(sec.description || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                                                            const ready = plain.length > 0;
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    className="survey-assess-btn-secondary"
                                                                    onClick={() => addQuestionAfter(qIndex)}
                                                                    disabled={!ready}
                                                                    title={ready ? undefined : 'Enter section text to enable adding a question'}
                                                                >
                                                                    <Plus size={14} /> Add Question
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>}
                        {/* next info */}
                        {step === 3 && <div className='assess-form-section'>
                            <div className="assess-form-grid">

                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Duration<span className="assess-required">*</span>
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            inputMode="numeric"
                                            className="assess-form-input"
                                            style={{ width: 140 }}
                                            placeholder="Enter minutes"
                                            value={(parseHm(formData.duration).hh * 60) + parseHm(formData.duration).mm}
                                            onChange={e => {
                                                const raw = parseInt(e.target.value, 10);
                                                const totalMin = Number.isNaN(raw) ? 0 : Math.max(0, raw);
                                                const hh = Math.floor(totalMin / 60);
                                                const mm = totalMin % 60;
                                                setFormData({ ...formData, duration: formatHm(hh, mm) });
                                            }}
                                            onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                                            required
                                        />
                                        <span>minutes</span>
                                    </div>
                                    <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        Enter total minutes 
                                    </small>
                                </div>

                                <div className="assess-form-group">
                                    <label className="assess-form-label">Attempts<span className="assess-required">*</span></label>
                                    <select
                                        className="assess-form-select"
                                        value={formData.unlimited_attempts ? '100' : (formData.attempts || '')}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (value === '100') {
                                                // Unlimited attempts
                                                setFormData({
                                                    ...formData,
                                                    unlimited_attempts: true,
                                                    attempts: 100,
                                                    // If display answers is enabled and unlimited is chosen, default to AfterPassing
                                                    display_answers_when: formData.display_answers
                                                        ? 'AfterPassing'
                                                        : formData.display_answers_when,
                                                });
                                            } else {
                                                // Limited attempts
                                                const numValue = parseInt(value, 10);
                                                setFormData({
                                                    ...formData,
                                                    unlimited_attempts: false,
                                                    attempts: Number.isNaN(numValue) ? 1 : Math.max(1, numValue),
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">Select Attempts</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                        <option value="100">Unlimited</option>
                                    </select>
                                </div>
                            </div>
                            <div className="assess-form-grid">

                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Team<span className="assess-required">*</span>
                                    </label>
                                    <select
                                        className="assess-form-select"
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

                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Sub-Team<span className="assess-required">*</span>
                                    </label>
                                    <select
                                        className="assess-form-select"
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
                            <div className="assess-form-grid">
                                <div className="assess-form-group">
                                    <label className="assess-form-label">Pass Percentage (0-100)<span className="assess-required">*</span></label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="assess-form-input"
                                        value={formData.percentage_to_pass || ''}
                                        onChange={e => {
                                            const value = e.target.value;
                                            // Allow empty string or numeric input
                                            if (value === '' || /^\d+$/.test(value)) {
                                                setFormData({
                                                    ...formData,
                                                    percentage_to_pass: value === '' ? '' : parseInt(value, 10),
                                                });
                                            }
                                            if (passError) setPassError('');
                                        }}
                                        onKeyDown={e => {
                                            // Allow backspace, delete, tab, escape, enter, and numbers
                                            if (!['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !/^\d$/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        placeholder="Enter the percentage"
                                    />
                                    <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        Enter an integer between 0 and 100
                                    </small>
                                    {passError && (
                                        <div style={{ color: '#dc2626', marginTop: 6, fontSize: '0.875rem' }}>{passError}</div>
                                    )}
                                </div>
                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Display Answers <span className="assess-required">*</span>
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
                                        {/* <option value="AfterDueDate">After due date</option> */}
                                        {/* <option value="Always">Always</option> */}
                                        <option value="Never">Never</option>
                                    </select>
                                </div>
                            </div>

                          
                        </div>}

                        {/* Form Actions */}
                        <div className="assess-form-actions">
                            {step === 3 ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                           <ChevronLeft size={16}/>Previous 
                            </button>}
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => setAssessmentPreviewOpen(true)}
                                            title="Preview the entire assessment as the user sees it"
                                        >
                                            <Eye size={16} />
                                            <span>Preview Assessment</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => {
                                                if (!validatePass()) {
                                                    if (step !== 1) setStep(1);
                                                    return;
                                                }
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
                                            title="Save this assessment as Draft"
                                        >
                                            <FileText size={16} />
                                            <span>Save as Draft</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary"
                                            onClick={() => {
                                                if (!validatePass()) {
                                                    if (step !== 1) setStep(1);
                                                    return;
                                                }
                                                if (currentAssessment) {
                                                    handleUpdateAssessment();
                                                } else {
                                                    handleSaveAssessment();
                                                }
                                            }}
                                        >
                                            <FileText size={16} />
                                            <span>{currentAssessment ? "Update Assessment" : "Create Assessment"}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                {step > 1 && <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
                           <ChevronLeft size={16}/>Previous 
                            </button>}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%' ,gap:"10px   "}}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                {step < 3 && <button type="button" className="btn-primary" onClick={() => setStep(step + 1)}>
                                Next <ChevronRight size={16}/>
                            </button>}
                                </div>
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Question Preview Modal (end-user view) */}
        {questionPreviewIndex !== null && questions[questionPreviewIndex] && (
            <div className="assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setQuestionPreviewIndex(null); }}>
                <div className="assess-qpreview-modal">
                    <div className="assess-qpreview-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Eye size={16} />
                            <span className="assess-qpreview-title">Question Preview</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setQuestionPreviewIndex(null)}
                            aria-label="Close preview"
                            className="assess-qpreview-close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {(() => {
                        const q = questions[questionPreviewIndex];
                        return (
                            <div className="assess-qpreview-body">
                                {/* Instructions */}
                                {q.instructions && (
                                    <div className="assess-qpreview-section">
                                        <div className="label">Instructions</div>
                                        <div className="assess-qpreview-instructions">{q.instructions}</div>
                                    </div>
                                )}

                                

                                <div className="assess-qpreview-section" >

                                    <div className="label" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <span>Question</span>
                                        <span className="assess-qpreview-badge" style={{marginLeft: 'auto'}}>{q.type || '—'}</span>
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a' }}>{q.question_text || '—'}</div>
                                </div>
                                {/* Attached media */}
                                {q.file_url && (
                                    <div className="assess-qpreview-section assess-qpreview-media">
                                        {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                            <img src={resolveUrl(q.file_url)} alt="Question media" />
                                        )}
                                        {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                            <video src={resolveUrl(q.file_url)} controls />
                                        )}
                                        {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                            <audio src={resolveUrl(q.file_url)} controls />
                                        )}
                                        {q.file_url.match(/\.pdf$/i) && (
                                            <iframe src={resolveUrl(q.file_url)} title="PDF" />
                                        )}
                                    </div>
                                )}
                                {/* Options (end-user view: not showing correct answers) */}
                                {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && Array.isArray(q.options) && q.options.length > 0 && (
                                    <div className="assess-qpreview-section">
                                        <div className="label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            Options
                                           
                                        </div>
                                        <div className="assess-qpreview-options">
                                            {(() => {
                                                // Always show shuffled options in preview
                                                const displayOptions = [...q.options].sort(() => 0.5 - Math.random());
                                                return displayOptions.map((opt, idx) => (
                                                    <label key={idx} className="assess-qpreview-option">
                                                        <input type={q.type === 'Multi Select' ? 'checkbox' : 'radio'} disabled name={`preview-q-${questionPreviewIndex}`} />
                                                        <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                            <span style={{fontWeight: 'bold', color: '#374151', minWidth: '20px'}}>
                                                                {getLetterFromIndex(idx)}.
                                                            </span>
                                                            <span>{opt || `Option ${getLetterFromIndex(idx)}`}</span>
                                                        </span>
                                                    </label>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
          {/* Assessment Preview Modal (exact Survey UI with media) */}
          {assessmentPreviewOpen && (
            <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAssessmentPreviewOpen(false); }}>
                <div className="survey-assess-apreview-modal">
                    <div className="survey-assess-qpreview-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Eye size={16} />
                            <span className="survey-assess-qpreview-title">Assessment Preview </span>
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

                        {(() => {
                            const s = builtSections[Math.min(sectionPreviewIndex, builtSections.length - 1)] || { section: {}, questions: [] };
                            return (
                                <>
                                    {/* Section Description inside a card (rich text) */}
                                    {(s.section?.title || s.section?.description) && (
                                        <div className="survey-assess-qpreview-section">
                                            <div className="survey-gforms-card">
                                                <div className="survey-gforms-card-body">
                                                    {s.section?.title && (<div className="label" style={{ fontWeight: 700, marginBottom: 6 }}>{s.section.title}</div>)}
                                                    {s.section?.description && (
                                                        <div style={{ color: '#334155' }}
                                                             dangerouslySetInnerHTML={{ __html: s.section.description }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items within the section: questions only for assessments */}
                                    {s.questions.map((q, idx) => (
                                        <div key={`sec-${sectionPreviewIndex}-item-${idx}`} className="survey-assess-qpreview-section">
                                            <div className="survey-gforms-card">
                                                <div className="survey-gforms-card-body">
                                                    {/* Instructions (HTML) */}
                                                    {q.instructions && (
                                                        <div
                                                            className="survey-assess-qpreview-instructions"
                                                            style={{ color: '#334155', marginBottom: 6 }}
                                                            dangerouslySetInnerHTML={{ __html: q.instructions }}
                                                        />
                                                    )}
                                                    <div className="survey-gforms-question-title">{q.question_text || '—'}</div>

                                                    {/* Media (assessment extra) */}
                                                    {q.file_url && (
                                                        <div className="survey-assess-form-group" style={{ marginTop: 8 }}>
                                                            {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                                                <img src={resolveUrl(q.file_url)} alt="Question media" style={{ maxWidth: '100%', borderRadius: 6 }} />
                                                            )}
                                                            {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                                                <video src={resolveUrl(q.file_url)} controls style={{ width: '100%', borderRadius: 6 }} />
                                                            )}
                                                            {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                                                <audio src={resolveUrl(q.file_url)} controls style={{ width: '100%' }} />
                                                            )}
                                                            {q.file_url.match(/\.pdf$/i) && (
                                                                <iframe src={resolveUrl(q.file_url)} title="PDF Preview" style={{ width: '100%', height: 360, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                                                            )}
                                                        </div>
                                                    )}

                                                    {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && Array.isArray(q.options) && q.options.length > 0 && (
                                                        <div className="survey-assess-qpreview-options">
                                                            {(() => {
                                                                const qKey = `q-${q.__index ?? idx}`;
                                                                const isMulti = q.type === 'Multi Select';
                                                                // Build or reuse a stable shuffle order for this question key
                                                                if (!previewShuffleRef.current[qKey]) {
                                                                    const order = q.options.map((_, i) => i);
                                                                    // Fisher-Yates shuffle for stability
                                                                    for (let i = order.length - 1; i > 0; i--) {
                                                                        const j = Math.floor(Math.random() * (i + 1));
                                                                        [order[i], order[j]] = [order[j], order[i]];
                                                                    }
                                                                    previewShuffleRef.current[qKey] = order;
                                                                }
                                                                const order = previewShuffleRef.current[qKey];
                                                                const displayOptions = order.map((originalIndex, displayIndex) => ({ opt: q.options[originalIndex], originalIndex, displayIndex }));
                                                                return displayOptions.map(({ opt, originalIndex, displayIndex }) => {
                                                                    const selected = previewResponses[qKey];
                                                                    const checked = isMulti
                                                                        ? Array.isArray(selected) && selected.includes(originalIndex)
                                                                        : selected === originalIndex;
                                                                    const onChange = (e) => {
                                                                        setPreviewResponses(prev => {
                                                                            if (isMulti) {
                                                                                const arr = Array.isArray(prev[qKey]) ? [...prev[qKey]] : [];
                                                                                const i = arr.indexOf(originalIndex);
                                                                                if (e.target.checked && i === -1) arr.push(originalIndex);
                                                                                if (!e.target.checked && i !== -1) arr.splice(i, 1);
                                                                                return { ...prev, [qKey]: arr };
                                                                            } else {
                                                                                return { ...prev, [qKey]: originalIndex };
                                                                            }
                                                                        });
                                                                    };
                                                                    return (
                                                                        <label key={`sec-${sectionPreviewIndex}-q-${idx}-opt-${originalIndex}`} className="survey-assess-qpreview-option">
                                                                            <input
                                                                                type={isMulti ? 'checkbox' : 'radio'}
                                                                                name={`sec-${sectionPreviewIndex}-q-${idx}`}
                                                                                checked={!!checked}
                                                                                onChange={onChange}
                                                                            />
                                                                            <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                                                <span style={{fontWeight: 'bold', color: '#374151', minWidth: '20px'}}>
                                                                                    {getLetterFromIndex(displayIndex)}.
                                                                                </span>
                                                                                <span className="opt-text">{opt || `Option ${displayIndex + 1}`}</span>
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

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

        {/* Single Question Preview Modal (Survey UI) */}
        {questionPreviewIndex !== null && questions[questionPreviewIndex] && (
            <div className="survey-assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setQuestionPreviewIndex(null); }}>
                <div className="assess-qpreview-modal">
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
                        const q = questions[questionPreviewIndex];
                        const qKey = `__single_${questionPreviewIndex}`;
                        const isMulti = q.type === 'Multi Select';
                        const selected = previewResponses[qKey];
                        const handleChange = (originalIndex, checked) => {
                            setPreviewResponses(prev => {
                                if (isMulti) {
                                    const arr = Array.isArray(prev[qKey]) ? [...prev[qKey]] : [];
                                    const i = arr.indexOf(originalIndex);
                                    if (checked && i === -1) arr.push(originalIndex);
                                    if (!checked && i !== -1) arr.splice(i, 1);
                                    return { ...prev, [qKey]: arr };
                                }
                                return { ...prev, [qKey]: originalIndex };
                            });
                        };
                        const displayOptions = Array.isArray(q.options)
                            ? q.options.map((opt, originalIndex) => ({ opt, originalIndex }))
                            : [];
                        return (
                            <div className="survey-assess-qpreview-body">
                                <div className="survey-gforms-container">
                                    <div className="survey-gforms-card">
                                        <div className="survey-gforms-card-body">
                                            {/* Instructions (HTML) */}
                                            {q.instructions && (
                                                <div
                                                    className="survey-assess-qpreview-instructions"
                                                    style={{ color: '#334155', marginBottom: 6 }}
                                                    dangerouslySetInnerHTML={{ __html: q.instructions }}
                                                />
                                            )}
                                            {/* Question text */}
                                            <div className="survey-gforms-question-title">{q.question_text || '—'}</div>
                                            {/* Media (if any) */}
                                            {q.file_url && (
                                                <div className="survey-assess-form-group" style={{ marginTop: 8 }}>
                                                    {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                                        <img src={resolveUrl(q.file_url)} alt="Question media" style={{ maxWidth: '100%', borderRadius: 6 }} />
                                                    )}
                                                    {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                                        <video src={resolveUrl(q.file_url)} controls style={{ width: '100%', borderRadius: 6 }} />
                                                    )}
                                                    {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                                        <audio src={resolveUrl(q.file_url)} controls style={{ width: '100%' }} />
                                                    )}
                                                    {q.file_url.match(/\.pdf$/i) && (
                                                        <iframe src={resolveUrl(q.file_url)} title="PDF" style={{ width: '100%', height: 360, border: '1px solid #e2e8f0', borderRadius: 6 }} />
                                                    )}
                                                </div>
                                            )}
                                            {/* Options (selectable, shuffled) */}
                                            {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && displayOptions.length > 0 && (
                                                <div className="survey-assess-qpreview-options" style={{ marginTop: 8 }}>
                                                    {displayOptions.map(({ opt, originalIndex }, displayIndex) => {
                    
                                                        const checked = isMulti
                                                            ? Array.isArray(selected) && selected.includes(originalIndex)
                                                            : selected === originalIndex;
                                                        return (
                                                            <label key={`single-prev-q-${questionPreviewIndex}-opt-${originalIndex}`} className="survey-assess-qpreview-option">
                                                                <input
                                                                    type={isMulti ? 'checkbox' : 'radio'}
                                                                    name={`single-prev-q-${questionPreviewIndex}`}
                                                                    checked={!!checked}
                                                                    onChange={(e) => handleChange(originalIndex, e.target.checked)}
                                                                />
                                                                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                                    <span style={{fontWeight: 'bold', color: '#374151', minWidth: '20px'}}>
                                                                        {getLetterFromIndex(displayIndex)}.
                                                                    </span>
                                                                    <span className="opt-text">{opt || `Option ${displayIndex + 1}`}</span>
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
        
        </>
    );
};

export default QuestionsForm;
