{<div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#f8f9fa' }}>
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
                                        return elements;
                                    })() : contentData?.questions ? (() => {
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
            </div>}