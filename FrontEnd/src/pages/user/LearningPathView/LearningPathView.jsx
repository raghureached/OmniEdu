import React, { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronLeft, ChevronUp, Star, Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText, ClipboardCheck, EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Loader2, Route, Lock } from 'lucide-react';
// import '../common/Preview/Preview.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../../services/api';
import ModuleView from '../ModuleView/ModuleView';
import AssessmentView from '../AssessmentView/AssessmentView';
import SurveyView from '../SurveyView/SurveyView';


const LearningPathView = () => {
    const [propCourseData, setPropCourseData] = useState(null);
    const navigate = useNavigate()
    const { learningPathId, assignId } = useParams();
    const [scheduleData, setScheduleData] = useState(null);
    const [pct,setPct] = useState(0)
    const scheduleMap = React.useMemo(() => {
        // scheduleData is { isSuccess, message, data }
        const schedules = scheduleData?.data?.elementSchedules;
        if (!Array.isArray(schedules)) return new Map();

        const map = new Map();
        schedules.forEach((s) => {
            if (s.elementId && s.assign_on) {
                map.set(String(s.elementId), new Date(s.assign_on));
            }
        });
        return map;
    }, [scheduleData]);
    useEffect(() => {
        const fetchLearningPath = async () => {
            const response = await api.get(`/api/user/getLearningPath/${learningPathId}`);
            setPropCourseData(response.data);
            // console.log(response)

        };

        const fetchAssignment = async () => {
            const response = await api.get(`/api/user/getAssignmentSchedule/${assignId}`);
            setScheduleData(response.data);
            // console.log(response)
        };
        fetchLearningPath();
        fetchAssignment();
    }, [learningPathId, assignId]);
    useEffect(() => {
        getCompleted();
    }, [propCourseData])
    const getCompleted = async () => {
        if (!propCourseData) {
            return;
        }
        const response = await api.get(`/api/user/getCompletedinLP/${propCourseData?._id}`);
        setCompletedSet(response.data)
    }
    // console.log(propCourseData)
    const [activeLesson, setActiveLesson] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [completedSet, setCompletedSet] = useState([]);
    const dispatch = useDispatch();
    const handleCompleteSection = async (id) => {
        setPct(pct+(completedSet.length/propCourseData?.lessons.length)*100)
        const res = await api.post(`/api/user/markComplete/${propCourseData?._id}/${id}`,{pct:pct});
        if (res.status === 200) {
            alert('Module marked complete!');
        }
        return;
    }
    const handleSectionClick = async (section, evt) => {
        if (section.locked) {
            return;
        }
        

        setActiveLesson(section);
        setLoadError(null);
        try {
            const wrapper = evt?.currentTarget?.parentElement;
            if (wrapper && typeof wrapper.scrollIntoView === 'function') {
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
            }
        } catch { }
    };

    const sourceData = propCourseData || null;
    const sections = React.useMemo(() => {
        if (!sourceData || !Array.isArray(sourceData.lessons)) return [];
        const ordered = [...sourceData.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const enforceOrder = !!sourceData.enforceOrder;
        const now = new Date();
        // First map to include computed fields
        const prelim = ordered.map((l, idx) => {
            const type = (l.type || '').toLowerCase();
            const itemTitle = l.title || (typeof l.id === 'object' && l.id?.title) || `Item ${idx + 1}`;
            const elementId = l.id?._id || l.id;
            const elementIdStr = elementId ? String(elementId) : '';
            const assignOn = elementId ? scheduleMap.get(elementIdStr) : null;
            const timeLocked = !!(assignOn && assignOn > now);
            const isCompleted = Array.isArray(completedSet) && completedSet.includes(elementIdStr);
            return {
                id: idx + 1,
                title: itemTitle,
                type: type === 'assessment' ? 'Assessment' : type === 'survey' ? 'Survey' : 'Module',
                completed: isCompleted,
                data: null,
                uuid: l.uuid,
                ref: l.id ?? null,
                locked: timeLocked, // may be overridden by enforceOrder below
                assignOn,
                elementIdStr,
            };
        });
        // Apply enforceOrder: lock a lesson if any previous lesson is not completed
        if (enforceOrder) {
            let allPrevCompleted = true;
            for (let i = 0; i < prelim.length; i++) {
                const prevRuleLocked = !allPrevCompleted;
                prelim[i].locked = prelim[i].locked || prevRuleLocked;
                // update allPrevCompleted for next iteration
                allPrevCompleted = allPrevCompleted && prelim[i].completed;
            }
        }
        // Strip helper field
        return prelim.map(({ elementIdStr, ...rest }) => rest);
    }, [sourceData, scheduleMap, completedSet]);
    // console.log(sections)

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
    // console.log(activeSection)
    React.useEffect(() => {
        (async () => {
            if (!activeSection || contentData) return;
            setActiveLesson(activeSection);
            setLoadingContent(false);
            setLoadError(null);
        })();
    }, [activeSection]);

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')) {
            case 'module': return <Play size={14} />;
            case 'survey': return <FileText size={14} />;
            case 'assessment': return <ClipboardCheck size={14} />;
            // default: return <FileText size={14} />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '90vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>
            <div style={{
                width: '360px',
                background: 'linear-gradient(180deg, #f9fafb 0%, #eef2ff 100%)',
                borderRight: '1px solid #e5e7eb',
                padding: '24px 20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 12px rgba(15, 23, 42, 0.03)'
            }}>
                <button style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#6b7280', padding: '8px 0', marginBottom: '20px', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#111827'}
                    onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                    onClick={() => navigate(window.history.back())}>
                    <ChevronLeft size={16} style={{ marginRight: '4px' }} />
                    <span>Go to Dashboard</span>
                </button>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ width: '300px', height: '250px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <div style={{ backgroundImage: `url(${courseData?.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100%' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.08) 92%, rgba(0,0,0,0) 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '16px'
                            }}>
                                {/* <div></div> */}
                                <p style={{ fontSize: '17px', fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: '16px' }}>{courseData.title}</p>
                            </div>

                        </div>
                    </div>
                    {/* <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px', lineHeight: '1.4' }}>{courseData.title}</h1> */}
                </div>

                {/* <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                 */}
                <div style={{
                    marginBottom: '20px',
                    padding: '14px 14px 18px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        {/* <span style={{ fontSize: '20px', fontWeight: '700', color: '#5570f1' }}> */}
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#5570f1' }}>
                            {(() => { const total = sections.length; const done = pct; return total ? Math.round((done / total) * 100) : 0; })()}%
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                            {completedSet.length}/{sections.length} Lessons
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        {(() => {
                            const total = sections.length; const done = pct; return (
                                <div style={{ height: '100%', background: 'linear-gradient(90deg, #5570f1 0%, #4338ca 100%)', width: `${pct}%`, borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                            );
                        })()}
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: "4px"
                }}>

                    {courseData.sections.map((section, idx) => {
                        const isLocked = section.locked;
                        const hoverText = isLocked
                            ? (section.assignOn
                                ? `Available after ${section.assignOn.toLocaleString()}`
                                : 'Complete previous lesson to unlock')
                            : '';

                        return (
                            <div key={section.id} style={{ marginBottom: '12px' }}>
                                <div
                                    onClick={(e) => handleSectionClick(section, e)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px 12px',
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s',
                                        backgroundColor:
                                            activeLesson?.id === section.id ? '#e0e7ff' : 'transparent',
                                        opacity: isLocked ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            activeLesson?.id === section.id ? '#e0e7ff' : '#e0e7ff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            activeLesson?.id === section.id ? '#e0e7ff' : 'transparent';
                                    }}
                                    title={hoverText}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#111827',
                                                marginBottom: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            {section.title} {isLocked && (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <Lock size={16} color="#b91c1c" />
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                            }}
                                        >
                                            {getTypeIcon(section.type)}
                                            <span
                                                style={{
                                                    border: '1px solid white',
                                                    padding: '3px 6px',
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    backgroundColor: '',
                                                }}
                                            >
                                                {section.type}
                                            </span>
                                            {section.locked && (
                                                <span style={{ fontSize: '11px', color: '#b91c1c' }}>
                                                    {hoverText}
                                                </span>
                                            )}
                                            {section.completed && (
                                                <CheckCircle size={14} color="#10b981" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
            {activeLesson?.type === 'Module' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <ModuleView
                        lpId={propCourseData._id}
                        id={activeLesson?.uuid}
                    />
                </div>
            )}
            {activeLesson?.type === 'Assessment' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <AssessmentView
                        id={activeLesson?.uuid}
                    />
                </div>
            )}
            {activeLesson?.type === 'Survey' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <SurveyView id={activeLesson?.uuid} />
                </div>
            )}


        </div>
    );
};

export default LearningPathView;