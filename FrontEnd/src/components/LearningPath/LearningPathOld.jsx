import React, { useEffect, useState } from 'react';
import { CheckCircle, ChevronDown, ChevronLeft, ChevronUp, Star, Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText, ClipboardCheck, EyeIcon, Plus, ThumbsUp, ThumbsDown, Send, Loader2 } from 'lucide-react';
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
import AssessmentPreview from '../common/Preview/AssessmentPreview';
import SurveyMainPreview from "../common/Preview/SurveyMainPreview"

const LearningPath = ({ courseData: propCourseData, embedded = false }) => {
    // console.log(propCourseData)
    const [activeLesson, setActiveLesson] = useState(null);
    const [contentData, setContentData] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [completedSet, setCompletedSet] = React.useState(new Set());
    const dispatch = useDispatch();

    const handleSectionClick = async (section) => {
        setActiveLesson(section);
        setLoadError(null)
        const type = (section?.type || '').toLowerCase();

        const ref = section?.ref ?? null; // may be id string or object
        // Prefer explicit section.uuid; else fall back to ref.uuid, ref.id, or string ref
        const idOrUuid = section?.uuid || (ref && typeof ref === 'object' ? (ref.uuid || ref.id || null) : (typeof ref === 'string' ? ref : null));
        if (!idOrUuid) {
            setContentData(null);
            return;
        }
        try {
            setLoadingContent(true);
            let payload = null;
            if (type === 'module') {
                payload = await dispatch(adminfetchContentById(idOrUuid)).unwrap();
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
                const idOrUuid = activeSection?.uuid || (ref && typeof ref === 'object' ? (ref.uuid || ref.id || null) : (typeof ref === 'string' ? ref : null));
                if (!idOrUuid) { setLoadingContent(false); return; }
                let payload = null;
                if (type === 'module') {
                    payload = await dispatch(adminfetchContentById(idOrUuid)).unwrap();
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
        })();
    }, [activeSection]);
    // Build Survey payload for SurveyMainPreview: map sections/questions -> formElements
    const surveyPayload = React.useMemo(() => {
        if (!contentData) return null;
        // If already in expected structure, return as-is
        if (Array.isArray(contentData.formElements)) return contentData;

        let mappedFormElements = [];
        if (Array.isArray(contentData.sections) && contentData.sections.length > 0) {
            contentData.sections.forEach((sec) => {
                // Section descriptor
                mappedFormElements.push({
                    type: 'section',
                    title: sec?.title || '',
                    description: sec?.description || ''
                });
                // Questions under section
                (sec?.questions || []).forEach((q) => {
                    const opts = Array.isArray(q.options) && q.options.length ? [...q.options] : ['', ''];
                    mappedFormElements.push({
                        _id: q._id,
                        uuid: q.uuid,
                        type: 'question',
                        question_type: q.type || '',
                        question_text: q.question_text || '',
                        options: opts.length >= 2 ? opts : [...opts, ''].slice(0, 2)
                    });
                });
            });
            // Ensure at least one question follows a section
            if (mappedFormElements.length === 1) {
                mappedFormElements.push({ type: 'question', question_type: '', question_text: '', options: ['', ''] });
            }
        } else if (Array.isArray(contentData.questions)) {
            // Legacy fallback if questions are at root
            mappedFormElements = [
                { type: 'section', description: contentData.description || '' },
                ...contentData.questions.map((q) => ({
                    _id: q._id,
                    uuid: q.uuid,
                    type: 'question',
                    question_type: q.type || '',
                    question_text: q.question_text || '',
                    options: Array.isArray(q.options) && q.options.length ? [...q.options] : ['', '']
                }))
            ];
        } else {
            mappedFormElements = [{ type: 'section', description: contentData.description || '' }];
        }

        // Normalize team/subteam into objects with .name for UI expectations
        const teamObj = typeof contentData.team === 'string' ? { name: contentData.team } : contentData.team;
        const subteamObj = typeof contentData.subteam === 'string' ? { name: contentData.subteam } : contentData.subteam;

        return { ...contentData, formElements: mappedFormElements, team: teamObj, subteam: subteamObj };
    }, [contentData]);

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Play size={14} />;
            case 'article': return <FileText size={14} />;
            case 'quiz':
            case 'assessment': return <ClipboardCheck size={14} />;
            default: return <FileText size={14} />;
        }
    };
    // if(loadingContent) return <LoadingScreen text="Loading content..." />    

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
                        <div style={{backgroundImage:`url(${courseData?.thumbnail})`,backgroundSize:'cover',backgroundPosition:'center',width:'100%',height:'100%'}}>
                            <div style={{
                                width:'100%',
                                height:'100%',
                                background:'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.08) 92%, rgba(0,0,0,0) 100%)',
                                display:'flex',
                                flexDirection:'column',
                                justifyContent:'center',
                                alignItems:'center',
                                padding:'16px'
                            }}>
                                {/* <div></div> */}
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
                    <div key={section.id} style={{ marginBottom: '12px' }} >
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
            {loadingContent && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <Loader2 color="#5570f1" size={24} />
                </div>
            )}
            {activeLesson?.type === 'Module' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <ModulePreview
                        embedded={true}
                        data={{...contentData,learningOutcomes:contentData?.learning_outcomes}}
                    />  
                </div>
            )}
            {activeLesson?.type === 'Assessment' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <AssessmentPreview
                        embedded={true}
                        data={{...contentData,learningOutcomes:contentData?.learning_outcomes}}
                    />
                </div>
            )}
            {activeLesson?.type === 'Survey' && (
                <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    <SurveyMainPreview embedded={true} data={surveyPayload || contentData}/>
                </div>
            )}
            

        </div>
    );
};

export default LearningPath;