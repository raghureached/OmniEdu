
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SurveyPreview from '../../../components/Surveys/SurveyPreview';

import { EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLast, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import api from '../../../services/api';

const SurveyView = ({ id }) => {
    const [data, setData] = useState(null);
    const { surveyId } = useParams();
    const [activeTab, setActiveTab] = useState('preview');
    const [feedbackReaction, setFeedbackReaction] = useState(null); // 'like' | 'dislike' | null
    const [feedbackComment, setFeedbackComment] = useState('');
    // Initialize from incoming data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const uuid = id || surveyId
                const response = await api.get(`/api/user/getSurvey/${uuid}`);
                console.log(response.data)
                setData(response.data);
            } catch (error) {
                console.error('Error fetching survey data:', error);
            }
        };
        fetchData();
    }, [id]);


    // Derived display values with safe fallbacks
    const title = data?.title || 'Untitled Survey';
    const category = data?.category || 'Uncategorized';
    const teamName = data?.team?.name || '—';
    const subteamName = data?.subteam?.name || '—';

    const tags = Array.isArray(data?.tags) ? data.tags : [];
    const description = data?.description || 'No overview provided.';
    const thumbnail = data?.thumbnail_url || '';
    const resource = data?.externalResource || null;


    // Debug logging
    console.log('SurveyMainPreview data:', data);
    console.log('SurveyMainPreview tags:', tags, 'length:', tags.length);

    // Determine modal open state: default open if not controlled via props


    const handleTabChange = (tab) => {
        setActiveTab(tab);
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

    return (

        <div>

            <div className={`${id ? 'user-mod-wrap-lp' : 'user-mod-wrap'}`}>
                <div className="user-mod-panel">
                    <div className="assigned-header">
                        {surveyId && <div className="tabs">
                            <button
                                className={`tab-button `}
                                onClick={() => window.history.back()}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', textDecoration: "underline" }}><ChevronLeft size={20} /></span>
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

                                            <div className="user-mod-meta-row">
                                                <div>
                                                    <strong className="user-mod-meta-label">Target Team </strong>
                                                    <span className="user-mod-meta-value">{teamName}</span>
                                                </div>
                                                <div>
                                                    <strong className="user-mod-meta-label">Target Sub Team</strong>
                                                    <span className="user-mod-meta-value">{subteamName}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="user-mod-stats-row">
                                            {/* <div className="user-mod-stat" data-tooltip="Total run-time of all videos and activities">
                                                    <span className="user-mod-icon">⏱</span>{durationMins ? `${durationMins} mins` : '—'}
                                                </div> */}
                                            {/* <div className="user-mod-stat" data-tooltip="Credits awarded after completion">
                                                    <span className="user-mod-icon">🎓</span>{credits} Credit{Number(credits) === 1 ? '' : 's'}
                                                </div>
                                                <div className="user-mod-stat" data-tooltip="Badges achievable in this module">
                                                    <span className="user-mod-icon">🏅</span>{badges} Badge{Number(badges) === 1 ? '' : 's'}
                                                </div>
                                                <div className="user-mod-stat" data-tooltip="Stars achievable in this module">
                                                    <span className="user-mod-icon">⭐</span>{stars} Star{Number(stars) === 1 ? '' : 's'}
                                                </div> */}
                                        </div>

                                        <div className="user-mod-small-row">
                                            {/* <div className="user-mod-card">
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
                                                </div> */}

                                            <div className="user-mod-card">
                                                <h3>Tags</h3>
                                                <div className="user-mod-tags-wrap">
                                                    {tags.length > 0 ? (
                                                        tags.map((t, idx) => (
                                                            <div key={idx} className="user-mod-tag">{t}</div>
                                                        ))
                                                    ) : (
                                                        <div className="user-mod-tag" style={{ color: '#64748b', fontStyle: 'italic' }}>No tags</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="user-mod-right-col-content">
                                        <div className="user-mod-image-card">
                                            {thumbnail ? (
                                                <img src={thumbnail} alt="Survey thumbnail" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
                                            ) : (
                                                <span>Survey Thumbnail</span>
                                            )}
                                        </div>

                                        <div className="user-mod-details">
                                            <div className="user-mod-card">
                                                <h3>Overview</h3>
                                                <p style={{ color: "#0f1724", fontWeight: "400" }}>{description}</p>
                                            </div>

                                            {/* <div className="user-mod-card">
                                                  <h2>Questions{data.sections}</h2>
                                                   
                                                </div> */}
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
                                            Start Survey <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="user-mod-tab-pane">
                                <SurveyPreview
                                    isOpen={true}
                                    onClose={() => setActiveTab('preview')}
                                    formData={{
                                        title: data.title || 'Untitled Survey',
                                        description: data.description || ''
                                    }}
                                    formElements={data.formElements || []}
                                    groups={data.groups || []}
                                    feedback={data.feedback || {}}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyView;
