import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './ModuleView.css';
import { GoBook } from 'react-icons/go';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoPlayer from '../../../components/VideoPlayer/VideoPlayer';
import api from '../../../services/api';
import LoadingScreen from '../../../components/common/Loading/Loading';

const ModuleView = ({id,lpId}) => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('preview');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [submission, setSubmission] = useState(null);
    const objectUrlRef = useRef(null);
    const primaryUrlRef = useRef(null);
    const [feedbackReaction, setFeedbackReaction] = useState(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { moduleId, inProgress, assignId } = useParams();
    const [assignment, setAssignment] = useState(null);
    useEffect(() => {
        if(inProgress === "true" || inProgress){
            setActiveTab('resources');
        }
    }, [inProgress]);
    useEffect(() => {
        try {
            setLoading(true);
            const uuid = id || moduleId;
            const fetchData = async () => {
                let response 
                if(!assignId || assignId === "undefined"){
                    response = await api.get(`/api/user/enrolled/getModule/${uuid}`);
                }else{
                    response = await api.get(`/api/user/getModule/${uuid}`);
                }
                setData(response.data);
                setLoading(false);
            };
            const fetchAssignment = async () => {
                const response = await api.get(`/api/user/getAssignment/${assignId}`);
                setAssignment(response.data);
                setLoading(false);
            };
            fetchData();
            // fetchAssignment();
        } catch (error) {
            setLoading(false);
            console.error('Error fetching module data:', error);
        }
        
    }, [moduleId]);

    useEffect(() => {
        if (!data) return;
        const inferType = (url) => {
            if (!url) return 'FILE';
            const ext = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
            if (!ext) return 'FILE';
            if (['pdf'].includes(ext)) return 'PDF';
            if (['mp4', 'webm', 'ogg'].includes(ext)) return 'VIDEO';
            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'IMAGE';
            return ext.toUpperCase();
        };

        const fileName = (url) => {
            try {
                const clean = url.split('?')[0].split('#')[0];
                return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1)) || 'File';
            } catch {
                return 'File';
            }
        };

        const list = [];
        if (data.additionalFile) {
            list.push({
                id: 1,
                name: fileName(data.additionalFile),
                type: inferType(data.additionalFile),
                size: '—',
                url: data.additionalFile,
            });
        }
        if (data.externalResource) {
            list.push({
                id: list.length + 1,
                name: fileName(data.externalResource),
                type: 'LINK',
                size: '—',
                url: data.externalResource,
            });
        }

    }, [data]);

    const getFileExt = (nameOrUrl = '') => {
        const clean = String(nameOrUrl).split('?')[0].split('#')[0];
        const idx = clean.lastIndexOf('.');
        return idx >= 0 ? clean.substring(idx + 1).toLowerCase() : '';
    };

    const guessKind = (ext) => {
        if (!ext) return 'other';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
        return 'other';
    };

    const fileNameFromUrl = (url = '') => {
        try {
            const clean = url.split('?')[0].split('#')[0];
            return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1)) || 'File';
        } catch {
            return 'File';
        }
    };

    const normalizeResource = (res) => {
        // Accepts: {name,url,type} or string url or File object
        if (!res) return null;
        if (typeof res === 'string') {
            const name = fileNameFromUrl(res);
            const ext = getFileExt(res);
            return { name, url: res, kind: guessKind(ext) };
        }
        if (res instanceof File) {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            const url = URL.createObjectURL(res);
            objectUrlRef.current = url;
            const ext = getFileExt(res.name);
            return { name: res.name, url, kind: guessKind(ext) };
        }
        const name = res.name || fileNameFromUrl(res.url || '');
        const ext = getFileExt(res.url || res.name || '');
        const url = res.url || '';
        return url ? { name, url, kind: guessKind(ext) } : null;
    };

    const normalizePrimaryResource = (res) => {
        if (!res) return null;
        if (typeof res === 'string') {
            const name = fileNameFromUrl(res);
            const ext = getFileExt(res);
            return { name, url: res, kind: guessKind(ext) };
        }
        if (res instanceof File) {
            if (primaryUrlRef.current) URL.revokeObjectURL(primaryUrlRef.current);
            const url = URL.createObjectURL(res);
            primaryUrlRef.current = url;
            const ext = getFileExt(res.name);
            return { name: res.name, url, kind: guessKind(ext) };
        }
        const name = res.name || fileNameFromUrl(res.url || '');
        const ext = getFileExt(res.url || res.name || '');
        const url = res.url || '';
        return url ? { name, url, kind: guessKind(ext) } : null;
    };

    useEffect(() => () => {
        // cleanup any created object URLs
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        if (primaryUrlRef.current) URL.revokeObjectURL(primaryUrlRef.current);
    }, []);

    const title = data?.title || 'Untitled Module';
    const category = data?.category || 'Uncategorized';
    const trainingType = data?.trainingType || '—';
    const team = data?.team || '—';
    const subteam = data?.subteam || '—';
    const durationMins = data?.duration || null;
    const credits = data?.credits ?? 0;
    const badges = data?.badges ?? 0;
    const stars = data?.stars ?? 0;
    const tags = Array.isArray(data?.tags) ? data.tags : [];
    const prerequisitesArr = Array.isArray(data?.prerequisites) ? data.prerequisites : [];
    const description = data?.description || 'No overview provided.';
    const outcomes = Array.isArray(data?.learningOutcomes) ? data.learningOutcomes : [];
    const videoSrc = data?.primaryFile || null;
    const primaryRes = normalizePrimaryResource(videoSrc);
    const thumbnail = data?.thumbnail || '';
    const resource = data?.externalResource || null;
    const resourceKind = resource ? guessKind(getFileExt(resource)) : null;
    const additionalFile = data?.additionalFile || null


    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handlePreview = (res) => {
        const norm = normalizeResource(res);
        if (!norm) return;
        setModalContent({ title: `Preview — ${norm.name}`, body: norm });
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setSubmission(file);
    };

    const handlePreviewFile = (fileOrUrl) => {
        const norm = normalizeResource(fileOrUrl || submission);
        if (!norm) return;
        setModalContent({ title: `Preview — ${norm.name}`, body: norm });
        setShowModal(true);
    };

    const handleRemoveFile = () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
        setSubmission(null);
        const input = document.getElementById('uploadFiles');
        if (input) input.value = '';
    };

    const handleSaveDraft = () => {
        alert('Draft saved (dummy action).');
    };

    const handleComplete = async() => {
        if(id){
            const res = await api.post(`/api/user/markComplete/${lpId}/${data._id}`);
            if (res.status === 200) {
                alert('Module marked complete!');
            }
            return;
        }
        try {
            const rewards = {
                stars: data.stars,
                badges: data.badges,
                credits: data.credits,
            }
            const res = await api.post(`/api/user/markComplete/${data._id}`, rewards);
            if (res.status === 200) {
                alert('Module marked complete!');
            }
        } catch (error) {
            console.error('Error marking module complete:', error);
        }
    };

    // Feedback helpers
    const toggleReaction = (type) => {
        setFeedbackReaction((prev) => (prev === type ? null : type));
    };
    const handleCommentChange = (e) => {
        const val = e.target.value.slice(0, 50);
        setFeedbackComment(val);
    };
    const handleFeedbackSubmit = () => {
        // TODO: wire to backend if needed
        alert(`Feedback submitted: ${feedbackReaction || 'no reaction'} | '${feedbackComment}'`);
        setFeedbackReaction(null);
        setFeedbackComment('');
    };

    // Progress header removed; tabs moved to modal header
    if(loading){
        return <LoadingScreen text="Fetching module data..." />;
    }

    return (
        <div >
            
            <div className={` ${id ? 'user-mod-wrap-lp' : 'user-mod-wrap'}`} >
                <div className="user-mod-panel">
                        <div className="assigned-header">
                            {moduleId && <div className="tabs">
                                <button
                                    className={`tab-button `}
                                    onClick={() => window.history.back()}
                                >
                                   <span style={{display: 'flex', alignItems: 'center',textDecoration:"underline"}}><ChevronLeft size={20} /></span>
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preview')}
                                >
                                    Preview
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('resources')}
                                >
                                    Resources
                                </button>
                            </div>}
                            {id && <div className="tabs">
                                {/* <button
                                    className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preview')}
                                >
                                    Preview
                                </button>
                                <button
                                    className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('resources')}
                                >
                                    Resources
                                </button> */}
                            </div>}
                        </div>

                    <div className="user-mod-content">

                        {activeTab === 'preview' && (
                            <div className="user-mod-tab-pane">
                                <div className="user-mod-preview-grid">

                                    <div className="user-mod-left-col">
                                        <div className="user-mod-title-row">
                                            <div className="user-mod-module-title">{title}</div>
                                            <div className="user-mod-training-category">
                                                Training Category: {category}
                                            </div>
                                            <div className="user-mod-meta-row">
                                                {/* <div>
                                                        <strong className="user-mod-meta-label">Training Type</strong>
                                                        <span className="user-mod-meta-value">{trainingType}</span>
                                                    </div> */}
                                                <div>
                                                    <strong className="user-mod-meta-label">Target Team/Sub Team</strong>
                                                    <span className="user-mod-meta-value">{team.name || '-'}/{subteam.name || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user-mod-stats-row">
                                            <div className="user-mod-stat" data-tooltip="Total run-time of all videos and activities">
                                                <span className="user-mod-icon">⏱</span>{durationMins ? `${durationMins} mins` : '—'}
                                            </div>
                                            <div className="user-mod-stat" data-tooltip="Credits awarded after completion">
                                                <span className="user-mod-icon">🎓</span>{credits} Credit{Number(credits) === 1 ? '' : 's'}
                                            </div>
                                            <div className="user-mod-stat" data-tooltip="Badges achievable in this module">
                                                <span className="user-mod-icon">🏅</span>{badges} Badge{Number(badges) === 1 ? '' : 's'}
                                            </div>
                                            <div className="user-mod-stat" data-tooltip="Stars achievable in this module">
                                                <span className="user-mod-icon">⭐</span>{stars} Star{Number(stars) === 1 ? '' : 's'}
                                            </div>
                                        </div>

                                        <div className="user-mod-small-row">
                                            <div className="user-mod-card">
                                                <h3>Prerequisites</h3>
                                                {prerequisitesArr.length ? (
                                                    <ul className="user-mod-learn-list">
                                                        {prerequisitesArr.map((p, idx) => (
                                                            <li key={idx}>• {p}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="user-mod-prereq">Nil</p>
                                                )}
                                            </div>


                                            <div className="user-mod-card">
                                                <h3>Overview</h3>
                                                <p style={{ color: "#0f1724", fontWeight: "400" }}>{description.slice(0, 250)}...</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="user-mod-right-col-content">
                                        <div className="user-mod-image-card">
                                            {thumbnail ? (
                                                <img src={thumbnail} alt="Module thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                            ) : (
                                                <span>Module Thumbnail</span>
                                            )}
                                        </div>

                                        <div className="user-mod-details">

                                            <div className="user-mod-card" style={{ height: "fit-content" }}>
                                                <h3>Tags</h3>
                                                <div className="user-mod-tags-wrap">
                                                    {tags.length ? (

                                                        tags.slice(0, 3).map((t, idx) => (
                                                            <div key={idx} className="user-mod-tag">{t}</div>
                                                        ))
                                                    ) : (
                                                        <div className="user-mod-tag">No tags</div>
                                                    )}
                                                    {tags.length > 3 && (
                                                        <span className="user-mod-tag">+{tags.length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="user-mod-card" style={{ height: "fit-content" }}>
                                                <h3>What you'll learn</h3>
                                                {outcomes.length ? (
                                                    <ul className="user-mod-learn-list">
                                                        {outcomes.slice(0, 2).map((o, idx) => (
                                                            <li key={idx} style={{ fontWeight: "400" }}>✅ {o}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="user-mod-prereq">No learning outcomes provided.</p>
                                                )}
                                                {outcomes.length > 2 && (
                                                    <span className="user-mod-tag">+{outcomes.length - 2} more</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="user-mod-actions">
                                    <div></div>
                                    <div className="user-mod-actions-buttons">
                                        {/* <button className="user-mod-btn user-mod-btn-ghost" onClick={handleSaveDraft}>
                                                Save Draft
                                            </button> */}
                                        <button className="btn-primary" onClick={() => handleTabChange('resources')}>
                                            Next (Resources) <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="user-mod-tab-pane user-mod-resources-pane">
                                <div className="user-mod-resources-content">

                                    {data.instructions && (
                                        <div className="user-mod-card user-mod-instructions-card">
                                            <h3 className="user-mod-card-title">Description</h3>
                                            <div>
                                                {data.instructions}
                                            </div>
                                        </div>
                                    )}

                                    <div className="user-mod-card user-mod-primary-card">
                                        <h3 className="user-mod-card-title">Primary Material</h3>
                                        {/* <p className="user-mod-resource-meta">Content</p> */}
                                        {!primaryRes ? (
                                            <div className="user-mod-richtext" dangerouslySetInnerHTML={{ __html: data.richText }} />
                                        ) : primaryRes.kind === 'video' ? (
                                            <VideoPlayer src={primaryRes.url} poster={thumbnail} theme="light" />
                                        ) : primaryRes.kind === 'image' ? (
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                <img src={primaryRes.url} alt={primaryRes.name} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
                                            </div>
                                        ) : primaryRes.kind === 'pdf' ? (
                                            <div className="user-mod-iframe-container">
                                                <iframe src={primaryRes.url} title={primaryRes.name} />
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="user-mod-no-preview">Preview not available for this file type.</p>
                                                <p>
                                                    <a href={primaryRes.url} target="_blank" rel="noopener noreferrer" className="user-mod-open-link">Open file</a>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {resource && (
                                        <div className="user-mod-card">
                                            <h3 className="user-mod-card-title" style={{ marginBottom: "15px" }}>Supplementary Material</h3>
                                            <div className="user-mod-iframe-container">
                                                {resourceKind === 'video' ? (
                                                    <VideoPlayer src={resource} poster={thumbnail} />
                                                ) : (
                                                    <iframe src={resource} title="Supplementary Resource" />
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {additionalFile && (
                                        <div className="user-mod-card" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                            <h3 className="user-mod-card-title">Additional Material</h3>
                                            <div className="user-mod-resources-list">
                                                <div className="user-mod-resource-item">
                                                    <p className="user-mod-resource-name">{additionalFile.split('/').pop()}</p>
                                                    <div className="user-mod-resource-actions">
                                                        <button onClick={() => handlePreview(additionalFile)} className="user-mod-btn user-mod-btn-primary">Preview</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {(data.submissionEnabled || data.submissionsEnabled) && <div>
                                    <div className="user-mod-card">
                                        <h3 style={{ margin: "10px" }} className="user-mod-card-title">Submission <span className='module-overlay__required'>*</span></h3>

                                        <input
                                            type="file"
                                            name="primaryFile"
                                            style={{ display: 'none' }}
                                            accept=".pdf,.doc,.docx,.mp4,.mp3,.scorm,.png,.jpg,.jpeg,.gif,.webp"
                                            id="uploadFiles"
                                            onChange={handleFileChange}
                                        />
                                        {submission ? (
                                            <div className="module-overlay__uploaded-file-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: "980px" }}>
                                                <span className="module-overlay__uploaded-file-name" title={typeof submission === 'string' ? submission.split('/').pop() : submission.name}>
                                                    {typeof submission === 'string' ? submission.split('/').pop() : submission.name}
                                                </span>
                                                <div className="module-overlay__file-actions">
                                                    <button
                                                        type="button"
                                                        className="module-overlay__btn-preview"
                                                        onClick={() => handlePreviewFile(submission)}
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
                                </div>}
                                {data.feedbackEnabled ? (
                                    <div className="user-mod-card">
                                        <div className="feedback-header-row">
                                            <h3 className="feedback-title">Feedback</h3>
                                            <div className="feedback-actions">
                                                <button
                                                    type="button"
                                                    className={`feedback-btn ${feedbackReaction === 'like' ? 'active like' : ''}`}
                                                    onClick={() => toggleReaction('like')}
                                                    aria-pressed={feedbackReaction === 'like'}
                                                >
                                                    <ThumbsUp size={16} /> Like
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`feedback-btn ${feedbackReaction === 'dislike' ? 'active dislike' : ''}`}
                                                    onClick={() => toggleReaction('dislike')}
                                                    aria-pressed={feedbackReaction === 'dislike'}
                                                >
                                                    <ThumbsDown size={16} /> Dislike
                                                </button>
                                            </div>
                                        </div>
                                        <div className="feedback-input-row">
                                            <input
                                                type="text"
                                                className="feedback-input"
                                                placeholder="Add a comment (max 50 chars)"
                                                value={feedbackComment}
                                                onChange={handleCommentChange}
                                                maxLength={50}
                                            />
                                            <div className="feedback-right">
                                                <span className="feedback-count">{feedbackComment.length}/50</span>
                                                <button
                                                    type="button"
                                                    className="feedback-submit"
                                                    onClick={handleFeedbackSubmit}
                                                    disabled={!feedbackReaction && feedbackComment.trim().length === 0}
                                                >
                                                    <Send size={14} /> Submit
                                                </button>
                                            </div>
                                        </div>
                                        {data.feedback && (
                                            <div className="user-mod-iframe-container" style={{ marginTop: 8 }}>
                                                <iframe src={data.feedback} frameBorder="0" title="Feedback"></iframe>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                                </div>
                                

                                <div className="user-mod-actions">
                                    <div></div>
                                    <div className="user-mod-actions-buttons" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        <button className="btn-secondary" onClick={() => handleTabChange('preview')}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={16} /> Previous</span>
                                        </button>
                                        <button className="btn-primary" onClick={handleComplete}>
                                            ✓ Mark Complete
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showModal && (
                <div className="user-mod-modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="user-mod-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="user-mod-modal-header">
                            <div className="user-mod-modal-title">{modalContent.title}</div>
                            <button className="user-mod-close-btn" onClick={() => setShowModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="user-mod-modal-body">
                            <p className="user-mod-modal-file-info">
                                <strong>Previewing:</strong> {modalContent.body.name}
                            </p>
                            {modalContent.body?.kind === 'pdf' && (
                                <div className="user-mod-iframe-container">
                                    <iframe src={modalContent.body.url} title={modalContent.title} />
                                </div>
                            )}
                            {modalContent.body?.kind === 'image' && (
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <img src={modalContent.body.url} alt={modalContent.title} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
                                </div>
                            )}
                            {modalContent.body?.kind === 'video' && (
                                <VideoPlayer src={modalContent.body.url} />
                            )}
                            {modalContent.body && ['pdf', 'image', 'video'].indexOf(modalContent.body.kind) === -1 && (
                                <div>
                                    <p className="user-mod-no-preview">Preview not available for this file type.</p>
                                    <p>
                                        <a href={modalContent.body.url} target="_blank" rel="noopener noreferrer" className="user-mod-open-link">Open file</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModuleView;