import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, EyeIcon, Loader, Plus, X } from 'lucide-react';
import './GlobalModuleModal.css';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { createContent, updateContent } from '../../../store/slices/contentSlice';
import CustomLoader2 from '../../../components/common/Loading/CustomLoader2';
import ModulePreview from './ModulePreview';
import api from '../../../services/api';
import FullRichTextEditor from './RichText';
const categories = [
    "Cyber Security",
    "POSH (Prevention of Sexual Harassment)",
    "Compliance & Regulations",
    "Safety & Health",
    "Technical Skills",
    "Soft Skills",
    "Leadership & Management",
    "Product Knowledge",
    "Process & Procedures",
];
const trainingTypes = [
    "Mandatory Training",
    "Continuous Learning",
    "Micro Learning/Learning Byte",
    "Initial/Onboarding Training",
];


const GlobalModuleModal = ({
    showModal, setShowModal, newContent, handleInputChange,showEditModal,setShowEditModal,editContentId,drafts,setDrafts,handleRichInputChange
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [learningOutcomes, setLearningOutcomes] = useState(newContent.learningOutcomes || ['']);
    const [tags, setTags] = useState(newContent.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [contentType, setContentType] = useState('Upload File');
    const totalSteps = 3;
    const [isValidUrl, setIsValidUrl] = useState(false);
    const [showIframe, setShowIframe] = useState(false);
    const { uploading } = useSelector((state) => state.content);
    const [preview, setPreview] = useState(false);
    const [teams, setTeams] = useState([]);
    const validateUrl = (url) => {
        try {
            const _url = new URL(url);
            return _url.protocol === "http:" || _url.protocol === "https:";
        } catch (e) {
            return false;
        }
    };
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/api/globalAdmin/getTeams');
                setTeams(response.data.data);
                console.log(response.data.data);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchTeams();
    }, []);
    // Run URL validation when externalResource changes
    useEffect(() => {
        setShowIframe(false); // hide iframe whenever URL changes
        if (newContent.externalResource && validateUrl(newContent.externalResource)) {
            setIsValidUrl(true);
        } else {
            setIsValidUrl(false);
        }
    }, [newContent.externalResource]);

    /* Learning Outcomes handlers */
    const addLearningOutcome = () => {
        const newOutcomes = [...learningOutcomes, ''];
        setLearningOutcomes(newOutcomes);
        handleInputChange({ target: { name: 'learningOutcomes', value: newOutcomes } });
    };

    const removeLearningOutcome = (index) => {
        const newOutcomes = learningOutcomes.filter((_, i) => i !== index);
        setLearningOutcomes(newOutcomes);
        handleInputChange({ target: { name: 'learningOutcomes', value: newOutcomes } });
    };

    const updateLearningOutcome = (index, value) => {
        const newOutcomes = [...learningOutcomes];
        newOutcomes[index] = value;
        setLearningOutcomes(newOutcomes);
        handleInputChange({ target: { name: 'learningOutcomes', value: newOutcomes } });
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return newContent.title && newContent.description && newContent.learningOutcomes.length > 0 && newContent.tags.length > 0 && newContent.prerequisites !== "";
            case 2:
                return contentType === "Upload File" ? newContent.primaryFile : newContent.externalResource || newContent.richText;
            case 3:
                return newContent.moduleType && newContent.category && newContent.team 
            default:
                return true;
        }
    };

    /* Tag input handlers */
    const handleTagInputChange = (e) => setTagInput(e.target.value);
    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            const newTags = [...tags, trimmedTag];
            setTags(newTags);
            setTagInput('');
            handleInputChange({ target: { name: 'tags', value: newTags } });
        }
    };
    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        setTags(newTags);
        handleInputChange({ target: { name: 'tags', value: newTags } });
    };
    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };
    const dispatch = useDispatch();
    const handleAddContent = async () => {

        try {
            // Build FormData
            const formData = new FormData();

            const moduleData = {
                ...newContent,
                id: Date.now(), // temporary id
                status: "Draft",
                createdDate: new Date().toISOString(),
            };

            // console.log(moduleData)
            // ✅ Dispatch or API call with formData
            dispatch(createContent(moduleData)).then(() => {
                setShowModal(false);
            });
        } catch (err) {
            console.error("Error uploading content:", err);
            alert("Upload failed");
        } finally {
            
        }
    };
    const handleEditContent = () => {
        dispatch(updateContent({ id: editContentId, updatedData: newContent }));
        setShowEditModal(false);
        // setEditContentId(null);
        // setNewContent({});
      };
    /* File Preview */
    const handlePreviewFile = (file) => {
        if (!file) return;
        const fileUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
    };

    const handleRemoveFile = () => {
        handleInputChange({ target: { name: 'primaryFile', value: null } });
    };
    const handleRemoveAdditionalFile = () => {
        handleInputChange({ target: { name: 'additionalFile', value: null } });
    };
    const handleRemoveThumbnail = () => {
        handleInputChange({ target: { name: 'thumbnail', value: null } });
    };
    const handleSaveDraft = () => {
        const confirm = window.confirm("The files will be removed when you save the draft")
        //ok or cancel

        if(confirm){
            if(!drafts){
                const drafts = [];
                drafts.push(newContent);
                newContent.primaryFile = null   ;
                newContent.additionalFile = null;
                newContent.thumbnail = null;
                localStorage.setItem('drafts', JSON.stringify(drafts));
            }else{
                const drafts = JSON.parse(localStorage.getItem('drafts'));
                drafts.push(newContent);
                localStorage.setItem('drafts', JSON.stringify(drafts));
            }
            setShowModal(false);
        }
        
    };
    // console.log(JSON.parse(drafts).title)
    const deleteDraft = () => {
        const drafts = JSON.parse(localStorage.getItem('drafts'));
        drafts.filter((draft) => draft.title !== newContent.title);
        localStorage.setItem('drafts', JSON.stringify(drafts));
        setShowModal(false);
    };
    const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    if (!showModal) return null;

    return (
        <div className="module-overlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div className="module-overlay__content">
                {/* HEADER */}
                <div className="module-overlay__header">
                    <div>
                        <h2 id="modalTitle" className="module-overlay__title">Add New Module</h2>
                        <div className="module-overlay__step-indicator">
                            Step {currentStep} of {totalSteps}: {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Files and Resources" : "Configurations & Metadata"}
                        </div>
                        
                    </div>
                    <div>
                        {drafts && 
                        <div className='module-overlay__drafts'>
                            <p>Drafts</p>
                            <button onClick={setDrafts}>{JSON.parse(drafts).title}</button>
                            {/* <button onClick={deleteDraft} style={{border: 'none', background: 'transparent', cursor: 'pointer',position: 'relative', right: '35px',top: '-10px',color: 'red',fontWeight: '700'}}><X size={20} /></button> */}
                        </div>}
                        </div>
                    <button
                        type="button"
                        className="module-overlay__close"
                        onClick={() => setShowModal(false)}
                        aria-label="Close Modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* PROGRESS BAR */}
                <div className="module-overlay__progress">
                    <div
                        className="module-overlay__progress-bar"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>

                {/* BODY */}
                <div className="module-overlay__body" style={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
                    {currentStep === 1 && (
                        <div className="module-overlay__step">
                            <div className="module-overlay__form-group"  style={{marginBottom: '20px'}}>
                                <label className="module-overlay__form-label">
                                    Module Title <span className="module-overlay__required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newContent.title || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-input"
                                    placeholder="Enter module title"
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Module Description <span className="module-overlay__required">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={newContent.description || ''}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="module-overlay__form-textarea"
                                    placeholder="Describe the intent, target audience, and what learners will gain"
                                    required
                                />
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Learning Outcomes</label>
                                <div className="module-overlay__learning-outcomes">
                                    {learningOutcomes.map((outcome, index) => (
                                        <div key={index} className="module-overlay__learning-outcome-item">
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
                                                    aria-label={`Remove learning outcome ${index + 1}`}
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
                                        <Plus size={16} /> Add Learning Outcome
                                    </button>
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Tags</label>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagInputKeyDown}
                                    className="module-overlay__form-input"
                                    placeholder="Type a tag and press Enter or comma"
                                    autoComplete="off"
                                />
                                <div className="module-overlay__tags-container">
                                    {tags.map((tag, index) => (
                                        <span key={index} className="module-overlay__tag">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="module-overlay__tag-remove"
                                                aria-label={`Remove tag ${tag}`}
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Prerequisites</label>
                                <input
                                    type="text"
                                    name="prerequisites"
                                    value={newContent.prerequisites || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-input"
                                    placeholder="Required prior knowledge"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Thumbnail</label>
                                <input
                                    type="file"
                                    name="thumbnail"
                                    onChange={handleInputChange}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    id="thumbnail"
                                />
                                {newContent.thumbnail ? (
                                        <div className="module-overlay__uploaded-file-container">
                                            <span className="module-overlay__uploaded-file-name" title={typeof newContent.thumbnail === 'string' ? newContent.thumbnail.split('/').pop() : newContent.thumbnail.name}>
                                                {typeof newContent.thumbnail === 'string' ? newContent.thumbnail.split('/').pop() : newContent.thumbnail.name}
                                            </span>
                                            <div className="module-overlay__file-actions">
                                                <button
                                                    type="button"
                                                    className="module-overlay__btn-preview"
                                                    onClick={() => handlePreviewFile(newContent.thumbnail)}
                                                    aria-label="Preview uploaded file"
                                                >
                                                    <EyeIcon size={16} /> Preview
                                                </button>
                                                <button
                                                    type="button"
                                                    className="module-overlay__btn-delete"
                                                    onClick={handleRemoveThumbnail}
                                                    aria-label="Delete uploaded file"
                                                >
                                                    <RiDeleteBin2Fill size={16} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label htmlFor="thumbnail" className="module-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                                            <Plus size={16} /> Upload File
                                        </label>
                                    )}
                        
                                
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="module-overlay__step">
                            <div className="module-overlay__content-type-buttons">
                                <button
                                    type="button"
                                    className={`module-overlay__content-type-btn ${contentType === 'Upload File' ? 'active' : ''}`}
                                    onClick={() => setContentType('Upload File')}
                                    aria-pressed={contentType === 'Upload File'}
                                >
                                    Upload File
                                </button>
                                <button
                                    type="button"
                                    className={`module-overlay__content-type-btn ${contentType === 'Text / External URL' ? 'active' : ''}`}
                                    onClick={() => setContentType('Text / External URL')}
                                    aria-pressed={contentType === 'Text / External URL'}
                                >
                                    Text / External URL
                                </button>
                            </div>
                            <label className="module-overlay__form-label">Instructions</label>

                            <textarea
                                        name="instructions"
                                        rows={4}
                                        value={newContent.instructions || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-textarea"
                                        placeholder="Add instructions for the module"
                                    />

                            {contentType === 'Upload File' ? (
                                <div className="module-overlay__form-group">
                                    <label className="module-overlay__form-label">Upload Files</label>
                                    <input
                                        type="file"
                                        name="primaryFile"
                                        onChange={handleInputChange}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.doc,.docx,.mp4,.mp3,.scorm"
                                        id="uploadFiles"
                                    />
                                    {newContent.primaryFile ? (
                                        <div className="module-overlay__uploaded-file-container">
                                            <span className="module-overlay__uploaded-file-name" title={typeof newContent.primaryFile === 'string' ? newContent.primaryFile.split('/').pop() : newContent.primaryFile.name}>
                                                {typeof newContent.primaryFile === 'string' ? newContent.primaryFile.split('/').pop() : newContent.primaryFile.name}
                                            </span>
                                            <div className="module-overlay__file-actions">
                                                <button
                                                    type="button"
                                                    className="module-overlay__btn-preview"
                                                    onClick={() => handlePreviewFile(newContent.primaryFile)}
                                                    aria-label="Preview uploaded file"
                                                >
                                                    <EyeIcon size={16} /> Preview
                                                </button>
                                                <button
                                                    type="button"
                                                    className="module-overlay__btn-delete"
                                                    onClick={handleRemoveFile}
                                                    aria-label="Delete uploaded file"
                                                >
                                                    <RiDeleteBin2Fill size={16} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label htmlFor="uploadFiles" className="module-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                                            <Plus size={16} /> Upload File
                                        </label>
                                    )}
                                    
                                    <div>
                                        <label className="module-overlay__form-label">Additional File</label>
                                        <input
                                            type="file"
                                            name="additionalFile"
                                            onChange={handleInputChange}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt"
                                            style={{ display: 'none' }}
                                            id="additionalFile"
                                        />
                                        {newContent.additionalFile ? (
                                            <div className="module-overlay__uploaded-file-container">
                                                <span className="module-overlay__uploaded-file-name" title={typeof newContent.additionalFile === 'string' ? newContent.additionalFile.split('/').pop() : newContent.additionalFile.name}>
                                                    {typeof newContent.additionalFile === 'string' ? newContent.additionalFile.split('/').pop() : newContent.additionalFile.name}
                                                </span>
                                                <div className="module-overlay__file-actions">
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-preview"
                                                        onClick={() => handlePreviewFile(newContent.additionalFile)}
                                                        aria-label="Preview uploaded file"
                                                    >
                                                        <EyeIcon size={16} /> Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-delete"
                                                        onClick={handleRemoveAdditionalFile}
                                                        aria-label="Delete uploaded file"
                                                    >
                                                        <RiDeleteBin2Fill size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label htmlFor="additionalFile" className="module-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                                                <Plus size={16} /> Upload Additional File
                                            </label>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="module-overlay__form-group">
                                    <label className="module-overlay__form-label">Enter Text</label>
                                    {/* <textarea
                                        name="text"
                                        rows={4}
                                        value={newContent.text || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-textarea"
                                        placeholder="Add text content or paste external URLs (YouTube, websites, documents, etc.)"
                                    /> */}
                                    <FullRichTextEditor value={newContent.text || ''} onChange={handleRichInputChange} />

                                    <label className="module-overlay__form-label">External Resource</label>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            name="externalResource"
                                            value={newContent.externalResource || ''}
                                            onChange={handleInputChange}
                                            className="module-overlay__form-input"
                                            placeholder="Add external resource URL"
                                        />
                                        {isValidUrl && (
                                            <button
                                                type="button"
                                                className="module-overlay__btn-view"
                                                onClick={() => setShowIframe(!showIframe)}
                                                aria-expanded={showIframe}
                                                aria-controls="externalResourceIframe"
                                            >
                                                {showIframe ? 'Hide Resource' : 'View Resource'}
                                            </button>
                                        )}
                                    </span>
                                    {showIframe && (
                                        <div style={{ marginTop: '16px', height: '300px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                            <iframe
                                                id="externalResourceIframe"
                                                src={newContent.externalResource}
                                                title="External Resource Preview"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none' }}
                                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                            />
                                        </div>
                                    )}
                                    <label className="module-overlay__form-label">Instructions</label>
                                    <textarea
                                        name="instructions"
                                        rows={4}
                                        value={newContent.instructions || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-textarea"
                                        placeholder="Add instructions for the module"
                                    />
                                    <div>
                                        <label className="module-overlay__form-label">Additional File</label>
                                        <input
                                            type="file"
                                            name="additionalFile"
                                            onChange={handleInputChange}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt"
                                            style={{ display: 'none' }}
                                            id="additionalFile"
                                        />
                                        {newContent.additionalFile ? (
                                            <div className="module-overlay__uploaded-file-container">
                                                <span className="module-overlay__uploaded-file-name" title={typeof newContent.additionalFile === 'string' ? newContent.additionalFile.split('/').pop() : newContent.additionalFile.name}>
                                                    {typeof newContent.additionalFile === 'string' ? newContent.additionalFile.split('/').pop() : newContent.additionalFile.name}
                                                </span>
                                                <div className="module-overlay__file-actions">
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-preview"
                                                        onClick={() => handlePreviewFile(newContent.additionalFile)}
                                                        aria-label="Preview uploaded file"
                                                    >
                                                        <EyeIcon size={16} /> Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-delete"
                                                        onClick={handleRemoveAdditionalFile}
                                                        aria-label="Delete uploaded file"
                                                    >
                                                        <RiDeleteBin2Fill size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label htmlFor="additionalFile" className="module-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                                                <Plus size={16} /> Upload Additional File
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="module-overlay__step">
                            <div className="module-overlay__form-row">
                                <div className="module-overlay__form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label className="module-overlay__form-label">
                                        Duration (in minutes) <span className="module-overlay__required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        min="1"
                                        value={newContent.duration || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-input"
                                        required
                                        placeholder="e.g., 60"
                                        autoComplete="off"
                                    />
                                </div>

                                {/* <div className="module-overlay__form-group" style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                                    <label className="module-overlay__form-label">Created By</label>
                                    <input
                                        type="text"
                                        name="createdBy"
                                        value={newContent.createdBy || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-input"
                                        placeholder="Your name"
                                        autoComplete="off"
                                    />
                                </div> */}

                                <div className="module-overlay__form-group" style={{ flex: 1, minWidth: 0 }}>
                                    <label className="module-overlay__form-label">
                                        Training Type <span className="module-overlay__required">*</span>
                                    </label>
                                    <select
                                        name="trainingType"
                                        value={newContent.trainingType || ''}
                                        onChange={handleInputChange}
                                        className="module-overlay__form-select"
                                        required
                                    >
                                        <option value="">Select Training Type</option>
                                        {trainingTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Category <span className="module-overlay__required">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={newContent.category || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-select"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className='module-overlay__form-row'>
                                <div className="module-overlay__slider-row">
                                    <label className="module-overlay__form-label slider-label">
                                        <span className="slider-label-text">Credits</span>
                                        <span className="slider-value">{newContent.credits || 0}</span>
                                        <input
                                            type="range"
                                            name="credits"
                                            min="0"
                                            max="9"
                                            value={newContent.credits || 0}
                                            onChange={handleInputChange}
                                            className="module-overlay__slider"
                                        />
                                    </label>
                                    <label className="module-overlay__form-label slider-label">
                                        <span className="slider-label-text">Stars</span>
                                        <span className="slider-value">{newContent.stars || 0}</span>
                                        <input
                                            type="range"
                                            name="stars"
                                            min="0"
                                            max="9"
                                            value={newContent.stars || 0}
                                            onChange={handleInputChange}
                                            className="module-overlay__slider"
                                        />
                                    </label>
                                    <label className="module-overlay__form-label slider-label">
                                        <span className="slider-label-text">Badges</span>
                                        <span className="slider-value">{newContent.badges || 0}</span>
                                        <input
                                            type="range"
                                            name="badges"
                                            min="0"
                                            max="9"
                                            value={newContent.badges || 0}
                                            onChange={handleInputChange}
                                            className="module-overlay__slider"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    Target Team/Sub Team <span className="module-overlay__required">*</span>
                                </label>
                                <select
                                    name="team"
                                    value={newContent.team || ''}
                                    onChange={handleInputChange}
                                    className="module-overlay__form-select"
                                    required
                                >
                                    <option value="">Select Team/Sub Team</option>
                                    {teams?.map((team) => (
                                        <option key={team._id} value={team._id}>
                                            {team.name}
                                        </option>   
                                    ))}
                                </select>
                            </div>
                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label module-overlay__checkbox">
                                    <input
                                        type="checkbox"
                                        name="feedbackEnabled"
                                        checked={!!newContent.feedbackEnabled}
                                        onChange={(e) =>
                                            handleInputChange({ target: { name: 'feedbackEnabled', value: e.target.checked } })
                                        }
                                    />
                                    Allow learners to submit feedback and reactions
                                </label>
                            </div>
                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label module-overlay__checkbox">
                                    <input
                                        type="checkbox"
                                        name="submissionsEnabled"
                                        checked={!!newContent.submissionsEnabled}
                                        onChange={(e) =>
                                            handleInputChange({ target: { name: 'submissionsEnabled', value: e.target.checked } })
                                        }
                                    />
                                    Allow learners submissions
                                </label>
                                <p style={{ fontSize: '12px', color: '#666' }}>Allow learners to submit their work for grading and feedback.
                                    Please enable this if you have an additional file.
                                </p>
                            </div>
                            <div className="module-overlay__form-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button className='module-overlay__btn-save' onClick={handleSaveDraft} disabled={editContentId}>Save Draft</button>
                                <button className='module-overlay__btn-preview' onClick={() => setPreview(true)}>Preview</button>
                            </div>
                        </div>
                    )}
                </div>
                {preview && <ModulePreview content={newContent} onClose={() => setPreview(false)} />}

                {/* FOOTER ACTIONS */}
                <div className="module-overlay__footer">
                    <div className="module-overlay__step-navigation">
                        {currentStep > 1 && (
                            <button type="button" className="module-overlay__btn-prev" onClick={prevStep} aria-label="Previous Step">
                                <ChevronLeft size={16} /> Previous
                            </button>
                        )}
                        <div className="module-overlay__step-dots" aria-label="Step Progress">
                            {[...Array(totalSteps)].map((_, index) => (
                                <div
                                    key={index}
                                    className={`module-overlay__step-dot ${index + 1 <= currentStep ? 'active' : ''}`}
                                    aria-current={index + 1 === currentStep ? "step" : undefined}
                                />
                            ))}
                        </div>
                        <div className="module-overlay__action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button className="module-overlay__btn-cancel" onClick={() => setShowModal(false)} aria-label="Cancel " disabled={uploading}>
                                Cancel
                            </button>
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    className="module-overlay__btn-next"
                                    onClick={nextStep}
                                    disabled={!canProceed() || uploading}
                                    aria-label="Next Step"
                                    
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="module-overlay__btn-add"
                                    onClick={showEditModal ? handleEditContent : handleAddContent}
                                    disabled={uploading}
                                    aria-label="Create Module"
                                >
                                    {uploading ?(<CustomLoader2 size={16} color="#5570f1" strokeWidth={3} />): showEditModal ? 'Update Module' : 'Create Module'}
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
