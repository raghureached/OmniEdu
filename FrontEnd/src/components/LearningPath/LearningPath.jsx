import React, { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronLeft, ChevronUp, Star, Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText, ClipboardCheck, EyeIcon, Plus, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import '../common/Preview/Preview.css';
import AssessmentQuiz from '../Assessments/Assessment';
import SurveyPreview from '../../pages/globalAdmin/GlobalSurveys/SurveyPreview';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContentById } from '../../store/slices/contentSlice';
import { getGlobalAssessmentById } from '../../store/slices/adminAssessmentSlice';
import { getSurveyById } from '../../store/slices/adminSurveySlice';
import { adminfetchContentById } from '../../store/slices/adminModuleSlice';
import LoadingScreen from '../common/Loading/Loading';

const LearningPath = ({ courseData: propCourseData }) => {
    const { id } = useParams()
    const [expandedSections, setExpandedSections] = useState([0]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [showRating, setShowRating] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    // Submission & feedback state (ported from Preview)
    const [submission, setSubmission] = useState(null);
    const objectUrlRef = React.useRef(null);
    const [feedbackReaction, setFeedbackReaction] = useState(null); // 'like' | 'dislike' | null
    const [feedbackComment, setFeedbackComment] = useState('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [assessOpen, setAssessOpen] = useState(false);
    const [surveyOpen, setSurveyOpen] = useState(false);
    const [completedSet, setCompletedSet] = React.useState(new Set());
    const dispatch = useDispatch();
    const { selectedPath } = useSelector((state) => state.learningPaths);
    // console.log(selectedPath)
    useEffect(() => {
        // dispatch(getLearningPathById(id))
    }, [id])
    const handleSectionClick = async (section) => {
        setActiveLesson(section);
        setLoadError(null)
        // Control assessment modal visibility based on selection
        // setAssessOpen((section?.type || '').toLowerCase() === 'assessment');
        // setSurveyOpen((section?.type || '').toLowerCase() === 'survey');
        // Otherwise attempt fetch by ID/UUID depending on type
        const type = (section?.type || '').toLowerCase();
        const ref = section?.ref ?? null; // may be id string or object
        let idOrUuid = null;
        if (typeof ref === 'string') idOrUuid = ref;
        if (!idOrUuid && ref && typeof ref === 'object') {
            idOrUuid = ref.uuid || ref.id || null;
        }
        if (!idOrUuid) {
            setContentData(null);
            return;
        }
        try {
            setLoadingContent(true);
            let payload = null;
            if (type === 'module') {
                // console.log(idOrUuid)
                payload = await dispatch(adminfetchContentById(idOrUuid)).unwrap();
            } else if (type === 'assessment') {
                payload = await dispatch(getGlobalAssessmentById(idOrUuid)).unwrap();
            } else if (type === 'survey') {
                payload = await dispatch(getSurveyById(idOrUuid)).unwrap();
            }
            // console.log('Survey data loaded:', payload)
            // console.log('Survey formElements:', payload?.formElements)
            // console.log('Survey formElements structure:', payload?.formElements?.map(el => ({ type: el?.type, question_type: el?.question_type, question_text: el?.question_text, options: el?.options })))
            setContentData(payload || null);
        } catch (e) {
            setLoadError(e?.message || 'Failed to load content');
            setContentData(null);
        } finally {
            setLoadingContent(false);
        }
    };

    const markAsComplete = () => {
        if (!activeLesson || !activeLesson.id) return;
        setCompletedSet((prev) => {
            const next = new Set(prev);
            next.add(activeLesson.id);
            return next;
        });
    };

    // File upload helpers
    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        // Create object URL for local preview if needed
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setSubmission(file);
    };

    const handlePreviewFile = (fileOrUrl) => {
        // Minimal preview: open Blob URL or remote URL in new tab
        try {
            if (!fileOrUrl) return;
            if (typeof fileOrUrl === 'string') {
                window.open(fileOrUrl, '_blank');
                return;
            }
            // File object
            const url = objectUrlRef.current || URL.createObjectURL(fileOrUrl);
            if (!objectUrlRef.current) objectUrlRef.current = url;
            window.open(url, '_blank');
        } catch { }
    };

    const handleRemoveFile = () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
        setSubmission(null);
        const input = document.getElementById('uploadFiles');
        if (input) input.value = '';
    };

    React.useEffect(() => () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    // Feedback helpers
    const toggleReaction = (type) => {
        setFeedbackReaction((prev) => (prev === type ? null : type));
    };
    const handleCommentChange = (e) => {
        const val = e.target.value.slice(0, 50);
        setFeedbackComment(val);
    };
    const handleFeedbackSubmit = () => {
        alert(`Feedback submitted: ${feedbackReaction || 'no reaction'} | '${feedbackComment}'`);
        setFeedbackReaction(null);
        setFeedbackComment('');
    };

    // Build from provided data (Redux selectedPath preferred over prop)
    const sourceData = selectedPath || propCourseData || null;
    const sections = React.useMemo(() => {
        if (!sourceData || !Array.isArray(sourceData.lessons)) return [];
        const ordered = [...sourceData.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return ordered.map((l, idx) => {
            const type = (l.type || '').toLowerCase();
            const itemTitle = l.title || (typeof l.id === 'object' && l.id?.title) || `Item ${idx + 1}`;
            return {
                id: idx + 1,
                title: itemTitle,
                type: type === 'assessment' ? 'Assessment' : type === 'survey' ? 'Survey' : 'Module',
                completed: false,
                // Always force fetch for right panel; do not pass embedded objects into contentData
                data: null,
                // Keep original reference (string id/uuid or object) for fetching
                ref: l.id ?? null,
            };
        });
    }, [sourceData]);

    const courseData = React.useMemo(() => {
        const firstThumb = sections.find(s => s.type === 'Module' && s?.data?.thumbnail)?.data?.thumbnail;
        return {
            title: sourceData?.title || 'Learning Path',
            description: sourceData?.description || '',
            progress: 0,
            completedLessons: 0,
            totalLessons: sections.length,
            feedbackEnabled: !!sourceData?.enableFeedback,
            thumbnail: sourceData?.coverImage || sourceData?.thumbnail || firstThumb || '',
            sections,
        };
    }, [sourceData, sections]);

    const activeSection = activeLesson || courseData.sections[0];
    // Always fetch payload for active section; do not use embedded props data
    React.useEffect(() => {
        (async () => {
            if (!activeSection || contentData) return;
            try {
                setLoadingContent(true);
                setLoadError(null);
                const type = (activeSection?.type || '').toLowerCase();
                const ref = activeSection?.ref ?? null;
                let idOrUuid = null;
                if (typeof ref === 'string') idOrUuid = ref;
                if (!idOrUuid && ref && typeof ref === 'object') {
                    idOrUuid = ref.uuid || ref.id || null;
                }
                if (!idOrUuid) { setLoadingContent(false); return; }
                let payload = null;
                if (type === 'module') {
                    payload = await dispatch(adminfetchContentById(idOrUuid)).unwrap();
                } else if (type === 'assessment') {
                    payload = await dispatch(getGlobalAssessmentById(idOrUuid)).unwrap();
                    // setAssessOpen(true);
                } else if (type === 'survey') {
                    payload = await dispatch(getSurveyById(idOrUuid)).unwrap();
                    // setSurveyOpen(true);
                }
                console.log('Active section survey data:', payload)
                // console.log('Active section formElements:', payload?.formElements)
                // console.log('Active section formElements structure:', payload?.formElements?.map(el => ({ type: el?.type, question_type: el?.question_type, question_text: el?.question_text, options: el?.options })))
                // console.log(payload)
                setContentData(payload || null);
            } catch (e) {
                setLoadError(e?.message || 'Failed to load content');
                setContentData(null);
            } finally {
                setLoadingContent(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection]);

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Play size={14} />;
            case 'article': return <FileText size={14} />;
            case 'quiz':
            case 'assessment': return <ClipboardCheck size={14} />;
            default: return <FileText size={14} />;
        }
    };

    // Custom Video Player (adapted from Module Preview) with fixed height
    const VideoPlayer = ({ src, poster }) => {
        const videoRef = React.useRef(null);
        const containerRef = React.useRef(null);
        const [isPlaying, setIsPlaying] = React.useState(false);
        const [duration, setDuration] = React.useState(0);
        const [current, setCurrent] = React.useState(0);
        const [isMuted, setIsMuted] = React.useState(false);
        const [volume, setVolume] = React.useState(1);
        const [speed, setSpeed] = React.useState(1);
        const [fs, setFs] = React.useState(false);

        const fmt = (s) => {
            if (!Number.isFinite(s)) return '0:00';
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60).toString().padStart(2, '0');
            return `${m}:${sec}`;
        };

        const onLoaded = () => {
            const v = videoRef.current; if (!v) return;
            setDuration(v.duration || 0);
        };
        const onTime = () => {
            const v = videoRef.current; if (!v) return;
            setCurrent(v.currentTime || 0);
        };
        const togglePlay = () => {
            const v = videoRef.current; if (!v) return;
            if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
        };
        const onSeek = (e) => {
            const v = videoRef.current; if (!v) return;
            const val = Number(e.target.value);
            v.currentTime = val; setCurrent(val);
        };
        const toggleMute = () => {
            const v = videoRef.current; if (!v) return;
            const next = !isMuted; setIsMuted(next); v.muted = next;
        };
        const onVolume = (e) => {
            const v = videoRef.current; if (!v) return;
            const val = Number(e.target.value); setVolume(val); v.volume = val;
            if (val === 0) { setIsMuted(true); v.muted = true; } else if (isMuted) { setIsMuted(false); v.muted = false; }
        };
        const cycleSpeed = () => {
            const steps = [0.75, 1, 1.25, 1.5];
            const idx = steps.indexOf(speed);
            const next = steps[(idx + 1) % steps.length];
            setSpeed(next);
            const v = videoRef.current; if (v) v.playbackRate = next;
        };
        // Keep fs state in sync with browser fullscreen
        React.useEffect(() => {
            const handleFsChange = () => {
                const isFs = !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.msFullscreenElement
                );
                setFs(isFs);
            };
            document.addEventListener('fullscreenchange', handleFsChange);
            document.addEventListener('webkitfullscreenchange', handleFsChange);
            document.addEventListener('msfullscreenchange', handleFsChange);
            return () => {
                document.removeEventListener('fullscreenchange', handleFsChange);
                document.removeEventListener('webkitfullscreenchange', handleFsChange);
                document.removeEventListener('msfullscreenchange', handleFsChange);
            };
        }, []);

        const toggleFs = async () => {
            const el = containerRef.current;
            const vid = videoRef.current;
            try {
                const isFsNow = !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.msFullscreenElement
                );
                if (!isFsNow) {
                    if (el?.requestFullscreen) {
                        await el.requestFullscreen();
                    } else if (el?.webkitRequestFullscreen) {
                        el.webkitRequestFullscreen();
                    } else if (el?.msRequestFullscreen) {
                        el.msRequestFullscreen();
                    } else if (vid?.webkitEnterFullscreen) {
                        // iOS Safari fallback: use the native video fullscreen
                        vid.webkitEnterFullscreen();
                        setFs(true);
                        return;
                    }
                    setFs(true);
                } else {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                    setFs(false);
                }
            } catch {}
        };


        return (
            <div
                className="video-player"
                ref={containerRef}
                style={{
                    width: fs ? '100vw' : '100%',
                    maxWidth: fs ? '100vw' : 960,
                    margin: fs ? 0 : '0 auto',
                    height: fs ? '100vh' : 'auto',
                    backgroundColor: '#000',
                    position: 'relative',
                    display: fs ? 'block' : 'flex',
                    flexDirection: fs ? 'unset' : 'column',
                }}
            >
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    onLoadedMetadata={onLoaded}
                    onTimeUpdate={onTime}
                    preload="metadata"
                    playsInline
                    style={{
                        width: fs ? '100vw' : '100%',
                        height: fs ? '100vh' : 540,
                        display: 'block',
                        borderRadius: fs ? 0 : 8,
                        objectFit: fs ? 'cover' : 'contain',
                        backgroundColor: '#000',
                    }}
                />
                <div
                    className="video-controls"
                    style={fs ? {
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: '8px 12px',
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 80%)',
                        color: '#fff'
                    } : undefined}
                >
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
    if(loadingContent) return <LoadingScreen text="Loading content..." />

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <div style={{ width: '360px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: '24px' }}>
                <button style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', padding: '8px 0', marginBottom: '20px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#111827'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                    <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                    <span>Go to Dashboard</span>
                </button>

                {/* <button
                    onClick={() => setShowRating(!showRating)}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#f59e0b', padding: '8px 0', marginBottom: '24px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#d97706'}
                    onMouseLeave={(e) => e.target.style.color = '#f59e0b'}>
                    <Star size={16} style={{ marginRight: '8px' }} />
                    <span>Rate this course</span>
                </button> */}

                {/* {showRating && (
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={24}
                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                    fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                                    color={star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db'}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                        </div>
                        {rating > 0 && (
                            <button style={{ width: '100%', padding: '8px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                                Submit Rating
                            </button>
                        )}
                    </div>
                )} */}

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src={courseData.thumbnail} alt="course" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px', lineHeight: '1.4' }}>{courseData.title}</h1>
                </div>

                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#5570f1' }}>
                            {(() => { const total = sections.length; const done = completedSet.size; return total ? Math.round((done/total)*100) : 0; })()}%
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                            {completedSet.size}/{sections.length} Lessons
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        {(() => { const total = sections.length; const done = completedSet.size; const pct = total ? Math.round((done/total)*100) : 0; return (
                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #5570f1 0%, #4338ca 100%)', width: `${pct}%`, borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                        ); })()}
                    </div>
                </div>

                {courseData.sections.map((section, idx) => (
                    <div key={section.id} style={{ marginBottom: '12px' }}>
                        <div
                            onClick={() => handleSectionClick(section)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 12px', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s', backgroundColor: activeLesson?.id === section.id ? '#eff6ff' : 'transparent' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = activeLesson?.id === section.id ? '#eff6ff' : '#f9fafb')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = activeLesson?.id === section.id ? '#eff6ff' : 'transparent')}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{section.title}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{section.type}</span>
                                    {completedSet.has(section.id) && <CheckCircle size={14} color="#10b981" />}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#f8f9fa' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ color: '#5570f1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '13px', marginBottom: '16px' }}>
                        {courseData.title.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', lineHeight: '1.2' }}>
                            {activeSection?.title}
                        </h1>
                        <button
                            onClick={markAsComplete}
                            className='btn-primary'>
                            <CheckCircle size={16} style={{ marginRight: '8px' }} />
                            Mark as Complete
                        </button>
                    </div>

                    {activeSection?.type === 'Assessment' && assessOpen ? (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: 0, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            <AssessmentQuiz
                                key={`assessment-${activeSection?.ref}-${contentData?.uuid || contentData?._id || contentData?.id || Date.now()}`}
                                isOpen={true}
                                onClose={() => setAssessOpen(false)}
                                previewMode={false}
                                assessmentData={contentData}
                            />
                        </div>
                    ) : activeSection?.type === 'Survey' && surveyOpen ? (
                        contentData?.sections?.length > 0 || contentData?.questions?.length > 0 ? (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: 0, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                <SurveyPreview
                                    key={`survey-${activeSection?.ref}-${contentData?.uuid || contentData?._id || contentData?.id || Date.now()}`}
                                    isOpen={true}
                                    onClose={() => setSurveyOpen(false)}
                                    formData={{
                                        title: contentData?.title || 'Untitled Survey',
                                        description: contentData?.description || ''
                                    }}
                                    formElements={contentData?.sections ? (() => {
                                        // Transform nested sections/questions structure to flat formElements array
                                        const elements = [];
                                        console.log('Transforming survey sections:', contentData.sections);
                                        if (Array.isArray(contentData.sections) && contentData.sections.length > 0) {
                                            contentData.sections.forEach((section) => {
                                                // Add section first
                                                elements.push({
                                                    type: 'section',
                                                    title: section.title || '',
                                                    description: section.description || ''
                                                });
                                                // Then add its questions
                                                if (Array.isArray(section.questions)) {
                                                    section.questions.forEach(q => {
                                                        elements.push({
                                                            type: 'question',
                                                            question_type: q.type || 'Multiple Choice',
                                                            question_text: q.question_text || '',
                                                            options: Array.isArray(q.options) ? q.options : [],
                                                            uuid: q.uuid,
                                                            _id: q._id
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                        console.log('Transformed formElements:', elements);
                                        return elements;
                                    })() : contentData?.questions ? (() => {
                                        // Fallback for legacy format with direct questions array
                                        console.log('Using legacy questions format:', contentData.questions);
                                        return [
                                            { type: 'section', description: contentData.description || '' },
                                            ...contentData.questions.map(q => ({
                                                type: 'question',
                                                question_type: q.type || 'Multiple Choice',
                                                question_text: q.question_text || '',
                                                options: Array.isArray(q.options) ? q.options : [],
                                                uuid: q.uuid,
                                                _id: q._id
                                            }))
                                        ];
                                    })() : []}
                                    groups={contentData?.groups || []}
                                    feedback={contentData?.feedback || {}}
                                />
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                                <div style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.8' }}>
                                    <p style={{ marginBottom: '16px' }}>
                                        This survey doesn't have any questions yet. Please contact your administrator to add questions to this survey.
                                    </p>
                                </div>
                            </div>
                        )
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                            {/* for a survey */}
                            {contentData?.description && activeSection?.type === 'Survey' && (
                                <div style={{ margin: 16 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                                        Description
                                    </h3>
                                    <div style={{ color: '#374151' }} dangerouslySetInnerHTML={{ __html: contentData?.description }} />
                                </div>
                            )}
                            {/* Meta row (only for non-survey content) */}
                            {contentData && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                                    {contentData.category && <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Category: {contentData.category}</span>}
                                    {contentData.trainingType && <span style={{ background: '#f3f4f6', color: '#111827', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Type: {contentData.trainingType}</span>}
                                    {Number.isFinite(contentData.duration) && <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Duration: {contentData.duration} mins</span>}
                                    {Number(contentData.credits) > 0 && <span style={{ background: '#ecfeff', color: '#155e75', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Credits: {contentData.credits}</span>}
                                </div>
                            )}
                            {/* Instructions (show for all content types that have instructions) */}
                            {contentData?.instructions && (
                                <div style={{ margin: 16 }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                                        Instructions
                                    </h3>
                                    <div style={{ color: '#374151' }} dangerouslySetInnerHTML={{ __html: contentData.instructions }} />
                                </div>
                            )}

                            {contentData?.primaryFile ? (
                                <div style={{ marginBottom: '24px' }}>
                                    <VideoPlayer src={contentData.primaryFile} poster={contentData.thumbnail || undefined} />
                                </div>
                            ) : contentData?.richText ? (
                                <div
                                    style={{ color: '#374151', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}
                                    dangerouslySetInnerHTML={{ __html: contentData.richText }}
                                    className='global-preview-richtext'
                                />
                            ) : null}
                            {contentData?.externalResource ? (
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '10px' }}>
                                        <iframe
                                            src={contentData.externalResource}
                                            title={contentData.title || 'External Resource'}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            ) : null}
                            {contentData?.submissionEnabled && <div className="global-preview-actions">
                                <div>
                                    <h3 style={{ margin: "10px" }}>Submission <span className='module-overlay__required'>*</span></h3>

                                    <input
                                        type="file"
                                        name="primaryFile"
                                        style={{ display: 'none' }}
                                        accept=".pdf,.doc,.docx,.mp4,.mp3,.scorm"
                                        id="uploadFiles"
                                        onChange={handleFileChange}
                                    />
                                    {submission ? (
                                        <div className="module-overlay__uploaded-file-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: "900px" }}>
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

                            {!contentData && (
                                <div style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.8' }}>
                                    <p style={{ marginBottom: '16px' }}>
                                        Select a module from the left to view its content. Assessments and other types can be wired similarly.
                                    </p>
                                </div>
                            )}
                           
                        </div>


                    )}

                </div>
                 {/* Add the Start buttons here - inside the else condition */}
                 {activeSection?.type === 'Assessment' && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px', marginTop: '32px' }}>
                                    <button
                                        onClick={() => setAssessOpen(true)}
                                        className='btn-primary'>
                                        {/*     <CheckCircle size={16} style={{ marginRight: '8px' }} /> */}
                                        Start Assessment
                                    </button>
                                </div>
                            )}
                            {activeSection?.type === 'Survey' && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px', marginTop: '32px' }}>
                                    <button
                                        onClick={() => setSurveyOpen(true)}
                                        className='btn-primary'>
                                        {/* <CheckCircle size={16} style={{ marginRight: '8px' }} /> */}
                                        Start Survey
                                    </button>
                                </div>
                            )}
            </div>

        </div>
    );
};

export default LearningPath;