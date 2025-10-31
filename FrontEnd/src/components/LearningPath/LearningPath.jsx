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
import ModulePreview from '../common/Preview/Preview';

const LearningPath = ({ courseData: propCourseData, embedded = false }) => {
    console.log(propCourseData)
    const [expandedSections, setExpandedSections] = useState([0]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [contentData, setContentData] = useState(null);
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

    const handleSectionClick = async (section) => {
        setActiveLesson(section);
        setLoadError(null)
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
                payload = await dispatch(adminfetchContentById(section.uuid)).unwrap();
            } else if (type === 'assessment') {
                payload = await dispatch(getGlobalAssessmentById(idOrUuid)).unwrap();
            } else if (type === 'survey') {
                payload = await dispatch(getSurveyById(idOrUuid)).unwrap();
            }
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

    const sourceData =  propCourseData || null;
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
                uuid: l.uuid,
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
            uuid: sourceData?.uuid,
            feedbackEnabled: !!sourceData?.enableFeedback,
            thumbnail: sourceData?.coverImage || sourceData?.thumbnail || firstThumb || '',
            sections,
        };
    }, [sourceData, sections]);

    const activeSection = courseData.sections[0];
    React.useEffect(() => {
        (async () => {
            if (!activeSection || contentData) return;
            setActiveLesson(activeSection);
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
                    payload = await dispatch(adminfetchContentById(activeSection.uuid)).unwrap();
                } else if (type === 'assessment') {
                    payload = await dispatch(getGlobalAssessmentById(activeSection.uuid)).unwrap();
                } else if (type === 'survey') {
                    payload = await dispatch(getSurveyById(activeSection.uuid)).unwrap();
                }
                setContentData(payload || null);
            } catch (e) {
                setLoadError(e?.message || 'Failed to load content');
                setContentData(null);
            } finally {
                setLoadingContent(false);
            }
        })();
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
    const mockThumbnail = "https://miro.medium.com/v2/resize:fit:1400/format:webp/0*8yleeYR1g-nLSHJj";

    // const VideoPlayer = ({ src, poster }) => {
    //     const videoRef = React.useRef(null);
    //     const containerRef = React.useRef(null);
    //     const [isPlaying, setIsPlaying] = React.useState(false);
    //     const [duration, setDuration] = React.useState(0);
    //     const [current, setCurrent] = React.useState(0);
    //     const [isMuted, setIsMuted] = React.useState(false);
    //     const [volume, setVolume] = React.useState(1);
    //     const [speed, setSpeed] = React.useState(1);
    //     const [fs, setFs] = React.useState(false);

    //     const fmt = (s) => {
    //         if (!Number.isFinite(s)) return '0:00';
    //         const m = Math.floor(s / 60);
    //         const sec = Math.floor(s % 60).toString().padStart(2, '0');
    //         return `${m}:${sec}`;
    //     };

    //     const onLoaded = () => {
    //         const v = videoRef.current; if (!v) return;
    //         setDuration(v.duration || 0);
    //     };
    //     const onTime = () => {
    //         const v = videoRef.current; if (!v) return;
    //         setCurrent(v.currentTime || 0);
    //     };
    //     const togglePlay = () => {
    //         const v = videoRef.current; if (!v) return;
    //         if (v.paused) { v.play(); setIsPlaying(true); } else { v.pause(); setIsPlaying(false); }
    //     };
    //     const onSeek = (e) => {
    //         const v = videoRef.current; if (!v) return;
    //         const val = Number(e.target.value);
    //         v.currentTime = val; setCurrent(val);
    //     };
    //     const toggleMute = () => {
    //         const v = videoRef.current; if (!v) return;
    //         const next = !isMuted; setIsMuted(next); v.muted = next;
    //     };
    //     const onVolume = (e) => {
    //         const v = videoRef.current; if (!v) return;
    //         const val = Number(e.target.value); setVolume(val); v.volume = val;
    //         if (val === 0) { setIsMuted(true); v.muted = true; } else if (isMuted) { setIsMuted(false); v.muted = false; }
    //     };
    //     const cycleSpeed = () => {
    //         const steps = [0.75, 1, 1.25, 1.5];
    //         const idx = steps.indexOf(speed);
    //         const next = steps[(idx + 1) % steps.length];
    //         setSpeed(next);
    //         const v = videoRef.current; if (v) v.playbackRate = next;
    //     };
    //     // Keep fs state in sync with browser fullscreen
    //     React.useEffect(() => {
    //         const handleFsChange = () => {
    //             const isFs = !!(
    //                 document.fullscreenElement ||
    //                 document.webkitFullscreenElement ||
    //                 document.msFullscreenElement
    //             );
    //             setFs(isFs);
    //         };
    //         document.addEventListener('fullscreenchange', handleFsChange);
    //         document.addEventListener('webkitfullscreenchange', handleFsChange);
    //         document.addEventListener('msfullscreenchange', handleFsChange);
    //         return () => {
    //             document.removeEventListener('fullscreenchange', handleFsChange);
    //             document.removeEventListener('webkitfullscreenchange', handleFsChange);
    //             document.removeEventListener('msfullscreenchange', handleFsChange);
    //         };
    //     }, []);

    //     const toggleFs = async () => {
    //         const el = containerRef.current;
    //         const vid = videoRef.current;
    //         try {
    //             const isFsNow = !!(
    //                 document.fullscreenElement ||
    //                 document.webkitFullscreenElement ||
    //                 document.msFullscreenElement
    //             );
    //             if (!isFsNow) {
    //                 if (el?.requestFullscreen) {
    //                     await el.requestFullscreen();
    //                 } else if (el?.webkitRequestFullscreen) {
    //                     el.webkitRequestFullscreen();
    //                 } else if (el?.msRequestFullscreen) {
    //                     el.msRequestFullscreen();
    //                 } else if (vid?.webkitEnterFullscreen) {
    //                     // iOS Safari fallback: use the native video fullscreen
    //                     vid.webkitEnterFullscreen();
    //                     setFs(true);
    //                     return;
    //                 }
    //                 setFs(true);
    //             } else {
    //                 if (document.exitFullscreen) {
    //                     await document.exitFullscreen();
    //                 } else if (document.webkitExitFullscreen) {
    //                     document.webkitExitFullscreen();
    //                 } else if (document.msExitFullscreen) {
    //                     document.msExitFullscreen();
    //                 }
    //                 setFs(false);
    //             }
    //         } catch {}
    //     };


    //     return (
    //         <div
    //             className="video-player"
    //             ref={containerRef}
    //             style={{
    //                 width: fs ? '100vw' : '100%',
    //                 maxWidth: fs ? '100vw' : 960,
    //                 margin: fs ? 0 : '0 auto',
    //                 height: fs ? '100vh' : 'auto',
    //                 backgroundColor: '#000',
    //                 position: 'relative',
    //                 display: fs ? 'block' : 'flex',
    //                 flexDirection: fs ? 'unset' : 'column',
    //             }}
    //         >
    //             <video
    //                 ref={videoRef}
    //                 src={src}
    //                 poster={poster}
    //                 onLoadedMetadata={onLoaded}
    //                 onTimeUpdate={onTime}
    //                 preload="metadata"
    //                 playsInline
    //                 style={{
    //                     width: fs ? '100vw' : '100%',
    //                     height: fs ? '100vh' : 540,
    //                     display: 'block',
    //                     borderRadius: fs ? 0 : 8,
    //                     objectFit: fs ? 'cover' : 'contain',
    //                     backgroundColor: '#000',
    //                 }}
    //             />
    //             <div
    //                 className="video-controls"
    //                 style={fs ? {
    //                     position: 'absolute',
    //                     left: 0,
    //                     right: 0,
    //                     bottom: 0,
    //                     padding: '8px 12px',
    //                     background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 80%)',
    //                     color: '#fff'
    //                 } : undefined}
    //             >
    //                 <div className="vc-left">
    //                     <button className="vc-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
    //                         {isPlaying ? <Pause size={16} /> : <Play size={16} />}
    //                     </button>
    //                     <div className="vc-time">{fmt(current)} / {fmt(duration)}</div>
    //                 </div>
    //                 <div className="vc-center">
    //                     <input
    //                         className="vc-seek"
    //                         type="range"
    //                         min={0}
    //                         max={Math.max(0, duration)}
    //                         step="0.1"
    //                         value={Math.min(current, duration || 0)}
    //                         onChange={onSeek}
    //                         aria-label="Seek"
    //                     />
    //                 </div>
    //                 <div className="vc-right">
    //                     <button className="vc-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
    //                         {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
    //                     </button>
    //                     <input
    //                         className="vc-volume"
    //                         type="range"
    //                         min={0}
    //                         max={1}
    //                         step="0.01"
    //                         value={isMuted ? 0 : volume}
    //                         onChange={onVolume}
    //                         aria-label="Volume"
    //                     />
    //                     <button className="vc-btn vc-speed" onClick={cycleSpeed} aria-label="Speed">
    //                         {speed.toFixed(2).replace(/\.00$/, '')}x
    //                     </button>
    //                     <button className="vc-btn" onClick={toggleFs} aria-label={fs ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
    //                         {fs ? <Minimize size={16} /> : <Maximize size={16} />}
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };
    if(loadingContent) return <LoadingScreen text="Loading content..." />

    return (
        <div style={{ display: 'flex', height: embedded ? '70vh' : '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>
            <div style={{ width: '360px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: '24px' }}>
                {!embedded && (
                    <button style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', padding: '8px 0', marginBottom: '20px', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.target.style.color = '#111827'}
                        onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                        <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                        <span>Go to Dashboard</span>
                    </button>
                )}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ width: '300px', height: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{backgroundImage:`url(${mockThumbnail})`,backgroundSize:'cover',backgroundPosition:'center',width:'100%',height:'100%'}}>
                            <div style={{width:'100%',height:'100%',background:'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 80%)',display:'flex',flexDirection:'column',justifyContent:'space-between',alignItems:'center'}}>
                                <div></div>
                                <p style={{fontSize:'17px',fontWeight:'700',color:'#fff',textAlign:'center',marginBottom:'16px'}}>{courseData.title}</p>
                            </div>
                            
                        </div>
                    </div>
                    {/* <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px', lineHeight: '1.4' }}>{courseData.title}</h1> */}
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
            {activeLesson?.type === 'Module' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <ModulePreview
                        embedded={true}
                        data={{...contentData,learningOutcomes:contentData?.learning_outcomes}}
                    />  
                </div>
            )}
            {activeLesson?.type === 'Assessment' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#f8f9fa' }}>
                    assessment
                </div>
            )}
            {activeLesson?.type === 'Survey' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#f8f9fa' }}>
                    survey
                </div>
            )}
            

        </div>
    );
};

export default LearningPath;