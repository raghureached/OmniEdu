import React, { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronLeft, ChevronUp, Star, Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText, ClipboardCheck, EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Loader2, Route } from 'lucide-react';
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
    const { learningPathId } = useParams();
    useEffect(() => {
        const fetchLearningPath = async () => {
            const response = await api.get(`/api/user/getLearningPath/${learningPathId}`);
            console.log(response.data);
            setPropCourseData(response.data);

        };
        fetchLearningPath();
    }, [learningPathId]);
    // console.log(propCourseData)
    const [activeLesson, setActiveLesson] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [completedSet, setCompletedSet] = React.useState(new Set());
    const dispatch = useDispatch();

    const handleSectionClick = async (section, evt) => {
        console.log(section)
        setActiveLesson(section);
        setLoadError(null)
        // Scroll the clicked item into view at the top of the nearest scroll container
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
        return ordered.map((l, idx) => {
            const type = (l.type || '').toLowerCase();
            const itemTitle = l.title || (typeof l.id === 'object' && l.id?.title) || `Item ${idx + 1}`;
            return {
                id: idx + 1,
                title: itemTitle,
                type: type === 'assessment' ? 'Assessment' : type === 'survey' ? 'Survey' : 'Module',
                completed: false,
                data: null,
                uuid: l.uuid,
                ref: l.id ?? null,
            };
        });
    }, [sourceData]);
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
    React.useEffect(() => {
        (async () => {
            if (!activeSection || contentData) return;
            // console.log(activeSection)
            setActiveLesson(activeSection);
            // console.log(activeSection)
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
                backgroundColor: '#fff',
                borderRight: '1px solid #e5e7eb',
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
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

                <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#5570f1' }}>
                            {(() => { const total = sections.length; const done = completedSet.size; return total ? Math.round((done / total) * 100) : 0; })()}%
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                            {completedSet.size}/{sections.length} Lessons
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        {(() => {
                            const total = sections.length; const done = completedSet.size; const pct = total ? Math.round((done / total) * 100) : 0; return (
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

                    {courseData.sections.map((section, idx) => (
                        <div key={section.id} style={{ marginBottom: '12px' }} >
                            <div
                                onClick={(e) => handleSectionClick(section, e)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 12px', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s', backgroundColor: activeLesson?.id === section.id ? '#C2C2C2' : 'transparent' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = activeLesson?.id === section.id ? '#C2C2C2' : '#C2C2C2')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = activeLesson?.id === section.id ? '#C2C2C2' : 'transparent')}>

                                <div style={{ flex: 1 }}>
                                    {/* {getTypeIcon(section.type)} */}
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{section.title}</div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {getTypeIcon(section.type)}<span style={{ border: "1px solid white", padding: "3px 6px", borderRadius: "10px", fontSize: "12px", fontWeight: "500", backgroundColor: "#C2C2C2" }}>{section.type}</span>
                                        {completedSet.has(section.id) && <CheckCircle size={14} color="#10b981" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            {activeLesson?.type === 'Module' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <ModuleView

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