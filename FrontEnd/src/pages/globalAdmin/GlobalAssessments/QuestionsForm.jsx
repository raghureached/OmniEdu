import React, { useEffect, useState } from 'react';
import { FileText, Plus, X, Upload, Copy, Eye } from 'lucide-react';
import api from '../../../services/api';
import './QuestionsForm.css';

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
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    handleFileUpload,
    duplicateQuestion,
    groups = [],
}) => {
    const [step, setStep] = useState(1);
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
                } else if (Object.values(previewOpen || {}).some(Boolean)) {
                    // Close all file previews
                    setPreviewOpen({});
                }
            }
        };
        const anyOpen = assessmentPreviewOpen || questionPreviewIndex !== null || Object.values(previewOpen || {}).some(Boolean);
        if (anyOpen) {
            document.addEventListener('keydown', handleKey);
            return () => document.removeEventListener('keydown', handleKey);
        }
    }, [assessmentPreviewOpen, questionPreviewIndex, previewOpen]);

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
                            <h2>{currentAssessment ? "Edit Assessment" : "Create New Assessment"}</h2>
                            <p className="assess-modal-subtitle">
                                {currentAssessment
                                    ? "Update assessment details and questions"
                                    : "Build a comprehensive assessment"}
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
                                        <label className="assess-form-label">Tags</label>
                                        <div className="assess-tag-picker">
                                            <div className="assess-tag-controls">
                                                <input
                                                    type="text"
                                                    className="assess-form-input"
                                                    placeholder="Type a tag and press Enter or click Add"
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
                                                <button
                                                    type="button"
                                                    className="assess-btn-secondary"
                                                    style={{ whiteSpace: 'nowrap' }}
                                                    onClick={() => {
                                                        const t = tagInput.trim();
                                                        if (!t) return;
                                                        const current = Array.isArray(formData.tags) ? formData.tags : [];
                                                        if (!current.includes(t)) {
                                                            setFormData({ ...formData, tags: [...current, t] });
                                                        }
                                                        setTagInput('');
                                                    }}
                                                >
                                                    Add
                                                </button>
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
                                    <label className="assess-form-label">Description</label>
                                    <textarea
                                        className="assess-form-textarea"
                                        placeholder="Provide a detailed description of this assessment"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                               
                            </div>}

                        {/* Questions Section */}
                        {step === 2 && <div className="assess-form-section">
                            <div className="assess-questions-header">
                                <h3 className="assess-section-title">Questions ({questions.length})</h3>
                            </div>

                            <div className="assess-questions-container">
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="assess-question-card">
                                        <div className="assess-question-header">
                                            <span className="assess-question-number">Question {qIndex + 1}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    className="assess-duplicate-question"
                                                    title="Duplicate Question"
                                                    onClick={() => duplicateQuestion(qIndex)}
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
                                                            className="assess-btn-secondary"
                                                            style={{ padding: '6px 10px', fontSize: 12 }}
                                                            onClick={() => setInstructionsOpen(prev => ({ ...prev, [qIndex]: !prev[qIndex] }))}
                                                        >
                                                            {instructionsOpen[qIndex] || !!q.instructions ? 'Hide' : 'Add'} Instructions
                                                        </button>
                                                    </div>
                                                    {(instructionsOpen[qIndex] || !!q.instructions) && (
                                                        <textarea
                                                            className="assess-form-textarea"
                                                            placeholder="Enter any instructions or context for this question (optional)"
                                                            rows={2}
                                                            value={q.instructions || ''}
                                                            onChange={e => updateQuestionField(qIndex, 'instructions', e.target.value)}
                                                            style={{ marginTop: 8 }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Question Type */}
                                                <div className="assess-form-group">
                                                    <label className="assess-form-label" style={{marginTop:"10px"}}>Question Type</label>
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
                                                        <div className="assess-option-index">{optIndex}</div>
                                                        <input
                                                            type="text"
                                                            className="assess-form-input"
                                                            placeholder={`Option ${optIndex + 1}`}
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
                                                        <label className="assess-form-label">{q.type === 'Multi Select' ? 'Correct Answer Indexes (comma-separated)' : 'Correct Answer Index'}</label>
                                                        <input
                                                            type="text"
                                                            className="assess-form-input"
                                                            placeholder={q.type === 'Multi Select' ? 'e.g., 0,2 for multiple' : 'e.g., 0'}
                                                            value={
                                                                Array.isArray(q.correct_option)
                                                                    ? q.correct_option.join(',')
                                                                    : q.correct_option ?? ''
                                                            }
                                                            onChange={e => {
                                                                // Keep raw text while typing so user can enter commas like "0,"
                                                                updateQuestionField(qIndex, 'correct_option', e.target.value);
                                                            }}
                                                            onBlur={e => {
                                                                // Parse and normalize on blur
                                                                const raw = String(e.target.value || '');
                                                                const parts = raw.split(',').map(s => s.trim()).filter(s => s.length > 0);
                                                                if (parts.length === 0) {
                                                                    updateQuestionField(qIndex, 'correct_option', '');
                                                                    return;
                                                                }
                                                                if (parts.length > 1) {
                                                                    const arr = parts
                                                                        .map(s => Number.parseInt(s, 10))
                                                                        .filter(n => Number.isInteger(n));
                                                                    const uniqueSorted = Array.from(new Set(arr)).sort((a, b) => a - b);
                                                                    updateQuestionField(qIndex, 'correct_option', uniqueSorted);
                                                                } else {
                                                                    const n = Number.parseInt(parts[0], 10);
                                                                    updateQuestionField(qIndex, 'correct_option', Number.isInteger(n) ? n : '');
                                                                }
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="assess-btn-primary assess-save-inline"
                                                        title="Save and Preview this question"
                                                        onClick={() => setQuestionPreviewIndex(qIndex)}
                                                    >
                                                        <Eye size={16} /> Preview Question
                                                    </button>
                                                </div>



                                            </div>}
                                            {/* No special UI for True/False; Multi Select handled via options + correct indexes */}
                                        </div>
                                        
                                    </div>
                                ))}
                                <button type="button" className="assess-btn-secondary" style={{ marginTop: '20px', width: 'fit-content', alignSelf: 'flex-end' }} onClick={addQuestion}>
                                    <Plus size={16} />
                                    Add Question
                                </button>
                            </div>
                        </div>}
                        {/* next info */}
                        {step === 3 && <div className='assess-form-section'>
                            <div className="assess-form-grid">

                                <div className="assess-form-group">
                                    <label className="assess-form-label">
                                        Duration<span className="assess-required">*</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <input
                                                type="number"
                                                min="0"
                                                max="23"
                                                step="1"
                                                inputMode="numeric"
                                                className="assess-form-input"
                                                style={{ width: 90 }}
                                                value={parseHm(formData.duration).hh}
                                                onChange={e => {
                                                    const raw = parseInt(e.target.value, 10);
                                                    const hh = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(23, raw));
                                                    const { mm } = parseHm(formData.duration);
                                                    setFormData({ ...formData, duration: formatHm(hh, mm) });
                                                }}
                                                onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                                                required
                                            />
                                            <span>hrs</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                step="1"
                                                inputMode="numeric"
                                                className="assess-form-input"
                                                style={{ width: 100 }}
                                                value={parseHm(formData.duration).mm}
                                                onChange={e => {
                                                    const raw = parseInt(e.target.value, 10);
                                                    const mm = Number.isNaN(raw) ? 0 : Math.max(0, Math.min(59, raw));
                                                    const { hh } = parseHm(formData.duration);
                                                    setFormData({ ...formData, duration: formatHm(hh, mm) });
                                                }}
                                                onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                                                required
                                            />
                                            <span>mins</span>
                                        </div>
                                    </div>
                                    <small style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        Format: HH:MM (e.g., 01:30 for 1 hour 30 minutes)
                                    </small>
                                </div>

                                <div className="assess-form-group">
                                    <label className="assess-form-label">Attempts</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        inputMode="numeric"
                                        className="assess-form-input"
                                        value={formData.attempts}
                                        onChange={e => {
                                            const n = parseInt(e.target.value, 10);
                                            setFormData({ ...formData, attempts: Number.isNaN(n) ? '' : Math.max(1, n) });
                                        }}
                                        onBlur={e => {
                                            const n = parseInt(e.target.value, 10);
                                            setFormData({ ...formData, attempts: Number.isNaN(n) ? 1 : Math.max(1, n) });
                                        }}
                                        onKeyDown={e => {
                                            // prevent non-integer characters commonly allowed by number inputs
                                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                                        }}
                                    />
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
                                        Sub-Team
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
                                        Enter an integer between 0 and 100
                                    </small>
                                    {passError && (
                                        <div style={{ color: '#dc2626', marginTop: 6, fontSize: '0.875rem' }}>{passError}</div>
                                    )}
                                </div>
                                <div className="assess-form-group">
                                    <label className="assess-form-label">Status</label>
                                    <select
                                        className="assess-form-select"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                    </select>
                                </div>
                            </div>



                            <div className="assess-form-grid">
                                <div className="assess-form-group">
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
                                                // if turning off, clear the when value to avoid confusion
                                                display_answers_when: val ? (formData.display_answers_when || 'after_submission') : '',
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
                            <button type="button" className="assess-btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            {step === 3 && (
                                <button
                                    type="button"
                                    className="assess-btn-secondary"
                                    onClick={() => setAssessmentPreviewOpen(true)}
                                    title="Preview the entire assessment as the user sees it"
                                >
                                    <Eye size={16} />
                                    <span>Preview Assessment</span>
                                </button>
                            )}
                            <button
                                type="button"
                                className="assess-btn-primary"
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

                                {/* Question text */}
                                <div className="assess-qpreview-section">
                                    <div className="label">Question</div>
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#0f172a' }}>{q.question_text || '—'}</div>
                                </div>

                                {/* Options (end-user view: not showing correct answers) */}
                                {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && Array.isArray(q.options) && q.options.length > 0 && (
                                    <div className="assess-qpreview-section">
                                        <div className="label">Options</div>
                                        <div className="assess-qpreview-options">
                                            {q.options.map((opt, idx) => (
                                                <label key={idx} className="assess-qpreview-option">
                                                    <input type={q.type === 'Multi Select' ? 'checkbox' : 'radio'} disabled name={`preview-q-${questionPreviewIndex}`} />
                                                    <span>{opt || `Option ${idx + 1}`}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        )}
        {assessmentPreviewOpen && (
            <div className="assess-qpreview-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAssessmentPreviewOpen(false); }}>
                <div className="assess-qpreview-modal">
                    <div className="assess-qpreview-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Eye size={16} />
                            <span className="assess-qpreview-title">Assessment Preview</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAssessmentPreviewOpen(false)}
                            aria-label="Close preview"
                            className="assess-qpreview-close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="assess-qpreview-body">
                        {/* Compact header summary */}
                        <div className="assess-qpreview-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 9999, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.85rem' }}>
                                {formData.status || 'Draft'}
                            </span>
                            <div style={{ color: '#64748b' }}>
                                {(groups.find(t => String(t._id) === String(formData.team))?.name) || '—'}
                                {formData.subteam ? ` / ${(groups.find(t => String(t._id) === String(formData.team))?.subTeams || []).find(st => String(st._id) === String(formData.subteam))?.name || formData.subteam}` : ''}
                            </div>
                            {Array.isArray(formData.tags) && formData.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {formData.tags.map((t, i) => (
                                        <span key={`ph-tag-${i}`} className="assess-chip">{t}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Summary */}
                        <div className="assess-qpreview-section">
                            <div className="label">Title</div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{formData.title || '—'}</div>
                        </div>
                        {formData.description && (
                            <div className="assess-qpreview-section">
                                <div className="label">Description</div>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>{formData.description}</div>
                            </div>
                        )}
                        {Array.isArray(formData.tags) && formData.tags.length > 0 && (
                            <div className="assess-qpreview-section">
                                <div className="label">Tags</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {formData.tags.map((t, i) => (
                                        <span key={`p-tag-${i}`} className="assess-chip">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="assess-qpreview-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                            <div>
                                <div className="label">Duration</div>
                                <div>{formData.duration || '—'}</div>
                            </div>
                            <div>
                                <div className="label">Attempts</div>
                                <div>{formData.attempts ?? '—'}</div>
                            </div>
                            <div>
                                <div className="label">Pass Percentage</div>
                                <div>{Number.isInteger(formData.percentage_to_pass) ? `${formData.percentage_to_pass}%` : '—'}</div>
                            </div>
                            <div>
                                <div className="label">Display Answers</div>
                                <div>{formData.display_answers ? (formData.display_answers_when || 'AfterAssessment') : 'Never'}</div>
                            </div>
                        </div>
                        {/* Team/Subteam names */}
                        {formData.team && (
                            <div className="assess-qpreview-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                                <div>
                                    <div className="label">Team</div>
                                    <div>{(groups.find(t => String(t._id) === String(formData.team))?.name) || formData.team}</div>
                                </div>
                                {formData.subteam && (
                                    <div>
                                        <div className="label">Sub-Team</div>
                                        <div>{(groups.find(t => String(t._id) === String(formData.team))?.subTeams || []).find(st => String(st._id) === String(formData.subteam))?.name || formData.subteam}</div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Questions list */}
                        <div className="assess-qpreview-section">
                            <div className="label">Questions ({questions.length})</div>
                            <div className="assess-qpreview-questions">
                                {questions.map((q, idx) => (
                                    <div key={`pvq-${idx}`} className="assess-qpreview-card">
                                        {/* <div className="assess-qpreview-card-title">
                                            <span>{`Q${idx + 1}`}</span>
                                            <span className="assess-qpreview-badge">{q.type || '—'}</span>
                                        </div> */}
                                        {/* <div className="assess-qpreview-divider" /> */}

                                        {q.instructions && (
                                            <>
                                                <div className="label" style={{ fontWeight: 900, marginBottom: 6 }}>Instructions</div>
                                                <div className="assess-qpreview-instructions" style={{ marginBottom: 12 }}>
                                                    {q.instructions}
                                                </div>
                                            </>
                                        )}
                                        {q.file_url && (
                                            <div className="assess-qpreview-media" style={{ marginBottom: 10 }}>
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
                                                    <iframe src={resolveUrl(q.file_url)} title={`PDF-${idx}`} />
                                                )}
                                            </div>
                                        )}
                                        <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap', color: '#0f172a' }}>
                                        <span><b>{`Q${idx + 1}`}. </b></span>
                                            {q.question_text || '—'}</div>
                                        {(q.type === 'Multiple Choice' || q.type === 'Multi Select') && Array.isArray(q.options) && q.options.length > 0 && (
                                            <div className="assess-qpreview-options">
                                                {q.options.map((opt, oidx) => (
                                                    <label key={`pvq-${idx}-opt-${oidx}`} className="assess-qpreview-option">
                                                        <input type={q.type === 'Multi Select' ? 'checkbox' : 'radio'} disabled name={`pvq-${idx}`} />
                                                        <span>{opt || `Option ${oidx + 1}`}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default QuestionsForm;
