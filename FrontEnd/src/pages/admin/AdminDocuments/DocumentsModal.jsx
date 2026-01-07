import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, EyeIcon, Info, Loader, Plus, X } from 'lucide-react';
import './DocumentsModal.css';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import CustomLoader2 from '../../../components/common/Loading/CustomLoader2';
import ModulePreview from '../../../components/common/Preview/Preview';
import api from '../../../services/api';
import FullRichTextEditor from './RichText';
import CustomError from '../../../components/common/Error/Error';
import { GoBook, GoX } from 'react-icons/go';
import { admincreateContent, adminupdateContent, enhanceText } from '../../../store/slices/adminDocumentSlice';
import { categories } from '../../../utils/constants';
import { notifyError, notifySuccess } from '../../../utils/notification';
import CustomSelect from '../../../components/dropdown/DropDown';

const DocumentsModal = ({
    showModal, setShowModal, newContent, handleInputChange, showEditModal, setShowEditModal, editContentId, drafts, setDrafts, handleRichInputChange, teams
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
   
    // Run URL validation when externalResource changes
    useEffect(() => {
        setShowIframe(false); // hide iframe whenever URL changes
        if (newContent.externalResource && validateUrl(newContent.externalResource)) {
            setIsValidUrl(true);
        } else {
            setIsValidUrl(false);
        }
    }, [newContent.externalResource]);

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
                return newContent.title && newContent.description; 
                      
            case 2:
                return contentType === "Upload File" ? newContent.primaryFile : newContent.externalResource || newContent.richText;
            case 3:
                return newContent.duration && newContent.category 
            default:
                return true;
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
                            <h2>{showEditModal ? "Edit Document" : "Add New Document"}</h2>
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
                <div className="document-overlay__progress">
                    <div
                        className="document-overlay__progress-bar"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>

                {/* BODY */}
                <div className="document-overlay__body" style={{ overflowY: 'auto', height: 'calc(100vh - 180px)' }}>
                    {currentStep === 1 && (
                        <div className="document-overlay__step">
                            <div >
                                <div className="document-overlay__form-group" style={{ marginBottom: '20px' }}>
                                    <label className="document-overlay__form-label">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Document Title <span className="document-overlay__required">*</span>
                                          </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={newContent.title}
                                        onChange={handleInputChange}
                                        className="addOrg-form-input"
                                        placeholder="Enter document title"
                                        required
                                        autoComplete="off"
                                        style={{ width: '100%' }}
                                       
                                    />


                                </div>

                                <div className="document-overlay__form-group">
                                    <label className="document-overlay__form-label">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>Document Description <span className="document-overlay__required">*</span>
                                           </span>
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
                                       
                                    />

                                </div>
                            </div>

          
                            <div className="document-overlay__form-group">
                                <label className="document-overlay__form-label">Thumbnail</label>
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
                                    <div className="document-overlay__uploaded-file-container">
                                        <span className="document-overlay__uploaded-file-name" title={typeof newContent.thumbnail === 'string' ? newContent.thumbnail.split('/').pop() : newContent.thumbnail.name}>
                                            {typeof newContent.thumbnail === 'string' ? newContent.thumbnail.split('/').pop() : newContent.thumbnail.name}
                                        </span>
                                        <div className="document-overlay__file-actions">
                                            <button
                                                type="button"
                                                className="document-overlay__btn-preview"
                                                onClick={() => handlePreviewFile(newContent.thumbnail)}
                                                aria-label="Preview uploaded file"
                                            >
                                                <EyeIcon size={16} /> Preview
                                            </button>
                                            <button
                                                type="button"
                                                className="document-overlay__btn-delete"
                                                onClick={handleRemoveThumbnail}
                                                aria-label="Delete uploaded file"
                                            >
                                                <RiDeleteBin2Fill size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label htmlFor="thumbnail" className="document-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                                        <Plus size={16} /> Upload File
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="document-overlay__step">
                            <div className="document-overlay__content-type-buttons">
                                <button
                                    type="button"
                                    className={`document-overlay__content-type-btn ${contentType === 'Upload File' ? 'active' : ''}`}
                                    onClick={() => setContentType('Upload File')}
                                    aria-pressed={contentType === 'Upload File'}
                                >
                                    Upload File
                                </button>
                                {/* <button
                                    type="button"
                                    className={`module-overlay__content-type-btn ${contentType === 'Text / External URL' ? 'active' : ''}`}
                                    onClick={() => setContentType('Text / External URL')}
                                    aria-pressed={contentType === 'Text / External URL'}
                                >
                                    Text / External URL
                                </button> */}
                            </div>
                            <label className="document-overlay__form-label">Description</label>

                            <textarea
                                name="instructions"
                                rows={4}
                                value={newContent.instructions || ''}
                                onChange={handleInputChange}
                                className="addOrg-form-input"
                                placeholder="Add instructions for the document"
                                style={{ width: '100%' ,marginBottom:"15px"}}
                            />

                            {contentType === 'Upload File' ? (
                                <div className="document-overlay__form-group">
                                    <div>
                                        <label className="document-overlay__form-label">Upload File <span className='document-overlay__required'>*</span></label>

                                        <input
                                            type="file"
                                            name="primaryFile"
                                            onChange={handleInputChange}
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx,.mp4,.mp3,.scorm"
                                            id="uploadFiles"
                                        />
                                        {newContent.primaryFile ? (
                                            <div className="document-overlay__uploaded-file-container">
                                                <span className="document-overlay__uploaded-file-name" title={typeof newContent.primaryFile === 'string' ? newContent.primaryFile.split('/').pop() : newContent.primaryFile.name}>
                                                    {typeof newContent.primaryFile === 'string' ? newContent.primaryFile.split('/').pop() : newContent.primaryFile.name}
                                                </span>
                                                <div className="document-overlay__file-actions">
                                                    <button
                                                        type="button"
                                                        className="document-overlay__btn-preview"
                                                        onClick={() => handlePreviewFile(newContent.primaryFile)}
                                                        aria-label="Preview uploaded file"
                                                    >
                                                        <EyeIcon size={16} /> Preview
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="document-overlay__btn-delete"
                                                        onClick={handleRemoveFile}
                                                        aria-label="Delete uploaded file"
                                                    >
                                                        <RiDeleteBin2Fill size={16} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label htmlFor="uploadFiles" className="document-overlay__upload-label" tabIndex={0} onKeyPress={e => { if (e.key === 'Enter') document.getElementById('uploadFiles').click(); }}>
                                                <Plus size={16} /> Upload File
                                            </label>
                                        )}
                                    </div>

                                   
                                </div>
                            ) : (
                                <div className="document-overlay__form-group" style={{ marginTop: '20px' }}>
                                    
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="document-overlay__step" >
                            <div className="document-overlay__form-row">
                                <div className="document-overlay__form-group" >
                                    <label className="document-overlay__form-label">
                                        Duration (in minutes) <span className="document-overlay__required">*</span>
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
                                <div className='document-overlay__form-group'>
                                    <label className="document-overlay__form-label">
                                        Credits
                                    </label>
                                    <CustomSelect 
                                        name="credits" 
                                        value={String(newContent.credits || 0)}
                                        options={[
                                            { value: "0", label: "0" },
                                           
                                        ]}
                                        onChange={(value) => handleInputChange({ target: { name: 'credits', value } })}
                                        className='addOrg-form-input' 
                                        style={{ width: '180px' }}
                                        searchable={false}
                                    />
                                </div>
                                <div className='document-overlay__form-group'>
                                    <label className="document-overlay__form-label slider-label">
                                        Stars
                                    </label>

                                    <CustomSelect 
                                        name="stars" 
                                        value={String(newContent.stars || 0)}
                                        options={[
                                            { value: "0", label: "0" },
                                           
                                        ]}
                                        onChange={(value) => handleInputChange({ target: { name: 'stars', value } })}
                                        className='addOrg-form-input' 
                                        style={{ width: '180px' }}
                                        searchable={false}
                                    />
                                </div>
                                <div className='document-overlay__form-group'>
                                    <label className="document-overlay__form-label slider-label">
                                        Badges
                                    </label>
                                    {/* <span className="slider-value">{newContent.badges || 0}</span> */}
                                    <CustomSelect 
                                        name="badges" 
                                        value={String(newContent.badges || 0)}
                                        options={[
                                            { value: "0", label: "0" },
                                           
                                        ]}
                                        onChange={(value) => handleInputChange({ target: { name: 'badges', value } })}
                                        className='addOrg-form-input' 
                                        style={{ width: '180px' }}
                                        searchable={false}
                                    />
                                </div>
                            </div>

                            <div className='document-overlay__form-row' style={{ marginTop: '20px' }}>
                                <div className='document-overlay__form-group'>
                                    <label className="document-overlay__form-label">
                                        Category <span className="document-overlay__required">*</span>
                                    </label>
                                    <CustomSelect
                                        name="category"
                                        value={newContent.category || ''}
                                        options={[
                                            { value: "", label: "Select Category" },
                                            ...(categories.map((cat) => ({
                                                value: cat,
                                                label: cat
                                            })) || [])
                                        ]}
                                        onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                                        className="addOrg-form-input"
                                        required
                                        style={{ width: '300px' }}
                                        placeholder="Select Category"
                                    />
                                </div>
                                <div className="document-overlay__form-group" >
                                    
                                </div>
                                <div className="document-overlay__form-group">
                                    <label className="document-overlay__form-label">
                                        Target Team <span className="document-overlay__required">*</span>
                                    </label>
                                    <CustomSelect
                                        name="team"
                                        value={newContent.team._id || newContent.team}
                                        options={[
                                            { value: "", label: "Select Team" },
                                            ...(teams?.map((team) => ({
                                                value: team._id,
                                                label: team.name
                                            })) || [])
                                        ]}
                                        onChange={(value) => handleInputChange({ target: { name: 'team', value } })}
                                        className="addOrg-form-input"
                                        required
                                        style={{ width: '250px' }}
                                        placeholder="Select Team"
                                    />

                                </div>
                                <div className="document-overlay__form-group">
                                    <label className="document-overlay__form-label">
                                        Target Sub Team <span className="document-overlay__required">*</span>
                                    </label>
                                    <CustomSelect 
                                        value={newContent.subteam || ""} 
                                        name="subteam"
                                        options={[
                                            { value: "", label: "All Sub-Teams" },
                                            ...(teams
                                                .find(team => team._id === newContent.team)
                                                ?.subTeams
                                                ?.map(sub => ({
                                                    value: sub._id,
                                                    label: sub.name
                                                })) || [])
                                        ]}
                                        onChange={(value) => handleInputChange({ target: { name: 'subteam', value } })}
                                        className="addOrg-form-input"
                                        required
                                        style={{width:"200px"}}
                                        placeholder="All Sub-Teams"
                                        disabled={!newContent.team}
                                    />

                                </div>
                            </div>

                           
                          
                        </div>
                    )}

                </div>
                {/* {preview && <ModulePreview data={newContent} teams={teams} onClose={() => setPreview(false)} />} */}

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
                            <div className="document-overlay__body" style={{ flex: 1, overflow: 'hidden' }}>
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
                <div className="document-overlay__footer">
                    <div className="document-overlay__step-navigation">

                        <button type="button" className="btn-secondary" onClick={prevStep} aria-label="Previous Step" disabled={currentStep === 1}>
                            <ChevronLeft size={16} /> Previous
                        </button>

                        <div className="document-overlay__action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {/* {currentStep === totalSteps && <button className='btn-secondary' onClick={() => setPreview(true)} disabled={!canProceed()} ><EyeIcon size={16} /> Preview</button>} */}

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
                                    aria-label="Create Document"
                                >
                                    {uploading ? (<CustomLoader2 size={16} color="#5570f1" strokeWidth={3} />) : showEditModal ? 'Update Document' : 'Create Document'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentsModal;
