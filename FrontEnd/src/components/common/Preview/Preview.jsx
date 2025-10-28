import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Preview.css';
import { GoBook } from 'react-icons/go';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

const ModulePreview = ({ isOpen, onClose, data }) => {
    console.log(data)
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('preview');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [submission,setSubmission] = useState(null);
    const objectUrlRef = useRef(null);
    const [feedbackReaction, setFeedbackReaction] = useState(null); // 'like' | 'dislike' | null
    const [feedbackComment, setFeedbackComment] = useState('');
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
        if (['mp4','webm','ogg'].includes(ext)) return 'video';
        if (['png','jpg','jpeg','gif','webp','svg'].includes(ext)) return 'image';
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
    const title = data?.title || 'Untitled Module';
    const category = data?.category || 'Uncategorized';
    const trainingType = data?.trainingType || '—';
    const teamName = data?.team?.name || '—';
    const durationMins = Number.isFinite(data?.duration) ? data.duration : null;
    console.log(durationMins)
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

    // Determine modal open state: default open if not controlled via props
    const open = typeof isOpen === 'boolean' ? isOpen : true;
    const handleClose = () => {
        if (onClose) return onClose();
        // Fallback: navigate back if this was opened via route
        navigate(-1);
    };

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

    const handleComplete = () => {
        alert('Module marked complete (dummy action).');
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

    if (!open) return null;

    // Custom Video Player (themed)
    const VideoPlayer = ({ src, poster }) => {
        const videoRef = useRef(null);
        const containerRef = useRef(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [duration, setDuration] = useState(0);
        const [current, setCurrent] = useState(0);
        const [isMuted, setIsMuted] = useState(false);
        const [volume, setVolume] = useState(1);
        const [speed, setSpeed] = useState(1);
        const [fs, setFs] = useState(false);

        const fmt = (s) => {
            if (!Number.isFinite(s)) return '0:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60).toString().padStart(2, '0');
            return `${m}:${sec}`;
        };

        const onLoaded = () => {
            const v = videoRef.current;
            if (!v) return;
            setDuration(v.duration || 0);
        };

        const onTime = () => {
            const v = videoRef.current;
            if (!v) return;
            setCurrent(v.currentTime || 0);
        };

        const togglePlay = () => {
            const v = videoRef.current;
            if (!v) return;
            if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
        };

        const onSeek = (e) => {
            const v = videoRef.current;
            if (!v) return;
            const val = Number(e.target.value);
            v.currentTime = val;
            setCurrent(val);
        };

        const toggleMute = () => {
            const v = videoRef.current; if (!v) return;
            const next = !isMuted; setIsMuted(next); v.muted = next; if (next && volume > 0) { /* keep volume */ };
        };

        const onVolume = (e) => {
            const v = videoRef.current; if (!v) return;
            const val = Number(e.target.value);
            setVolume(val);
            v.volume = val;
            if (val === 0) { setIsMuted(true); v.muted = true; } else if (isMuted) { setIsMuted(false); v.muted = false; }
        };

        const cycleSpeed = () => {
            const steps = [0.75, 1, 1.25, 1.5];
            const idx = steps.indexOf(speed);
            const next = steps[(idx + 1) % steps.length];
            setSpeed(next);
            const v = videoRef.current; if (v) v.playbackRate = next;
        };

        const toggleFs = async () => {
            const el = containerRef.current;
            try {
                if (!document.fullscreenElement && el?.requestFullscreen) {
                    await el.requestFullscreen();
                    setFs(true);
                } else if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setFs(false);
                }
            } catch {}
        };

        return (
            <div className="video-player" ref={containerRef}>
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    onLoadedMetadata={onLoaded}
                    onTimeUpdate={onTime}
                    preload="metadata"
                    playsInline
                    style={{ width: '100%', display: 'block', borderRadius: 8 }}
                />
                <div className="video-controls">
                    <div className="vc-left">
                        <button className="vc-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <div className="vc-time">{fmt(current)} / {fmt(duration)}</div>
                    </div>
                    <div className="vc-center">
                        <input
                            className="vc-seek"
                            type="range"
                            min={0}
                            max={Math.max(0, duration)}
                            step="0.1"
                            value={Math.min(current, duration || 0)}
                            onChange={onSeek}
                            aria-label="Seek"
                        />
                    </div>
                    <div className="vc-right">
                        <button className="vc-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                            className="vc-volume"
                            type="range"
                            min={0}
                            max={1}
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={onVolume}
                            aria-label="Volume"
                        />
                        <button className="vc-btn vc-speed" onClick={cycleSpeed} aria-label="Speed">
                            {speed.toFixed(2).replace(/\.00$/, '')}x
                        </button>
                        <button className="vc-btn" onClick={toggleFs} aria-label={fs ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                            {fs ? <Minimize size={16} /> : <Maximize size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="module-preview-overlay" onClick={handleClose}>
            <div className="module-preview-container" onClick={(e) => e.stopPropagation()}>
                <div className="module-preview-header">
                    <div className="module-preview-header-left">
                        <div className="module-preview-header-icon"><GoBook size={24} color="#5570f1" /></div>
                        <div>
                            <div className="module-preview-title">Module Preview</div>
                            {/* <div className="module-preview-subtitle">Review details and resources before publishing</div> */}
                        </div>
                    </div>
                    <div className="module-preview-tabs" role="tablist" aria-label="Module sections">
                        <button
                            className={` ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleTabChange('preview')}
                            role="tab"
                            aria-selected={activeTab === 'preview'}
                            style={{width:"120px"}}
                        >
                            Preview
                        </button>
                        <button
                            className={`${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleTabChange('resources')}
                            role="tab"
                            aria-selected={activeTab === 'resources'}
                            style={{width:"120px"}}

                        >
                            Resources
                        </button>
                    </div>
                    <button className="module-preview-close-btn" onClick={handleClose} aria-label="Close preview">✕</button>
                </div>
                <div className="global-preview-wrap">
                    <div className="global-preview-panel">
                        {/* compact header; removed step/progress and moved tabs up */}

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
                                                        <strong className="global-preview-meta-label">Training Type</strong>
                                                        <span className="global-preview-meta-value">{trainingType}</span>
                                                    </div>
                                                    <div>
                                                        <strong className="global-preview-meta-label">Target Team/Sub Team</strong>
                                                        <span className="global-preview-meta-value">{teamName}</span>
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
                                                <div className="global-preview-stat" data-tooltip="Badges achievable in this module">
                                                    <span className="global-preview-icon">🏅</span>{badges} Badge{Number(badges) === 1 ? '' : 's'}
                                                </div>
                                                <div className="global-preview-stat" data-tooltip="Stars achievable in this module">
                                                    <span className="global-preview-icon">⭐</span>{stars} Star{Number(stars) === 1 ? '' : 's'}
                                                </div>
                                            </div>

                                            <div className="global-preview-small-row">
                                                <div className="global-preview-card">
                                                    <h3>Prerequisites</h3>
                                                    {prerequisitesArr.length ? (
                                                        <ul className="global-preview-learn-list">
                                                            {prerequisitesArr.map((p, idx) => (
                                                                <li key={idx}>• {p}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="global-preview-prereq">Nil</p>
                                                    )}
                                                </div>

                                                <div className="global-preview-card">
                                                    <h3>Tags</h3>
                                                    <div className="global-preview-tags-wrap">
                                                        {tags.length ? (
                                                            tags.map((t, idx) => (
                                                                <div key={idx} className="global-preview-tag">{t}</div>
                                                            ))
                                                        ) : (
                                                            <div className="global-preview-tag">No tags</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="global-preview-right-col-content">
                                            <div className="global-preview-image-card">
                                                {thumbnail ? (
                                                    <img src={thumbnail} alt="Module thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                                ) : (
                                                    <span>Module Thumbnail</span>
                                                )}
                                            </div>

                                            <div className="global-preview-details">
                                                <div className="global-preview-card">
                                                    <h3>Overview</h3>
                                                    <p style={{color:"#0f1724",fontWeight:"400"}}>{description}</p>
                                                </div>
                                              
                                                <div className="global-preview-card">
                                                    <h3>What you'll learn</h3>
                                                    {outcomes.length ? (
                                                        <ul className="global-preview-learn-list">
                                                            {outcomes.map((o, idx) => (
                                                                <li key={idx} style={{fontWeight:"400"}}>✅ {o}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="global-preview-prereq">No learning outcomes provided.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="global-preview-actions">
                                        <div></div>
                                        <div className="global-preview-actions-buttons">
                                            {/* <button className="global-preview-btn global-preview-btn-ghost" onClick={handleSaveDraft}>
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
                                <div className="global-preview-tab-pane global-preview-resources-pane">
                                    <div className="global-preview-resources-content">

                                        {data.instructions && (
                                            <div className="global-preview-card global-preview-instructions-card">
                                                <h3 className="global-preview-card-title">Instructions</h3>
                                                <div>
                                                    {data.instructions}
                                                </div>
                                            </div>
                                        )}

                                        <div className="global-preview-card global-preview-primary-card">
                                            <h3 className="global-preview-card-title">Primary Material</h3>
                                            {/* <p className="global-preview-resource-meta">Content</p> */}
                                            {videoSrc === null ?
                                                <div className="global-preview-richtext" dangerouslySetInnerHTML={{ __html: data.richText }} />
                                                :
                                                <VideoPlayer src={videoSrc} poster={thumbnail} theme="light" />
                                            }
                                        </div>
                                        {resource && (
                                            <div className="global-preview-card">
                                                <h3 className="global-preview-card-title" style={{marginBottom:"15px"}}>Supplementary Material</h3>
                                                <div className="global-preview-iframe-container">
                                                    {resourceKind === 'video' ? (
                                                        <VideoPlayer src={resource} poster={thumbnail} />
                                                    ) : (
                                                        <iframe src={resource} title="Supplementary Resource" />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {additionalFile && (
                                            <div className="global-preview-card">
                                                <h3 className="global-preview-card-title">Additional Material</h3>
                                                <div className="global-preview-resources-list">
                                                    <div className="global-preview-resource-item">
                                                        <p className="global-preview-resource-name">Additional File</p>
                                                        <div className="global-preview-resource-actions">
                                                            <button onClick={() => handlePreview(additionalFile)} className="global-preview-btn global-preview-btn-primary">Preview</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                    {data.submissionEnabled && <div className="global-preview-actions">
                                        <div>
                                            <h3 style={{margin:"10px"}}>Submission <span className='module-overlay__required'>*</span></h3>

                                            <input
                                                type="file"
                                                name="primaryFile"
                                                style={{ display: 'none' }}
                                                accept=".pdf,.doc,.docx,.mp4,.mp3,.scorm"
                                                id="uploadFiles"
                                                onChange={handleFileChange}
                                            />
                                            {submission ? (
                                                <div className="module-overlay__uploaded-file-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',width:"980px"}}>
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
                                        <div className="global-preview-card">
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
                                                <div className="global-preview-iframe-container" style={{ marginTop: 8 }}>
                                                    <iframe src={data.feedback} frameBorder="0" title="Feedback"></iframe>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    <div className="global-preview-actions">
                                        <div></div>
                                        <div className="global-preview-actions-buttons" style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%"}}>
                                            <button className="btn-secondary" onClick={() => handleTabChange('preview')}>
                                                <span style={{display:"flex",alignItems:"center",gap:4}}><ChevronLeft size={16} /> Previous</span>
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
                    <div className="global-preview-modal-backdrop" onClick={() => setShowModal(false)}>
                        <div className="global-preview-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="global-preview-modal-header">
                                <div className="global-preview-modal-title">{modalContent.title}</div>
                                <button className="global-preview-close-btn" onClick={() => setShowModal(false)}>
                                    ✕
                                </button>
                            </div>
                            <div className="global-preview-modal-body">
                                <p className="global-preview-modal-file-info">
                                    <strong>Previewing:</strong> {modalContent.body.name}
                                </p>
                                {modalContent.body?.kind === 'pdf' && (
                                    <div className="global-preview-iframe-container">
                                        <iframe src={modalContent.body.url} title={modalContent.title} />
                                    </div>
                                )}
                                {modalContent.body?.kind === 'image' && (
                                    <div style={{ display:'flex',justifyContent:'center' }}>
                                        <img src={modalContent.body.url} alt={modalContent.title} style={{ maxWidth:'100%', maxHeight:'70vh', borderRadius: 8 }} />
                                    </div>
                                )}
                                {modalContent.body?.kind === 'video' && (
                                    <VideoPlayer src={modalContent.body.url} />
                                )}
                                {modalContent.body && ['pdf','image','video'].indexOf(modalContent.body.kind) === -1 && (
                                    <div>
                                        <p className="global-preview-no-preview">Preview not available for this file type.</p>
                                        <p>
                                            <a href={modalContent.body.url} target="_blank" rel="noopener noreferrer" className="global-preview-open-link">Open file</a>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModulePreview;