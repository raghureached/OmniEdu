import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, EyeIcon, Info, Loader, Plus, X } from 'lucide-react';
import './ModuleModal.css';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
// import { createContent, enhanceText, updateContent } from '../../../store/slices/contentSlice';
import CustomLoader2 from '../../../components/common/Loading/CustomLoader2';
import ModulePreview from '../../../components/common/Preview/Preview';
import api from '../../../services/api';
import FullRichTextEditor from './RichText';
import CustomError from '../../../components/common/Error/Error';
import { GoBook, GoX } from 'react-icons/go';
import { admincreateContent, adminupdateContent, enhanceText } from '../../../store/slices/adminModuleSlice';
import { categories } from '../../../utils/constants';
import { notifyError, notifySuccess } from '../../../utils/notification';
const trainingTypes = [
    "Mandatory Training",
    "Continuous Learning",
    "Micro Learning/Learning Byte",
    "Initial/Onboarding Training",
];


const ModuleModal = ({
    showModal, setShowModal, newContent, handleInputChange, showEditModal, setShowEditModal, editContentId, drafts, setDrafts, handleRichInputChange, error
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [aiHelpOpen, setAiHelpOpen] = useState(false);
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
    const [aiProcessing, setAiProcessing] = useState(false);
    const [generatingImage, setGeneratingImage] = useState(false);
    const [filePreview, setFilePreview] = useState({ open: false, url: null, name: '', type: '', isBlob: false });
    const validateUrl = (url) => {
        try {
            const _url = new URL(url);
            return _url.protocol === "http:" || _url.protocol === "https:";
        } catch (e) {
            return false;
        }
    };

    // Normalize well-known providers (e.g., YouTube) for embedding
    const normalizeExternalUrl = (url) => {
        const normalizeYouTube = (raw) => {
            try {
                const u = new URL(raw);
                const host = u.hostname.replace(/^www\./, '');
                // Short link: youtu.be/<id>
                if (host === 'youtu.be') {
                    const id = u.pathname.replace(/^\//, '');
                    return id ? `https://www.youtube.com/embed/${id}` : raw;
                }
                // Standard watch URL: youtube.com/watch?v=<id>
                if ((host === 'youtube.com' || host === 'm.youtube.com') && u.pathname === '/watch') {
                    const id = u.searchParams.get('v');
                    if (id) return `https://www.youtube.com/embed/${id}`;
                }
                // Already an embed URL
                if ((host === 'youtube.com' || host === 'm.youtube.com') && u.pathname.startsWith('/embed/')) {
                    return raw;
                }
            } catch (_) { }
            return raw;
        };
        // Extend here for other providers if needed
        return normalizeYouTube(url);
    };
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get('/api/admin/getGroups');
                setTeams(response.data.data);
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
    const enhanceTexthelper = (title, description) => {
        if (title.trim().length < 5 || description.trim().length < 5) {
            alert("Title and description must be at least 5 characters long")
            return
        }
        if (aiProcessing) {
            alert("Please wait for the previous request to complete")
            return
        }
        setAiProcessing(true)
        dispatch(enhanceText({ title, description })).then((res) => {
            handleInputChange({ target: { name: 'title', value: res.payload.title } });
            handleInputChange({ target: { name: 'description', value: res.payload.description } });
            handleInputChange({ target: { name: 'tags', value: res.payload.tags } });
            handleInputChange({ target: { name: 'learningOutcomes', value: res.payload.learningOutcomes } });
            setLearningOutcomes(res.payload.learningOutcomes)
            setTags(res.payload.tags)
            notifySuccess("Name,Description,Tags and Learning Outcomes enhanced successfully",{
                // message: "Text enhanced successfully",
                title: "Text created successfully"
            })
        }).catch((err) => {
            notifyError("Failed to create with AI",{
                message: err.message,
                title: "Failed to create with AI"
            })
        }).finally(() => {
            setAiProcessing(false)
        })
    }
    const generateImage = (title, description) => {
        if (title.trim().length < 5 || description.trim().length < 5) {
            alert("Title and description must be at least 5 characters long")
            return
        }
        if (generatingImage) {
            alert("Please wait for the previous request to complete")
            return
        }
        setGeneratingImage(true)
        dispatch(generateImage({ title, description })).then((res) => {
            handleInputChange({ target: { name: 'thumbnail', value: res.payload.thumbnail } });
        }).catch((err) => {
            notifyError("Failed to generate image",{
                message: err.message,
                title: "Failed to generate image"
            })
        }).finally(() => {
            setGeneratingImage(false)
        })
    }
    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return newContent.title && newContent.description && newContent.learningOutcomes.length > 0 && newContent.tags.length > 0 && newContent.prerequisites !== "";
            case 2:
                return contentType === "Upload File" ? newContent.primaryFile : newContent.externalResource || newContent.richText;
            case 3:
                return newContent.duration && newContent.category 
            default:
                return true;
        }
    };

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
                id: Date.now(),
                status: "Draft",
                createdDate: new Date().toISOString(),
            };
            const res = await dispatch(admincreateContent(moduleData));
            if(admincreateContent.fulfilled.match(res)){
                notifySuccess("Module created successfully");
                setShowModal(false);
            }else{
                notifyError("Failed to create module",{
                    message: res.payload.message,
                    title: "Failed to create module"
                });
            }
        } catch (err) {
            // console.error("Error creating module:", err);
            notifyError("Failed to create module",{
                message: err.message,
                title: "Failed to create module"
            });
        } finally {

        }
    };
    const handleEditContent = async () => {
        const res = await dispatch(adminupdateContent({ id: editContentId, updatedData: newContent }));
        if(adminupdateContent.fulfilled.match(res)){
            notifySuccess("Module updated successfully");
            setShowEditModal(false);
        }else{
            notifyError("Failed to update module",{
                message: res.payload.message,
                title: "Failed to update module"
            });
        }
    };
    /* File Preview (Modal) */
    const getFileType = (file, url) => {
        if (file && typeof file !== 'string' && file.type) return file.type;
        const href = typeof file === 'string' ? file : url || '';
        const lower = href.toLowerCase();
        if (lower.endsWith('.pdf')) return 'application/pdf';
        if (/(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(lower)) return 'image/*';
        if (/(mp4|webm|ogg)$/.test(lower)) return 'video/*';
        if (/(mp3|wav|aac|m4a|ogg)$/.test(lower)) return 'audio/*';
        return 'application/octet-stream';
    };

    const handlePreviewFile = (file) => {
        if (!file) return;
        const isUrl = typeof file === 'string';
        const url = isUrl ? file : URL.createObjectURL(file);
        const name = isUrl ? (file.split('/').pop() || 'Preview') : (file.name || 'Preview');
        const type = getFileType(file, url);
        setFilePreview({ open: true, url, name, type, isBlob: !isUrl });
    };

    const closeFilePreview = () => {
        setFilePreview((prev) => {
            if (prev.isBlob && prev.url) {
                try { URL.revokeObjectURL(prev.url); } catch (_) { }
            }
            return { open: false, url: null, name: '', type: '', isBlob: false };
        });
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
        if (confirm) {
            if (!drafts) {
                const drafts = [];
                drafts.push(newContent);
                newContent.primaryFile = null;
                newContent.additionalFile = null;
                newContent.thumbnail = null;
                localStorage.setItem('drafts', JSON.stringify(drafts));
            } else {
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
        <div className="addOrg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div className="addOrg-modal-content" >
                {/* HEADER */}
                <div className="addOrg-modal-header">
                    <div className="addOrg-header-content">
                        <div className="addOrg-header-icon">
                            <GoBook size={24} color="#5570f1" />
                        </div>
                        <div>
                            <h2>{showEditModal ? "Edit Module" : "Add New Module"}</h2>
                            <p className="addOrg-header-subtitle">
                                Step {currentStep} of {totalSteps} : {currentStep === 1 ? "Basic Information" : currentStep === 2 ? "Files and Resources" : currentStep === 3 ? "Meta Data and Configurations" : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="addOrg-close-btn"
                        onClick={() => setShowModal(false)}
                        aria-label="Close modal"
                    >
                        <GoX size={20} />
                    </button>
                </div>
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
                            <div >
                                <div className="module-overlay__form-group" style={{ marginBottom: '20px' }}>
                                    <label className="module-overlay__form-label">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Module Title <span className="module-overlay__required">*</span>
                                            {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newContent.title}
                                        onChange={handleInputChange}
                                        className="addOrg-form-input"
                                        placeholder="Enter module title"
                                        required
                                        autoComplete="off"
                                        style={{ width: '100%' }}
                                        disabled={aiProcessing}
                                    />


                                </div>

                                <div className="module-overlay__form-group">
                                    <label className="module-overlay__form-label">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Module Description <span className="module-overlay__required">*</span>
                                            {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newContent.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="addOrg-form-input"
                                        placeholder="Describe the intent, target audience, and what learners will gain"
                                        required
                                        style={{ width: '100%' }}
                                        disabled={aiProcessing}
                                    />


                                </div>
                                <button
                                    type="button"
                                    className="survey-assess-btn-link"
                                    onClick={() => setAiHelpOpen(prev => !prev)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', background: 'transparent' }}
                                    aria-expanded={aiHelpOpen}
                                    aria-controls="ai-help-panel"
                                >
                                    <Info size={16} /> How create with ai works
                                </button>
                                <button className='btn-primary' style={{ width: '70%', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => enhanceTexthelper(newContent.title, newContent.description)}>{aiProcessing ? "Please Wait.." : "Create with AI ✨"}</button>
                                {aiHelpOpen && (
                                    <div
                                        id="ai-help-panel"
                                        style={{
                                            width: '70%',
                                            margin: '0 auto 12px',
                                            background: '#eef2ff',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            padding: '10px 12px',
                                            color: '#1f2937',
                                            fontSize: 14
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Create with AI – How it works</div>
                                        <ul style={{ marginLeft: 16, listStyle: 'disc' }}>
                                            <li>Fill <strong>Title</strong> and <strong>Description</strong>. These are required to enable the button.</li>

                                            <li>Click <strong>“Create with AI ✨”</strong>And wait for a moment, You get enhanced title,description,tags and learning outcomes</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="module-overlay__form-group" style={{ marginTop: '20px' }}>
                                <label className="module-overlay__form-label">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Learning Outcomes <span className="module-overlay__required">*</span>
                                        {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                </label>
                                <div className="module-overlay__learning-outcomes" >
                                    {learningOutcomes?.map((outcome, index) => (
                                        <div key={index} className="module-overlay__learning-outcome-item">
                                            <input
                                                type="text"
                                                value={outcome}
                                                onChange={(e) => updateLearningOutcome(index, e.target.value)}
                                                className="addOrg-form-input"
                                                placeholder={`Learning outcome ${index + 1}`}
                                                style={{ width: '100%' }}
                                                disabled={aiProcessing}
                                            />
                                            {learningOutcomes.length > 1 && (
                                                <button
                                                    disabled={aiProcessing}
                                                    type="button"
                                                    onClick={() => removeLearningOutcome(index)}
                                                    className="addOrg-close-btn"
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
                                        className="add-btn"
                                        style={{ width: 'fit-content', alignSelf: 'flex-end' }}
                                        disabled={aiProcessing}
                                    >
                                        <Plus size={16} /> Add Learning Outcome
                                    </button>
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Tags<span className='module-overlay__required'>*</span>
                                        {aiProcessing && <span><CustomLoader2 size={16} text={'Loading...'} /></span>}</span>
                                </label>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagInputKeyDown}
                                    className="addOrg-form-input"
                                    placeholder="Type a tag and press Enter or comma"
                                    autoComplete="off"
                                    disabled={aiProcessing}
                                    style={{ width: '100%' }}
                                />
                                <div className="module-overlay__tags-container">
                                    {tags?.map((tag, index) => (
                                        <span key={index} className="module-overlay__tag">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="module-overlay__tag-remove"
                                                aria-label={`Remove tag ${tag}`}
                                                disabled={aiProcessing}
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="module-overlay__form-group">
                                <label className="module-overlay__form-label">Prerequisites<span className='module-overlay__required'>*</span></label>
                                <input
                                    type="text"
                                    name="prerequisites"
                                    value={newContent.prerequisites || ''}
                                    onChange={handleInputChange}
                                    className="addOrg-form-input"
                                    placeholder="Required prior knowledge"
                                    autoComplete="off"
                                    style={{ width: '100%' }}
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

                                {/* <button style={{ float: 'right', background: 'gray', border: 'none', cursor: 'pointer', color: 'white', padding: '5px 10px', borderRadius: '5px' }} onClick={() => generateImage(newContent.title, newContent.description)}>{generatingImage ? "Please Wait.." : "Create with AI ✨"}</button> */}
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
                            <label className="module-overlay__form-label">Description</label>

                            <textarea
                                name="instructions"
                                rows={4}
                                value={newContent.instructions || ''}
                                onChange={handleInputChange}
                                className="addOrg-form-input"
                                placeholder="Add instructions for the module"
                                style={{ width: '100%' }}
                            />

                            {contentType === 'Upload File' ? (
                                <div className="module-overlay__form-group">
                                    <div>
                                        <label className="module-overlay__form-label">Upload File <span className='module-overlay__required'>*</span></label>

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
                                    </div>

                                    <div style={{ marginTop: '100px' }}>
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
                                <div className="module-overlay__form-group" style={{ marginTop: '20px' }}>
                                    <label className="module-overlay__form-label">Enter Text<span className='module-overlay__required'>*</span></label>
                                    <FullRichTextEditor value={newContent.richText || ''} onChange={handleRichInputChange} />

                                    <label className="module-overlay__form-label" style={{ marginTop: '20px' }}>External Resource</label>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="text"
                                            name="externalResource"
                                            value={newContent.externalResource || ''}
                                            onChange={(e) => {
                                                const normalized = normalizeExternalUrl(e.target.value);
                                                handleInputChange({ target: { name: 'externalResource', value: normalized } });
                                            }}
                                            className="addOrg-form-input"
                                            placeholder="Add external resource URL (YouTube links auto-convert to embed)"
                                            style={{ width: '100%' }}
                                        />
                                        {isValidUrl && (
                                            <button
                                                type="button"
                                                className="btn-primary"
                                                onClick={() => setShowIframe(!showIframe)}
                                                aria-expanded={showIframe}
                                                aria-controls="externalResourceIframe"
                                            >
                                                {showIframe ? 'Hide' : 'Preview'}
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
                                    <div style={{ marginTop: '20px' }}>
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
                        <div className="module-overlay__step" >
                            <div className="module-overlay__form-row">
                                <div className="module-overlay__form-group" >
                                    <label className="module-overlay__form-label">
                                        Duration (in minutes) <span className="module-overlay__required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        min="1"
                                        value={newContent.duration || ''}
                                        onChange={handleInputChange}
                                        className="addOrg-form-input"
                                        required
                                        placeholder="e.g. 60"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className='module-overlay__form-group'>
                                    <label className="module-overlay__form-label">
                                        Credits
                                    </label>
                                    <select name="credits" id="" value={newContent.credits || 0} onChange={handleInputChange} className='addOrg-form-input' style={{ width: '180px' }}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                    </select>
                                </div>
                                <div className='module-overlay__form-group'>
                                    <label className="module-overlay__form-label slider-label">
                                        Stars
                                    </label>

                                    <select name="stars" id="" value={newContent.stars || 0} onChange={handleInputChange} className='addOrg-form-input' style={{ width: '180px' }}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                    </select>
                                </div>
                                <div className='module-overlay__form-group'>
                                    <label className="module-overlay__form-label slider-label">
                                        Badges
                                    </label>
                                    {/* <span className="slider-value">{newContent.badges || 0}</span> */}
                                    <select name="badges" id="" value={newContent.badges || 0} onChange={handleInputChange} className='addOrg-form-input' style={{ width: '180px' }}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                    </select>
                                </div>
                            </div>

                            <div className='module-overlay__form-row' style={{ marginTop: '20px' }}>
                                <div className='module-overlay__form-group'>
                                    <label className="module-overlay__form-label">
                                        Category <span className="module-overlay__required">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={newContent.category || ''}
                                        onChange={handleInputChange}
                                        className="addOrg-form-input"
                                        required
                                        style={{ width: '300px' }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="module-overlay__form-group" >
                                    
                                </div>
                                <div className="module-overlay__form-group">
                                    <label className="module-overlay__form-label">
                                        Target Team <span className="module-overlay__required">*</span>
                                    </label>
                                    <select
                                        name="team"
                                        value={newContent.team._id || newContent.team}
                                        onChange={handleInputChange}
                                        className="addOrg-form-input"
                                        required
                                        style={{ width: '250px' }}
                                    >
                                        <option value="">Select Sub Team</option>
                                        {teams?.map((team) => (
                                            <option key={team._id} value={team._id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                                <div className="module-overlay__form-group">
                                    <label className="module-overlay__form-label">
                                        Target Sub Team <span className="module-overlay__required">*</span>
                                    </label>
                                    <select value={newContent.subteam || ""} 
                                        name="subteam"
                                        onChange={handleInputChange}
                                        className="addOrg-form-input"
                                        required
                                        style={{width:"200px"}}>

                                        <option value="">All Sub-Teams</option>
                                        {teams
                                            .find(team => team._id === newContent.team)
                                            ?.subTeams
                                            ?.map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                    </select>

                                </div>
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
                                        name="submissionEnabled"
                                        checked={!!newContent.submissionEnabled}
                                        onChange={(e) =>
                                            handleInputChange({ target: { name: 'submissionEnabled', value: e.target.checked } })
                                        }
                                    />
                                    Allow learners submissions
                                </label>
                                <p style={{ fontSize: '12px', color: '#666', marginLeft: "30px" }}>Allow learners to submit their work for grading and feedback.
                                    Please enable this if you have an additional file.
                                </p>
                                <div className="module-overlay__form-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: "120px" }}>
                                    {/* <button className='btn-primary' onClick={handleSaveDraft} disabled={editContentId}>Save Draft</button> */}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                {preview && <ModulePreview data={newContent} teams={teams} onClose={() => setPreview(false)} />}

                {filePreview.open && (
                    <div className="addOrg-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="filePreviewTitle">
                        <div className="addOrg-modal-content" style={{ maxWidth: '1000px', width: '199%', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="addOrg-modal-header">
                                <div className="addOrg-header-content">
                                    <div className="addOrg-header-icon">
                                        <EyeIcon size={24} color="#5570f1" />
                                    </div>
                                    <div>
                                        <h2 id="filePreviewTitle">Preview: {filePreview.name}</h2>
                                    </div>
                                </div>
                                <button type="button" className="addOrg-close-btn" onClick={closeFilePreview} aria-label="Close file preview">
                                    <GoX size={20} />
                                </button>
                            </div>
                            <div className="module-overlay__body" style={{ flex: 1, overflow: 'hidden' }}>
                                {/* Viewer */}
                                {filePreview.type === 'application/pdf' || /^https?:/i.test(filePreview.url) ? (
                                    <iframe title="File Preview" src={filePreview.url} width="100%" height="100%" style={{ border: 'none', height: '100%' }} />
                                ) : filePreview.type.startsWith('image/') || filePreview.type === 'image/*' ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f7' }}>
                                        <img src={filePreview.url} alt={filePreview.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                ) : filePreview.type.startsWith('video/') || filePreview.type === 'video/*' ? (
                                    <video src={filePreview.url} controls style={{ width: '100%', height: '100%' }} />
                                ) : filePreview.type.startsWith('audio/') || filePreview.type === 'audio/*' ? (
                                    <div style={{ padding: '16px' }}>
                                        <audio src={filePreview.url} controls style={{ width: '100%' }} />
                                    </div>
                                ) : (
                                    <div style={{ padding: '16px' }}>
                                        <p>Preview not supported. You can download and view the file.</p>
                                        <a href={filePreview.url} download={filePreview.name} className="btn-primary">Download</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="module-overlay__footer">
                    <div className="module-overlay__step-navigation">

                        <button type="button" className="btn-secondary" onClick={prevStep} aria-label="Previous Step" disabled={currentStep === 1}>
                            <ChevronLeft size={16} /> Previous
                        </button>

                        <div className="module-overlay__action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {currentStep === totalSteps && <button className='btn-secondary' onClick={() => setPreview(true)} disabled={!canProceed()} ><EyeIcon size={16} /> Preview</button>}

                            <button className="btn-secondary" onClick={() => setShowModal(false)} aria-label="Cancel " disabled={uploading}>
                                Cancel
                            </button>
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    className="btn-primary"
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
                                    className="btn-primary"
                                    onClick={showEditModal ? handleEditContent : handleAddContent}
                                    disabled={uploading || !canProceed()}
                                    aria-label="Create Module"
                                >
                                    {uploading ? (<CustomLoader2 size={16} color="#5570f1" strokeWidth={3} />) : showEditModal ? 'Update Module' : 'Create Module'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleModal;
