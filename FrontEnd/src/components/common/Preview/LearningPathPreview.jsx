import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Preview.css';
import { GoBook } from 'react-icons/go';
import { useDispatch } from 'react-redux';
import { setSelectedPath } from '../../../store/slices/learningPathSlice';
import LearningPath from '../../LearningPath/LearningPath';
import { ChevronRight } from 'lucide-react';

const LearningPathPreview = ({ isOpen, onClose, data }) => {
    console.log(data)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('preview');
    const [showModal, setShowModal] = useState(false);
    const [showPath, setShowPath] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const objectUrlRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
 const title = data?.title || 'Untitled Module';
    const category = data?.category || 'Uncategorized';
    const trainingType = data?.trainingType || '—';
    const teamName = data?.team.name || '—';
    const subteamName = data?.subteam.name || '—';
    const durationMins = data.duration
    const credits = data?.credits ?? 0;
    const badges = data?.badges ?? 0;
    const stars = data?.stars ?? 0;
    const tags = Array.isArray(data?.tags) ? data.tags : data.tagsText.split(',') || [];
    const prerequisitesArr = Array.isArray(data?.prerequisites) ? data.prerequisites : [];
    const description = data?.description || 'No overview provided.';
    const outcomes = Array.isArray(data?.learningOutcomes) ? data.learningOutcomes : [];
    const thumbnail = data?.thumbnail || '';
    console.log(thumbnail)
    const lessons = Array.isArray(data?.lessons) ? data.lessons : [];
    // Revoke any object URL on unmount
    useEffect(() => () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    // Generate a temporary URL when thumbnail is a File/Blob
    useEffect(() => {
        // clear previous object URL if any
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        if (!thumbnail) {
            setPreviewUrl(null);
            return;
        }
        if (thumbnail instanceof File || thumbnail instanceof Blob) {
            const url = URL.createObjectURL(thumbnail);
            objectUrlRef.current = url;
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }, [thumbnail]);

   
    // const {selectedPath} = useSelector((state) => state.learningPath);

    const open = typeof isOpen === 'boolean' ? isOpen : true;
    const handleClose = () => {
        if (onClose) return onClose();
        navigate(-1);
    };

    const handleTabChange = (tab) => {
        if (tab === 'resources') {
            setShowPath(true);
        } else {
            setShowPath(false);
        }
        setActiveTab(tab);
    };
    const handlePreview = () => {
        setActiveTab('resources');
        dispatch(setSelectedPath(data));
        setShowPath(true);
    }
    // Normalize URL from various shapes
    const getURl = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;          // absolute/relative/data URL
        if (typeof value === 'object') {
            if (typeof value.url === 'string') return value.url;
            if (typeof value.path === 'string') return value.path;
        }
        return '';
    };

    if (!open) return null;

    return (
        <div className="module-preview-overlay" onClick={handleClose}>
            <div className="module-preview-container" style={{ maxWidth: activeTab === 'resources' ? '100%' : '1100px' }} onClick={(e) => e.stopPropagation()}>
                <div className="module-preview-header">
                    <div className="module-preview-header-left">
                        <div className="module-preview-header-icon"><GoBook size={24} color="#5570f1" /></div>
                        <div>
                            <div className="module-preview-title">Learning Path Preview</div>
                            {/* <div className="module-preview-subtitle">Review details and resources before publishing</div> */}
                        </div>
                    </div>
                    <div className="module-preview-tabs" role="tablist" aria-label="Module sections">
                        <button
                            type="button"
                            className={` ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleTabChange('preview')}
                            role="tab"
                            aria-selected={activeTab === 'preview'}
                            style={{ width: "120px" }}
                        >
                            Preview
                        </button>
                        <button
                            type="button"
                            className={` ${activeTab === 'resources' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleTabChange('resources')}
                            role="tab"
                            aria-selected={activeTab === 'resources'}
                            style={{ width: "120px" }}
                        >
                            Resources
                        </button>
                    </div>
                    <button type="button" className="module-preview-close-btn" onClick={handleClose} aria-label="Close preview">✕</button>
                </div>
                <div className="global-preview-wrap" style={{ maxWidth: activeTab === 'resources' ? '100%' : '100%' }}>
                    <div className="global-preview-panel">
                        <div className="global-preview-content">
                            {!showPath && activeTab === 'preview' && (
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
                                                        <span className="global-preview-meta-value">{teamName}/{subteamName}</span>
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
                                                    previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt="Module thumbnail"
                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '10px' }}
                                                        />
                                                    ) : (
                                                        <img
                                                            src={getURl(thumbnail)}
                                                            alt="Module thumbnail"
                                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '10px' }}
                                                        />
                                                    )
                                                ) : (
                                                    <span>Module Thumbnail</span>
                                                )}
                                            </div>

                                            <div className="global-preview-details">
                                                <div className="global-preview-card">
                                                    <h3>Overview</h3>
                                                    <p style={{ color: "#0f1724", fontWeight: "400" }}>{description}</p>
                                                </div>

                                                <div className="global-preview-card">
                                                    <h3>What you'll learn</h3>
                                                    {outcomes.length ? (
                                                        <ul className="global-preview-learn-list">
                                                            {outcomes.map((o, idx) => (
                                                                <li key={idx} style={{ fontWeight: "400" }}>✅ {o}</li>
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
                                            <button type="button" className="btn-primary" onClick={() => handlePreview()}>
                                                Next (Learning Path) <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {showPath && (
                                <div className="global-preview-tab-pane" style={{ padding: 0 }}>
                                    <LearningPath courseData={data} embedded />
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
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <img src={modalContent.body.url} alt={modalContent.title} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
                                    </div>
                                )}
                                {modalContent.body && ['pdf', 'image'].indexOf(modalContent.body.kind) === -1 && (
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

export default LearningPathPreview;