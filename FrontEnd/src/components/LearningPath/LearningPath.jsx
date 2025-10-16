import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronLeft, ChevronUp, Star, Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText, ClipboardCheck, EyeIcon, Plus, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import '../common/Preview/Preview.css';

const LearningPath = ({ courseData: propCourseData }) => {
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

    const handleSectionClick = (section) => {
        setActiveLesson(section);
        if (section?.data) {
            setContentData(section.data);
        }
    };

    const markAsComplete = () => {
        if (activeLesson) {
            alert(`Marked "${activeLesson.title}" as complete!`);
        }
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
        } catch {}
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

    const defaultCourseData = {
        title: "Advanced Data Analysis Techniques",
        description: "Advanced Data Analysis Techniques: Unraveling Insights from Complex Data",
        progress: 47,
        completedLessons: 15,
        totalLessons: 32,
        feedbackEnabled:true,
        thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop",
        sections: [
            {
                id: 1, title: 'Physics: Unveiling the Universe\'s Fundamental Laws', type: 'Module', completed: true,
                data: {
                    "_id": {
                        "$oid": "68e337f54ac3b4df9cc71c15"
                    },
                    "title": "Physics: Unveiling the Universe's Fundamental Laws",
                    "tags": [
                        "Physics",
                        "Science",
                        "Fundamentals",
                        "Mechanics",
                        "Thermodynamics",
                        "Electromagnetism",
                        "Waves",
                        "Scientific Inquiry",
                        "Problem Solving",
                        "STEM"
                    ],
                    "primaryFile": null,
                    "additionalFile": null,
                    "trainingType": "Continuous Learning",
                    "team": {
                        "$oid": "68bd2fc86fe7e9076565e766"
                    },
                    "category": "Product Knowledge",
                    "badges": "1",
                    "stars": "1",
                    "enableFeedback": false,
                    "externalResource": "https://www.youtube.com/embed/ohIAiuHMKMI?si=MivGl4sZwXS7lIzJ",
                    "description": "Embark on an illuminating journey into the core principles that govern our physical world. This comprehensive module systematically explores the fundamental laws of mechanics, thermodynamics, electricity, magnetism, waves, and an introduction to modern physics. Through engaging concepts, practical applications, and problem-solving exercises, you will develop a deep understanding of phenomena ranging from everyday observations to the grand scale of the cosmos. Cultivate critical thinking, analytical reasoning, and scientific inquiry skills essential for academic success and real-world innovation.",
                    "learning_outcomes": [
                        "Explain and apply fundamental principles of classical mechanics, including motion, forces, and energy.",
                        "Describe and analyze concepts related to heat, temperature, and the laws of thermodynamics.",
                        "Understand the principles of electricity, magnetism, and their interrelationship (electromagnetism).",
                        "Solve quantitative problems using appropriate physical laws, equations, and mathematical reasoning.",
                        "Develop critical thinking skills to analyze and interpret various physical phenomena and scientific data."
                    ],
                    "richText": "<h1>Physics</h1>\n<h3>Exploring the Laws of the Universe</h3>\n<p>\nPhysics is the branch of science that deals with the fundamental principles governing the behavior of matter and energy.\nIt explores everything from the tiniest particles to the largest galaxies, helping us understand how the universe works.\n</p>\n\n<h3>Major Areas of Physics</h3>\n<ul>\n  <li><strong>Mechanics:</strong> The study of motion, forces, and energy.</li>\n  <li><strong>Thermodynamics:</strong> The study of heat, temperature, and the laws of energy transfer.</li>\n  <li><strong>Electromagnetism:</strong> The study of electric and magnetic fields, light, and radiation.</li>\n  <li><strong>Quantum Mechanics:</strong> Explores the behavior of atoms and subatomic particles.</li>\n  <li><strong>Relativity:</strong> Deals with motion at high speeds and the nature of space and time.</li>\n</ul>\n\n<h3>Why Physics Matters</h3>\n<p>\nPhysics forms the foundation for engineering, technology, and modern innovation. From smartphones to satellites, from\nMRI scanners to nuclear reactors — every breakthrough in technology traces its roots back to physical principles.\n</p>\n\n<blockquote>\n\"Physics is the study of how the universe behaves — the ultimate quest to understand nature itself.\"\n</blockquote>\n\n<h3>Core Equations You’ll Learn</h3>\n<ul>\n  <li><strong>Newton’s Second Law:</strong> F = m × a</li>\n  <li><strong>Law of Conservation of Energy:</strong> Energy cannot be created or destroyed.</li>\n  <li><strong>Ohm’s Law:</strong> V = I × R</li>\n  <li><strong>Einstein’s Mass–Energy Equivalence:</strong> E = m × c²</li>\n</ul>\n\n<h3>Real-World Applications</h3>\n<p>\nUnderstanding physics enables the development of technologies like renewable energy systems, space exploration,\nmedical imaging, and artificial intelligence. It’s not just theoretical — it powers the modern world.\n</p>",
                    "pushable_to_orgs": true,
                    "credits": 2,
                    "duration": 7,
                    "prerequisites": [
                        "Basic Physcis"
                    ],
                    "instructions": "After completing the module , Please complete the assignment and submit the file.",
                    "submissionEnabled": true,
                    "feedbackEnabled": true,
                    "created_by": {
                        "$oid": "68ca50ef7a748d88229e7dd5"
                    },
                    "thumbnail": "https://res.cloudinary.com/dwcuayp2u/image/upload/v1759721460/thumbnail/wjxvwjaif2l4qobuixws.png",
                    "status": "Saved",
                    "uuid": "941328f5-67ff-4f3e-82ed-57f5bcffc5e6",
                    "createdAt": {
                        "$date": "2025-10-06T03:31:01.292Z"
                    },
                    "updatedAt": {
                        "$date": "2025-10-10T14:06:12.111Z"
                    },
                    "__v": 0
                },
            },
            {
                id: 2, title: 'Node.js Essentials: Building Dynamic and Scalable Web Applications', type: 'Module', completed: true,
                data: {
                    "_id": {
                        "$oid": "68e2a314e6fee16dd2ca9ec7"
                    },
                    "title": "Node.js Essentials: Building Dynamic and Scalable Web Applications",
                    "primaryFile": "https://res.cloudinary.com/dwcuayp2u/video/upload/v1759683347/primaryFiles/ekpvw168r15jnjhpl920.mp4",
                    "additionalFile": null,
                    "trainingType": "Mandatory Training",
                    "category": "Technical Skills",
                    "badges": "0",
                    "stars": "0",
                    "enableFeedback": false,
                    "externalResource": "",
                    "description": "Dive into the world of server-side JavaScript with this comprehensive Node.js module. Designed for aspiring backend and full-stack developers, this module equips you with the fundamental skills to build high-performance, scalable web applications and robust APIs. You'll explore core Node.js concepts, master asynchronous programming, work with popular frameworks like Express.js, integrate with databases, and understand how to deploy your applications. Transform your web development capabilities and create powerful, real-world backend solutions.",
                    "richText": "",
                    "pushable_to_orgs": true,
                    "credits": 2,
                    "duration": 140,
                    "prerequisites": [
                        "None"
                    ],
                    "instructions": "",
                    "submissionEnabled": false,
                    "feedbackEnabled": false,
                    "created_by": {
                        "$oid": "68ca50ef7a748d88229e7dd5"
                    },
                    "thumbnail": "https://res.cloudinary.com/dwcuayp2u/image/upload/v1760333554/thumbnail/lzmowohd1ihz1ekzejft.png",
                    "status": "Saved",
                    "uuid": "05bdb9e5-b384-40a7-ab9e-40b72fe92bdf",
                    "createdAt": {
                        "$date": "2025-10-05T16:55:48.267Z"
                    },
                    "updatedAt": {
                        "$date": "2025-10-13T06:22:17.135Z"
                    },
                    "__v": 0
                }
            },
            // { id: 3, title: 'Leadership Effectiveness Self-Assessment', type: 'Assessment', completed: false },
            // { id: 4, title: 'Developing Emotional Intelligence as a Leader', type: 'Module', completed: false, active: true },
            // { id: 5, title: 'Leadership - Building Your Image', type: 'Module', completed: true },
            // { id: 6, title: 'Assessing Personal Effectiveness (Capstone Project)', type: 'Assessment', completed: true },
            // { id: 7, title: 'Leadership vs. Management - What it Takes', type: 'Module', completed: true },
            // { id: 8, title: 'Leadership Survey', type: 'Survey', completed: true }
        ]
    };

    const courseData = propCourseData || defaultCourseData;
    const activeSection = activeLesson || courseData.sections.find(s => s.active) || courseData.sections[0];
    // Initialize contentData from the initially active section if available
    React.useEffect(() => {
        if (!contentData && activeSection?.type?.toLowerCase() === 'module' && activeSection?.data) {
            console.log(activeSection.data);
            setContentData(activeSection.data);
        }
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
        const toggleFs = async () => {
            const el = containerRef.current;
            try {
                if (!document.fullscreenElement && el?.requestFullscreen) {
                    await el.requestFullscreen(); setFs(true);
                } else if (document.exitFullscreen) {
                    await document.exitFullscreen(); setFs(false);
                }
            } catch { }
        };

        return (
            <div className="video-player" ref={containerRef} style={{ width: '100%', maxWidth: 960, margin: '0 auto' }}>
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    onLoadedMetadata={onLoaded}
                    onTimeUpdate={onTime}
                    preload="metadata"
                    playsInline
                    style={{ width: '100%', height: 540, display: 'block', borderRadius: 8, objectFit: 'cover' }}
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
        <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <div style={{ width: '360px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', overflowY: 'auto', padding: '24px' }}>
                <button style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', padding: '8px 0', marginBottom: '20px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#111827'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}>
                    <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                    <span>Go to Dashboard</span>
                </button>

                <button
                    onClick={() => setShowRating(!showRating)}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#f59e0b', padding: '8px 0', marginBottom: '24px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#d97706'}
                    onMouseLeave={(e) => e.target.style.color = '#f59e0b'}>
                    <Star size={16} style={{ marginRight: '8px' }} />
                    <span>Rate this course</span>
                </button>

                {showRating && (
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
                )}

                <div style={{ marginBottom: '24px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <img src={courseData.thumbnail} alt="course" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px', lineHeight: '1.4' }}>{courseData.title}</h1>
                </div>

                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#5570f1' }}>{courseData.progress}%</span>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{courseData.completedLessons}/{courseData.totalLessons} Lessons</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #5570f1 0%, #4338ca 100%)', width: `${courseData.progress}%`, borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
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
                                    {section.completed && <CheckCircle size={14} color="#10b981" />}
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

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        {/* Meta row (only for module data) */}
                        {contentData && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                                {contentData.category && <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Category: {contentData.category}</span>}
                                {contentData.trainingType && <span style={{ background: '#f3f4f6', color: '#111827', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Type: {contentData.trainingType}</span>}
                                {Number.isFinite(contentData.duration) && <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Duration: {contentData.duration} mins</span>}
                                {Number(contentData.credits) > 0 && <span style={{ background: '#ecfeff', color: '#155e75', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Credits: {contentData.credits}</span>}
                            </div>
                        )}
                        {contentData?.instructions && (
                            <div style={{ margin: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Instructions</h3>
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
                </div>
            </div>
        </div>
    );
};

export default LearningPath;