import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssessmentPreview.css';
import { GoBook } from 'react-icons/go';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLast, ChevronLeft, ChevronRight, FileText, Check } from 'lucide-react';
import AssessmentQuiz from '../../Assessments/Assessment';
const AssessmentPreview = ({ isOpen, onClose, data, embedded }) => {
    // console.log("data in Assessment in main preview", data)
    const navigate = useNavigate();
    const [showQuiz, setShowQuiz] = useState(false);
    const [activeTab, setActiveTab] = useState('preview');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [submission, setSubmission] = useState(null);
    const objectUrlRef = useRef(null);
    const [feedbackReaction, setFeedbackReaction] = useState(null); // 'like' | 'dislike' | null
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isAssessmentActive, setIsAssessmentActive] = useState(false); // Track if assessment is active (not preview)
    // Initialize from incoming data
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

    // Helpers
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
        return { name, url: res.url, kind: guessKind(ext) };
    };

    useEffect(() => () => {
        // cleanup any created object URLs
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    // Derived display values with safe fallbacks
    const title = data?.title || 'Untitled Assessment';
    const category = data?.category || 'Uncategorized';
    const trainingType = data?.trainingType || '—';
    const teamName = data?.team?.name || '—';
    const subteamName = data?.subteam?.name || '—';
    const durationMins = Number.isFinite(data?.duration) ? data.duration : null;
    const credits = data?.credits ?? 0;
    const badges = data?.badges ?? 0;
    const stars = data?.stars ?? 0;
    const tags = Array.isArray(data?.tags) ? data.tags : [];
    const prerequisitesArr = Array.isArray(data?.prerequisites) ? data.prerequisites : [];
    const description = data?.description || 'No overview provided.';
    const outcomes = Array.isArray(data?.learningOutcomes) ? data.learningOutcomes : [];
    const videoSrc = data?.primaryFile || null;
    const thumbnail = data?.thumbnail || '';
    const resource = data?.externalResource || null;
    const resourceKind = resource ? guessKind(getFileExt(resource)) : null;
    const additionalFile = data?.additionalFile || null
    const instructions = data?.instructions || null

    // Determine modal open state: default open if not controlled via props
    const open = typeof isOpen === 'boolean' ? isOpen : true;
    const handleClose = () => {
        if (onClose) return onClose();
        // Fallback: navigate back if this was opened via route
        navigate(-1);
    };

    const handleSwitchToPreview = () => {
        setActiveTab('preview');
    };

    const handleQuizClose = () => {
        setShowQuiz(false);
        setIsAssessmentActive(false); // Reset to preview mode when quiz closes
        setActiveTab('preview');

    };

    const handleStartAssessment = () => {
        setShowQuiz(true);
        setIsAssessmentActive(true); // Set assessment to active mode (not preview)
    };

    const handleTabChange = (tab) => {
        setShowQuiz(false);
        setIsAssessmentActive(false); // Reset to preview mode when changing tabs
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

    const handleComplete = () => {
        alert('Assessment marked complete (dummy action).');
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
        // Close resources and go to preview after feedback submission
        setShowQuiz(false);
        setActiveTab('preview');
    };

    // Progress header removed; tabs moved to modal header

    if (!open) return null;

    return (
        <div className={embedded ? 'module-preview-overlay-embedded' : 'module-preview-overlay'} onClick={handleClose}>
            <div className="module-preview-container" onClick={(e) => e.stopPropagation()}>
                {/* Fixed Header */}
                {embedded ? null : <div className="module-preview-header">
                    <div className="module-preview-header-left">
                        <div className="assess-modal-icon">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="module-preview-title">Assessment Preview</div>
                        </div>
                    </div>
                    <div className="module-preview-tabs" role="tablist" aria-label="Module sections">
                        <button
                            className={`${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleTabChange('preview')}
                            role="tab"
                            aria-selected={activeTab === 'preview'}
                            style={{ width: "120px", justifyContent: "center" }}
                        >
                            Preview
                        </button>
                        <button
                            className={`${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={handleStartAssessment}
                            role="tab"
                            aria-selected={activeTab === 'resources'}
                            style={{ width: "120px", justifyContent: "center" }}
                        >
                            Assessment
                        </button>
                    </div>
                    <button className="module-preview-close-btn" onClick={handleClose} aria-label="Close preview">✕</button>
                </div>}

                {/* Scrollable Content */}
                <div className="global-preview-wrap">
                    <div className="global-preview-panel">
                        <div className="global-preview-content">

                            {activeTab === 'preview' && (
                                <div className="global-preview-tab-pane">
                                    <div className="global-preview-preview-grid">

                                        <div className="global-preview-left-col">
                                            <div className="global-preview-title-row">
                                                <div className="global-preview-module-title">{title}</div>
                                                <div className="global-preview-training-category">
                                                    Training Category: {category}
                                                </div>
                                                <div className="global-preview-meta-row">
                                                    <div>
                                                        <strong className="global-preview-meta-label">Target Team</strong>
                                                        <span className="global-preview-meta-value">{teamName}</span>
                                                    </div>
                                                    <div>
                                                        <strong className="global-preview-meta-label">Target Sub Team</strong>
                                                        <span className="global-preview-meta-value">{subteamName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="global-preview-stats-row">
                                                <div className="global-preview-stat" data-tooltip="Total run-time of all videos and activities">
                                                    <span className="global-preview-icon">⏱</span>{durationMins ? `${durationMins} mins` : '—'}
                                                </div>
                                                <div className="global-preview-stat" data-tooltip="Credits awarded after completion">
                                                    <span className="global-preview-icon">🎓</span>{credits} Credit{Number(credits) === 1 ? '' : 's'}
                                                </div>
                                                <div className="global-preview-stat" data-tooltip="Badges achievable in this Assessment">
                                                    <span className="global-preview-icon">🏅</span>{badges} Badge{Number(badges) === 1 ? '' : 's'}
                                                </div>
                                                <div className="global-preview-stat" data-tooltip="Stars achievable in this Assessment">
                                                    <span className="global-preview-icon">⭐</span>{stars} Star{Number(stars) === 1 ? '' : 's'}
                                                </div>

                                            </div>
                                            <div className="global-preview-stats-row">
                                                <div className="global-preview-stat" data-tooltip="Total number of questions">
                                                    <span className="global-preview-icon">❓</span>{data.questions?.length || 0} Question{data.questions?.length === 1 ? '' : 's'}
                                                </div>
                                                <div className="global-preview-stat" data-tooltip="Number of attempts allowed">
                                                    <span className="global-preview-icon">🔄</span> {data.attempts <= 9 ? data.attempts : 'Unlimited'} Attempts
                                                </div>
                                                <div className="global-preview-stat" data-tooltip="Passing percentage required">
                                                    <span className="global-preview-icon">🎯</span> {data.passPercentage || 0}% to Pass
                                                </div>
                                            </div>

                                            <div className="global-preview-small-row">
                                                <div className="global-preview-card">
                                                    <h3>Overview</h3>
                                                    <p>{description.slice(0, 250)}{description.length > 250 ? '...' : ''}</p>
                                                </div>

                                                
                                                {/* <div className="global-preview-card">
                                                    <h3>Number of Questions : {data.questions.length}</h3>
                                                    <h3>Attempts : {data.attempts}</h3>
                                                    <h3>Pass Percentage : {data.passPercentage}%</h3>
                                                </div> */}
                                            </div>
                                        </div>

                                        <div className="global-preview-right-col-content">
                                            <div className="global-preview-image-card">
                                                {thumbnail ? (
                                                    <img src={thumbnail} alt="Assessment thumbnail" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
                                                ) : (
                                                    <span>Assessment Thumbnail</span>
                                                )}
                                            </div>

                                            <div className="global-preview-details" style={{width:"100%"}}>
                                                <div className="global-preview-card">
                                                    <h3>Tags</h3>
                                                    <div className="global-preview-tags-wrap">
                                                        {tags.length ? (
                                                            tags.slice(0, 3).map((t, idx) => (
                                                                <div key={idx} className="global-preview-tag">{t}</div>
                                                            ))
                                                        ) : (
                                                            <div className="global-preview-tag">No tags</div>
                                                        )}
                                                        {tags.length > 3 && (
                                                            <div className="global-preview-tag">+{tags.length - 3} more</div>
                                                        )}
                                                    </div>
                                                </div>
                                                



                                                {instructions ? (
                                                    <div className="global-preview-card">
                                                        <h3>Instructions</h3>
                                                        <div
                                                            className="global-preview-richtext"
                                                            style={{
                                                                maxWidth: '100%',
                                                                overflow: 'hidden',
                                                                wordWrap: 'break-word',
                                                                overflowWrap: 'break-word', padding: '0px', border: 'none',
                                                            }}
                                                            dangerouslySetInnerHTML={{ __html: instructions }}
                                                        /> </div>
                                                ) : (
                                                    <p className="global-preview-prereq">No Instructions provided.</p>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {!showQuiz && activeTab === 'resources' && (
                                
                                <div className="global-preview-tab-pane global-preview-resources-pane">
                                    {embedded && (<AssessmentQuiz isOpen={open} onClose={handleQuizClose} previewMode={false} assessmentData={data} embedded={embedded} />)}
                                    <div className="global-preview-resources-content">
                                        {data.feedbackEnabled ? (
                                            <div className="global-preview-card" style={{ height: '22%' }} >
                                                <div className="feedback-header-row" style={{ marginBottom: "20px" }}>
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
                                                    <div className="global-preview-iframe-container" style={{ marginTop: 8 }}>
                                                        <iframe src={data.feedback} frameBorder="0" title="Feedback"></iframe>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}
                            {showQuiz && !embedded && (<AssessmentQuiz isOpen={open} onClose={handleQuizClose} previewMode={!isAssessmentActive} assessmentData={data} embedded={embedded} />)}
                            
                        </div>
                    </div>
                </div>
             {activeTab === 'preview' && <div className="global-preview-actions" style={{marginTop:'0px'}}>
                    <div></div>
                    <div className="global-preview-actions-buttons">

                        {activeTab === 'preview' && <button className="btn-primary" onClick={embedded ?()=> setActiveTab('resources') : handleStartAssessment}>
                            Start Assessment <ChevronRight size={16} />
                        </button>}
                    </div>
                </div>}
            </div>
        </div>
    );
};

export default AssessmentPreview;