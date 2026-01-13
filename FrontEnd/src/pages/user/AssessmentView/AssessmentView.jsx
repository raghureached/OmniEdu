import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import './AssessmentPreview.css';
import { GoBook } from 'react-icons/go';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronLast, ChevronLeft, ChevronRight, FileText, Check } from 'lucide-react';
import AssessmentQuiz from '../../../components/Assessments/Assessment';
import api from '../../../services/api';
import LoadingScreen from '../../../components/common/Loading/Loading';
const AssessmentView = ({ id }) => {
    const { assessmentId, inProgress ,assignId} = useParams();
    const [data, setData] = useState(null)
    const [showQuiz, setShowQuiz] = useState(false);
    const [activeTab, setActiveTab] = useState('preview');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', body: '' });
    const [submission, setSubmission] = useState(null);
    const objectUrlRef = useRef(null);
    const [feedbackReaction, setFeedbackReaction] = useState(null);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isAssessmentActive, setIsAssessmentActive] = useState(false);
    const [loading, setLoading] = useState(false);
        const [showTags, setShowTags] = useState(false);
    const [showDesc, setShowDesc] = useState(false);
    // console.log(assignId)
    useEffect(() => {
        if(inProgress === "true" || inProgress){
            setActiveTab('resources');
        }
    }, [inProgress]);
    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                setLoading(true);
                const uuid = id || assessmentId;
                let response;
                if(!assignId || assignId === "undefined"){
                    response = await api.get(`/api/user/enrolled/getAssessment/${uuid}`);
                    console.log("response data", response.data);
                }else{
                    response = await api.get(`/api/user/getAssessment/${uuid}`);
                }
                // console.log("response data", response.data);
                setData(response.data);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching assessment:', error);
                setLoading(false);
            }
        };
        fetchAssessment();
    }, [assessmentId]);

    useEffect(() => () => {
        // cleanup any created object URLs
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    // Derived display values with safe fallbacks
    const title = data?.title || 'Untitled Assessment';
    const category = data?.category || 'Uncategorized';
    const teamName = data?.team?.name || '—';
    const subteamName = data?.subteam?.name || '—';
    const durationMins = Number.isFinite(data?.duration) ? data.duration : null;
    const credits = data?.credits ?? 0;
    const badges = data?.badges ?? 0;
    const stars = data?.stars ?? 0;
    const tags = Array.isArray(data?.tags) ? data.tags : [];
    const description = data?.description || 'No overview provided.';
    const thumbnail = data?.thumbnail || '';
    const instructions = data?.instructions || null



    const handleQuizClose = () => {
        setShowQuiz(false);
        setIsAssessmentActive(false);
        setActiveTab('preview');

    };

    const handleStartAssessment = () => {
        setShowQuiz(true);
        setIsAssessmentActive(true); // Set assessment to active mode (not preview)
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
    if(loading)
        return <LoadingScreen text="Loading assessment..." />;

    return (

        <div>
            {/* Fixed Header */}


            {/* Scrollable Content */}
            <div className={`${id ? 'user-mod-wrap-lp' : 'user-mod-wrap '}`}>
                <div className="user-mod-panel">
                    <div className="assigned-header">

                        {assessmentId && <div className="tabs">
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
                                                <div>
                                                    <strong className="user-mod-meta-label">Target Team</strong>
                                                    <span className="user-mod-meta-value">{teamName}</span>
                                                </div>
                                                <div>
                                                    <strong className="user-mod-meta-label">Target Sub Team</strong>
                                                    <span className="user-mod-meta-value">{subteamName}</span>
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
                                            <div className="user-mod-stat" data-tooltip="Badges achievable in this Assessment">
                                                <span className="user-mod-icon">🏅</span>{badges} Badge{Number(badges) === 1 ? '' : 's'}
                                            </div>
                                            <div className="user-mod-stat" data-tooltip="Stars achievable in this Assessment">
                                                <span className="user-mod-icon">⭐</span>{stars} Star{Number(stars) === 1 ? '' : 's'}
                                            </div>

                                        </div>
                                        <div className="user-mod-stats-row">
                                            <div className="user-mod-stat" data-tooltip="Total number of questions">
                                                <span className="user-mod-icon">❓</span>{data?.questions?.length || 0} Question{data?.questions?.length === 1 ? '' : 's'}
                                            </div>
                                            <div className="user-mod-stat" data-tooltip="Number of attempts allowed">
                                                <span className="user-mod-icon">🔄</span> {data?.attempts <= 9 ? data?.attempts : 'Unlimited'} Attempts
                                            </div>
                                            <div className="user-mod-stat" data-tooltip="Passing percentage required">
                                                <span className="user-mod-icon">🎯</span> {data?.passPercentage || 0}% to Pass
                                            </div>
                                        </div>

                                        <div className="user-mod-small-row">
                                            <div className="user-mod-card">
                                                <h3>Overview</h3>
                                                <p style={{ color: "#0f1724", fontWeight: 400 }}>
                                                    {!showDesc ? (
                                                        <>
                                                            {description.length > 250 ? (
                                                                <>
                                                                    {description.slice(0, 250)}
                                                                    <span
                                                                        onClick={() => setShowDesc(true)}
                                                                        style={{ color: '#5570f1', cursor: 'pointer', marginLeft: 4 }}
                                                                        title="Show more"
                                                                    >
                                                                        ...
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                description
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {description}
                                                            <span
                                                                onClick={() => setShowDesc(false)}
                                                                style={{ color: '#5570f1', cursor: 'pointer', marginLeft: 8 }}
                                                                title="Show less"
                                                            >
                                                                Show less
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>


                                            {/* <div className="user-mod-card">
                                                    <h3>Number of Questions : {data.questions.length}</h3>
                                                    <h3>Attempts : {data.attempts}</h3>
                                                    <h3>Pass Percentage : {data.passPercentage}%</h3>
                                                </div> */}
                                        </div>
                                    </div>

                                    <div className="user-mod-right-col-content">
                                        <div className="user-mod-image-card">
                                            {thumbnail ? (
                                                <img src={thumbnail} alt="Assessment thumbnail" style={{ width: '100%', height: '100%', borderRadius: '10px' }} />
                                            ) : (
                                                <span>Assessment Thumbnail</span>
                                            )}
                                        </div>

                                        <div className="user-mod-details" style={{ width: "100%" }}>
                                            <div className="user-mod-card">
                                                <h3>Tags</h3>
                                                <div className="user-mod-tags-wrap">
                                                    {tags.length ? (
                                                        (showTags ? tags : tags.slice(0, 3)).map((t, idx) => (
                                                            <div key={idx} className="user-mod-tag">{t}</div>
                                                        ))
                                                    ) : (
                                                        <div className="user-mod-tag">No tags</div>
                                                    )}
                                                    {tags.length > 3 && (
                                                        <span
                                                            className="user-mod-tag"
                                                            onClick={() => setShowTags(!showTags)}
                                                            style={{ cursor: 'pointer' }}
                                                            title={showTags ? 'Show less' : 'Show more'}
                                                        >
                                                            {showTags ? 'Show less' : `+${tags.length - 3} more`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>




                                            {instructions ? (
                                                <div className="user-mod-card">
                                                    <h3>Instructions</h3>
                                                    <div
                                                        className="user-mod-richtext"
                                                        style={{
                                                            maxWidth: '100%',
                                                            overflow: 'hidden',
                                                            wordWrap: 'break-word',
                                                            overflowWrap: 'break-word', padding: '0px', border: 'none',
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: instructions }}
                                                    /> </div>
                                            ) : (
                                                <p className="user-mod-prereq">No Instructions provided.</p>
                                            )}
                                        </div>

                                    </div>
                                </div>
                                <div className="user-mod-actions" >
                                    <div></div>
                                    <div className="user-mod-actions-buttons">

                                        {activeTab === 'preview' && <button className="btn-primary" onClick={() => { setActiveTab('resources'); handleStartAssessment(); }}>
                                            Start Assessment <ChevronRight size={16} />
                                        </button>}
                                    </div>
                                </div>
                            </div>

                        )}

                        {!showQuiz && activeTab === 'resources' && (

                            <div className="user-mod-tab-pane user-mod-resources-pane">
                                <AssessmentQuiz onClose={handleQuizClose} previewMode={false} assessmentData={data} />
                                <div className="user-mod-resources-content">
                                    {data?.feedbackEnabled ? (
                                        <div className="user-mod-card" style={{ height: '22%' }} >
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
                                            {data?.feedback && (
                                                <div className="user-mod-iframe-container" style={{ marginTop: 8 }}>
                                                    <iframe src={data.feedback} frameBorder="0" title="Feedback"></iframe>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                        {showQuiz && (<AssessmentQuiz onClose={handleQuizClose} previewMode={!isAssessmentActive} assessmentData={data} />)}

                    </div>
                </div>
            </div>

        </div>
    );
};

export default AssessmentView;