import React, { useState } from 'react';
import { FileText, Plus, X, Upload } from 'lucide-react';
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
    handleDeleteAssessment,
    updateQuestionField,
    addQuestion,
    removeQuestion,
    addOption,
    updateOption,
    removeOption,
    handleFileUpload,
}) => {
    const [step, setStep] = useState(1);

    return (
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
                                        <label className="assess-form-label">Classification</label>
                                        <input
                                            type="text"
                                            className="assess-form-input"
                                            placeholder="e.g., Technical, HR, General"
                                            value={formData.classification}
                                            onChange={e => setFormData({ ...formData, classification: e.target.value })}
                                        />
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

                                <div className="assess-form-grid">
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

                                    <div className="assess-form-group">
                                        <label className="assess-form-label">Date</label>
                                        <input
                                            type="date"
                                            className="assess-form-input"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
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
                                            {questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="assess-remove-question"
                                                    onClick={() => removeQuestion(qIndex)}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Container with left side for inputs and right side for preview */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                            <div style={{ flex: 2 }}>
                                                {/* Question Type */}
                                                <div className="assess-form-group">
                                                    <label className="assess-form-label">Question Type</label>
                                                    <select
                                                        className="assess-form-input"
                                                        value={q.type}
                                                        onChange={e => updateQuestionField(qIndex, 'type', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="Multiple Choice">Multiple Choice</option>
                                                        <option value="True or False">True or False</option>
                                                    </select>
                                                </div>

                                                {/* Question Text */}
                                                <div className="assess-form-group">
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

                                                {/* Attach File + Upload */}
                                                <div className="assess-form-group">
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
                                            </div>

                                            {/* Right side: File preview */}
                                            <div style={{ flex: 1, marginTop: '20px' }}>
                                                <h3 className="assess-preview-title">File Preview</h3>
                                                {q.file_url ? (
                                                    <>
                                                        {/* Image preview */}
                                                        {q.file_url.match(/\.(jpeg|jpg|png|gif)$/i) && (
                                                            <img src={q.file_url} alt="Preview" className="assess-preview-img" />
                                                        )}

                                                        {/* Video preview */}
                                                        {q.file_url.match(/\.(mp4|webm|ogg)$/i) && (
                                                            <video src={q.file_url} controls className="assess-preview-video" />
                                                        )}

                                                        {/* Audio preview */}
                                                        {q.file_url.match(/\.(mp3|wav|ogg)$/i) && (
                                                            <audio src={q.file_url} controls className="assess-preview-audio" />
                                                        )}

                                                        {/* Other file fallback */}
                                                        {!q.file_url.match(/\.(jpeg|jpg|png|gif|mp4|webm|ogg|mp3|wav)$/i) && (
                                                            <a
                                                                href={q.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="assess-preview-link"
                                                            >
                                                                Open File
                                                            </a>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p>No file attached.</p>
                                                )}

                                            </div>

                                        </div>

                                        {/* Answer Options and Correct Answer Index */}
                                        <div className="assess-form-group" style={{ marginTop: '20px' }}>
                                            <label className="assess-form-label">Answer Options</label>
                                            {q.type === 'Multiple Choice' && <div className="assess-options-container">
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="assess-option-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' ,width: 'fit-content'}}>
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

                                                {/* Correct Answer Index */}
                                                <div className="assess-form-group" style={{ width: 'fit-content' }}>
                                                    <label className="assess-form-label">Correct Answer Index</label>
                                                    <input
                                                        type="text"
                                                        className="assess-form-input"
                                                        placeholder="0, 1, 2 or 0,2 for multiple"
                                                        value={
                                                            Array.isArray(q.correct_option)
                                                                ? q.correct_option.join(',')
                                                                : q.correct_option ?? ''
                                                        }
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const arr = val.includes(',')
                                                                ? val.split(',').map(s => parseInt(s.trim(), 10))
                                                                : parseInt(val.trim(), 10);
                                                            updateQuestionField(qIndex, 'correct_option', arr);
                                                        }}
                                                        required
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    className="assess-add-option"
                                                    onClick={() => addOption(qIndex)}
                                                >
                                                    <Plus size={14} />
                                                    Add Option
                                                </button>
                                                
                                            </div>}
                                            {q.type === 'True or False' && <div className="assess-options-container">
                                                <div className="assess-option-row">
                                                    <div className="assess-option-index">0</div>
                                                    <input
                                                        type="text"
                                                        className="assess-form-input"
                                                        placeholder="Option 1"
                                                        value={q.options[0]}
                                                        onChange={e => updateOption(qIndex, 0, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>}
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="assess-btn-secondary" style={{ marginTop: '20px' ,width: 'fit-content', alignSelf: 'flex-end'}} onClick={addQuestion}>
                                                    <Plus size={16} />
                                                    Add Question
                                                </button>
                            </div>
                        </div>}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button type="button" className="assess-btn-secondary" style={{ color: '#5570f1', borderColor: '#5570f1' }} onClick={() => setStep(step - 1)}>
                                Previous
                            </button>
                            <button type="button" className="assess-btn-secondary" style={{ color: '#5570f1', borderColor: '#5570f1' }} onClick={() => setStep(step + 1)}>
                                Next
                            </button>

                        </div>
                        {/* Form Actions */}
                        <div className="assess-form-actions">
                            <button type="button" className="assess-btn-secondary" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="button" className="assess-btn-primary" onClick={handleSaveAssessment}>
                                <FileText size={16} />
                                <span>{currentAssessment ? "Update Assessment" : "Create Assessment"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionsForm;
