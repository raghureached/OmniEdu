import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoBook } from 'react-icons/go';

const ModulePopUp = ({ isOpen, onClose, data,enroll }) => {
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [showOutcomes, setShowOutcomes] = useState(false);
    const title = data?.title || 'Untitled Module';
    const category = data?.category || 'Uncategorized';
    const trainingType = data?.trainingType || '—';

    const team = data?.team.name || '—';
    const subteam = data?.subteam.name || '—';
    const durationMins = data?.duration || null;
    const credits = data?.credits ?? 0;
    const badges = data?.badges ?? 0;
    const stars = data?.stars ?? 0;
    const tags = Array.isArray(data?.tags) ? data.tags : [];
    const prerequisitesArr = Array.isArray(data?.prerequisites) ? data.prerequisites : [];
    const description = data?.description || 'No overview provided.';
    const outcomes = Array.isArray(data?.learningOutcomes) ? data.learningOutcomes : [];
    const open = typeof isOpen === 'boolean' ? isOpen : true;
    const handleClose = () => {
        if (onClose) return onClose();
        navigate(-1);
    }
    if (!open) return null;


    return (
        <div className='module-preview-overlay' onClick={handleClose}>
            <div className="module-preview-container" onClick={(e) => e.stopPropagation()}>
                <div className="module-preview-header">
                    <div className="module-preview-header-left">
                        <div className="module-preview-header-icon"><GoBook size={24} color="#5570f1" /></div>
                        <div>
                            <div className="module-preview-title">Module Preview</div>
                            {/* <div className="module-preview-subtitle">Review details and resources before publishing</div> */}
                        </div>
                    </div>
                    
                    <button className="module-preview-close-btn" onClick={handleClose} aria-label="Close preview">✕</button>
                </div>
                <div className="global-preview-wrap">
                    <div className="global-preview-panel">

                        <div className="global-preview-content">

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
                                                        <span className="global-preview-meta-value">{team || '-'}</span>
                                                    </div>
                                                    <div>
                                                        <strong className="global-preview-meta-label">Target Sub Team</strong>
                                                        <span className="global-preview-meta-value">{subteam || '-'}</span>
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
                                                    <h3>Overview</h3>
                                                    <p style={{color:"#0f1724",fontWeight:"400"}}>{showDescription ? description : description.slice(0, 250)}{!showDescription && <span style={{color:"#0f1724",fontWeight:"400",cursor:"pointer"}} onClick={()=>setShowDescription(true)}>...</span>}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="global-preview-right-col-content">
                                            <div className="global-preview-image-card">
                                                {data?.thumbnail ? (
                                                    <img src={data?.thumbnail} alt="Module thumbnail" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                                                ) : (
                                                    <span>Module Thumbnail</span>
                                                )}
                                            </div>

                                            <div className="global-preview-details">
                                                
                                                <div className="global-preview-card" style={{height:"fit-content"}}>
                                                    <h3>Tags</h3>
                                                    <div className="global-preview-tags-wrap">
                                                        {tags.length ? (
                                                            tags.slice(0, 3).map((t, idx) => (
                                                                <div key={idx} className="global-preview-tag">{t}</div>
                                                            ))
                                                        ) : (
                                                            <div className="global-preview-tag">No tags</div>
                                                        )}
                                                        {!showAll && tags.length > 3 && (
                                                            <span className="global-preview-tag" style={{cursor:'pointer'}} onClick={() => setShowAll(true)}>+{tags.length - 3} more</span>
                                                        )}
                                                        {showAll && tags.slice(3).map((t, idx) => (
                                                            <div key={idx} className="global-preview-tag">{t}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="global-preview-card" style={{height:"fit-content"}}>
                                                    <h3>What you'll learn</h3>
                                                    {outcomes.length ? (
                                                        <ul className="global-preview-learn-list">
                                                            {outcomes.slice(0, 2).map((o, idx) => (
                                                                <li key={idx} style={{fontWeight:"400"}}>✅ {o}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="global-preview-prereq">No learning outcomes provided.</p>
                                                    )}
                                                    {!showOutcomes && outcomes.length > 2 && (
                                                        <span className="global-preview-tag" style={{cursor:'pointer'}} onClick={() => setShowOutcomes(true)}>+{outcomes.length - 2} more</span>
                                                    )}
                                                    {showOutcomes &&
                                                       <ul className="global-preview-learn-list">
                                                            {outcomes.slice(2).map((o, idx) => (
                                                                <li key={idx} style={{fontWeight:"400"}}>✅ {o}</li>
                                                            ))}
                                                        </ul>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="global-preview-actions">
                                        <div></div>
                                        <div className="global-preview-actions-buttons">
                                           
                                            <button className="btn-primary" onClick={() => (enroll())}>
                                                Enroll
                                            </button>
                                        </div>
                                    </div>
                                </div>
                          
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulePopUp;