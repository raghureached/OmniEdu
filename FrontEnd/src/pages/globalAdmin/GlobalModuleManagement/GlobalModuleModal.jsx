import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import './GlobalModuleModal.css'
import ModulePreview from './ModulePreview';

const GlobalModuleModal = ({ showModal, setShowModal, newContent, handleInputChange, handleAddContent }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [tags, setTags] = useState(newContent.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [learningOutcomes, setLearningOutcomes] = useState(newContent.learningOutcomes || ['']);
    const [openPreview, setOpenPreview] = useState(false);

    const totalSteps = 4;

    // Handle tag input
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    // Add tag when Enter is pressed or comma is typed
    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    // Add a new tag
    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            const newTags = [...tags, trimmedTag];
            setTags(newTags);
            setTagInput('');
            // Update parent component
            handleInputChange({
                target: {
                    name: 'tags',
                    value: newTags
                }
            });
        }
    };

    // Remove a tag
    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        handleInputChange({
            target: {
                name: 'tags',
                value: newTags
            }
        });
    };

    // Handle learning outcomes
    const addLearningOutcome = () => {
        const newOutcomes = [...learningOutcomes, ''];
        setLearningOutcomes(newOutcomes);
        handleInputChange({
            target: {
                name: 'learningOutcomes',
                value: newOutcomes
            }
        });
    };

    const removeLearningOutcome = (index) => {
        const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
        setLearningOutcomes(newOutcomes);
        handleInputChange({
            target: {
                name: 'learningOutcomes',
                value: newOutcomes
            }
        });
    };

    const updateLearningOutcome = (index, value) => {
        const newOutcomes = [...learningOutcomes];
        newOutcomes[index] = value;
        setLearningOutcomes(newOutcomes);
        handleInputChange({
            target: {
                name: 'learningOutcomes',
                value: newOutcomes
            }
        });
    };

    // Navigation functions
    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return newContent.title && newContent.type;
            case 2:
                return newContent.content;
            case 3:
                return true; // Files are optional
            case 4:
                return true; // Metadata is optional
            default:
                return false;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 1:
                return "Basic Information";
            case 2:
                return "Content & Learning Outcomes";
            case 3:
                return "Files & Resources";
            case 4:
                return "Metadata & Settings";
            default:
                return "";
        }
    };

    if (!showModal) return null;

    return (
        <div className="module-overlay">
            {openPreview && <ModulePreview openPreview={openPreview} onClose={() => setOpenPreview(false)} moduleData={newContent}/>}
            <div className="module-overlay__content">
                <div className="module-overlay__header">
                    <div>
                        <h2 className="module-overlay__title">Add New Module</h2>
                        <div className="module-overlay__step-indicator">
                            Step {currentStep} of {totalSteps}: {getStepTitle()}
                        </div>
                    </div>
                    <button className="module-overlay__close" onClick={() => setShowModal(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="module-overlay__progress">
                    <div 
                        className="module-overlay__progress-bar" 
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                </div>

                <div className="module-overlay__body">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="module-overlay__step">
                            <h3 className="module-overlay__step-title">Basic Module Information</h3>
                            
                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Module Title <span className="module-overlay__required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newContent.title || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-input"
                                    placeholder="Enter a clear and descriptive module title"
                                    required
                                />
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Module Description <span className="module-overlay__required">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={newContent.type || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-select"
                                    required
                                >
                                    <option value="">Select module type</option>
                                    <option value="video">Video Module</option>
                                    <option value="document">Document Module</option>
                                    <option value="interactive">Interactive Module</option> 
                                    <option value="theory">Theory Module</option>
                                </select>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Duration (minutes)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    value={newContent.duration || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-input"
                                    placeholder="Estimated completion time"
                                    min="1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Content & Learning Outcomes */}
                    {currentStep === 2 && (
                        <div className="module-overlay__step">
                            <h3 className="module-overlay__step-title">Content & Learning Outcomes</h3>
                            
                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Module Description <span className="module-overlay__required">*</span>
                                </label>
                                <textarea
                                    name="content"
                                    value={newContent.content || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="module-overlay__form-textarea"
                                    placeholder="Provide a detailed description of what this module covers"
                                    required
                                />
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Learning Outcomes
                                </label>
                                <p className="module-overlay__form-helper">
                                    Define what learners will be able to do after completing this module
                                </p>
                                
                                <div className="module-overlay__learning-outcomes">
                                    {learningOutcomes.map((outcome, index) => (
                                        <div key={index} className="module-overlay__learning-outcome-item">
                                            <div className="module-overlay__learning-outcome-number">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={outcome}
                                                onChange={(e) => updateLearningOutcome(index, e.target.value)}
                                                className="module-overlay__form-input"
                                                placeholder={`Learning outcome ${index + 1}`}
                                            />
                                            {learningOutcomes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLearningOutcome(index)}
                                                    className="module-overlay__learning-outcome-remove"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <button
                                        type="button"
                                        onClick={addLearningOutcome}
                                        className="module-overlay__add-outcome-btn"
                                    >
                                        <Plus size={16} />
                                        Add Learning Outcome
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Files & Resources */}
                    {currentStep === 3 && (
                        <div className="module-overlay__step">
                            <h3 className="module-overlay__step-title">Files & Resources</h3>
                            
                            <div className="module-overlay__form-row">
                                <div className="module-overlay__form-group module-overlay__form-group--half">
                                    <label className="module-overlay__form-label">Video File</label>
                                    <p className="module-overlay__form-helper">Upload video content for this module</p>
                                    <input
                                        type="file"
                                        name="videoFile"
                                        onChange={handleInputChange}
                                        accept="video/*"
                                        className="module-overlay__form-file"
                                    />
                                    {newContent.videoFile && (
                                        <div className="module-overlay__file-preview">
                                            <span className="module-overlay__file-name">
                                                {newContent.videoFile.name}
                                            </span>
                                            <div className="module-overlay__file-actions">
                                                <button 
                                                    type="button"
                                                    className="module-overlay__btn-preview"
                                                    onClick={() => {
                                                        const url = URL.createObjectURL(newContent.videoFile);
                                                        window.open(url, '_blank');
                                                    }}
                                                >
                                                    Preview
                                                </button>
                                                <button 
                                                    type="button"
                                                    className="module-overlay__btn-remove"
                                                    onClick={() => handleInputChange({
                                                        target: { name: 'videoFile', value: null }
                                                    })}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="module-overlay__form-group module-overlay__form-group--half">
                                    <label className="module-overlay__form-label">Document Files</label>
                                    <p className="module-overlay__form-helper">Upload supporting documents (PDF, DOC, PPT)</p>
                                    <input
                                        type="file"
                                        name="documentFiles"
                                        onChange={handleInputChange}
                                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                        multiple
                                        className="module-overlay__form-file"
                                    />
                                    {newContent.documentFiles && newContent.documentFiles.length > 0 && (
                                        <div className="module-overlay__files-preview">
                                            {Array.from(newContent.documentFiles).map((file, index) => (
                                                <div key={index} className="module-overlay__file-preview">
                                                    <span className="module-overlay__file-name">
                                                        {file.name}
                                                    </span>
                                                    <div className="module-overlay__file-actions">
                                                        <button 
                                                            type="button"
                                                            className="module-overlay__btn-preview"
                                                            onClick={() => {
                                                                const url = URL.createObjectURL(file);
                                                                window.open(url, '_blank');
                                                            }}
                                                        >
                                                            Preview
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            className="module-overlay__btn-remove"
                                                            onClick={() => {
                                                                const newFiles = Array.from(newContent.documentFiles).filter((_, i) => i !== index);
                                                                handleInputChange({
                                                                    target: { name: 'documentFiles', files: newFiles.length > 0 ? newFiles : null }
                                                                });
                                                            }}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Additional Resources</label>
                                <textarea
                                    name="additionalResources"
                                    value={newContent.additionalResources || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="module-overlay__form-textarea"
                                    placeholder="Add links to external resources, reading materials, or additional references"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Metadata & Settings */}
                    {currentStep === 4 && (
                        <div className="module-overlay__step">
                            <h3 className="module-overlay__step-title">Metadata & Settings</h3>
                            
                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Tags</label>
                                <p className="module-overlay__form-helper">Add tags to help organize and search for this module</p>
                                <div className="module-overlay__tag-input-container">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={handleTagInputChange}
                                        onKeyDown={handleTagInputKeyDown}
                                        className="module-overlay__form-input"
                                        placeholder="Type a tag and press Enter or comma to add"
                                    />
                                    <div className="module-overlay__tags-container">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="module-overlay__tag">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="module-overlay__tag-remove"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="module-overlay__form-row">
                                {/* <div className="module-overlay__form-group module-overlay__form-group--half">
                                    <label className="module-overlay__form-label">Difficulty Level</label>
                                    <select
                                        name="difficultyLevel"
                                        value={newContent.difficultyLevel || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-select"
                                    >
                                        <option value="">Select difficulty</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div> */}

                                <div className="module-overlay__form-group module-overlay__form-group--half">
                                    <label className="module-overlay__form-label">Prerequisites</label>
                                    <input
                                        type="text"
                                        name="prerequisites"
                                        value={newContent.prerequisites || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-input"
                                        placeholder="Required prior knowledge"
                                    />
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Module Summary</label>
                                
                                <div className="module-overlay__summary">
                                    <div className="module-overlay__summary-item">
                                        <strong>Title:</strong> {newContent.title || 'Not specified'}
                                    </div>
                                    <div className="module-overlay__summary-item">
                                        <strong>Type:</strong> {newContent.type || 'Not specified'}
                                    </div>
                                    <div className="module-overlay__summary-item">
                                        <strong>Duration:</strong> {newContent.duration ? `${newContent.duration} minutes` : 'Not specified'}
                                    </div>
                                    <div className="module-overlay__summary-item">
                                        <strong>Learning Outcomes:</strong> {learningOutcomes.filter(o => o.trim()).length} defined
                                    </div>
                                    <button type="button" style={{ marginTop: '1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px'}} onClick={() => setOpenPreview(true)}>
                                    Preview Module
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Navigation */}
                <div className="module-overlay__footer">
                    <div className="module-overlay__step-navigation">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                className="module-overlay__btn-prev"
                                onClick={prevStep}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                        )}
                        
                        <div className="module-overlay__step-dots">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`module-overlay__step-dot ${index + 1 <= currentStep ? 'active' : ''}`}
                                ></div>
                            ))}
                        </div>
                        
                        <div className="module-overlay__action-buttons">
                            <button
                                type="button"
                                className="module-overlay__btn-cancel"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    className="module-overlay__btn-next"
                                    onClick={nextStep}
                                    disabled={!canProceed()}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="module-overlay__btn-add"
                                    onClick={handleAddContent}
                                >
                                    Create Module
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalModuleModal;