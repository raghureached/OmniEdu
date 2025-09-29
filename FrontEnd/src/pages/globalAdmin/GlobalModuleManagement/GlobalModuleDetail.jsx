import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchContentById } from "../../../store/slices/contentSlice";
import './GlobalModuleDetail.css';
import LoadingScreen from "../../../components/common/Loading/Loading";

const GlobalModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedContent, loading, error } = useSelector((state) => state.content);

  useEffect(() => {
    dispatch(fetchContentById(moduleId));
  }, [dispatch, moduleId]);

  if(loading){
    return <LoadingScreen text="Loading Content.... " />
  }
  if (error) return <p>{error}</p>;
  if (!selectedContent) return <p>No content found.</p>;

  function getFileType(fileUrl) {
    if (!fileUrl) return null;
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) return 'video';
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    return 'unknown';
  }

  // Optional helper to display badges, stars visually
  const renderStars = (count) => {
    const starsCount = Number(count) || 0;
    return '⭐'.repeat(starsCount);
  };
  

  return (
    <div className="content-details">
      <div className="content-header">
        <h1>{selectedContent.title}</h1>
      </div>

      <div className="content-meta">
        <span><strong>Training Type:</strong> {selectedContent.trainingType}</span>
        <span><strong>Status:</strong> {selectedContent.status === 'Saved' ? 'Saved' : 'Published'}</span>
        <span><strong>Category:</strong> {selectedContent.category}</span>
        <span><strong>Team ID:</strong> {selectedContent.team.name}</span>
        <span><strong>Created By:</strong> {selectedContent.created_by.name}</span>
        <span><strong>Created On:</strong> {new Date(selectedContent.createdAt).toLocaleDateString()}</span>
        <span><strong>Updated On:</strong> {new Date(selectedContent.updatedAt).toLocaleDateString()}</span>
        <span><strong>Duration:</strong> {selectedContent.duration} minutes</span>
        <span><strong>Credits:</strong> {selectedContent.credits}</span>
        <span><strong>Badges:</strong> {selectedContent.badges}</span>
        <span><strong>Stars:</strong> {renderStars(selectedContent.stars)}</span>
        <span><strong>Submission Enabled:</strong> {selectedContent.submissionEnabled ? 'Yes' : 'No'}</span>
        <span><strong>Feedback Enabled:</strong> {selectedContent.feedbackEnabled ? 'Yes' : 'No'}</span>
      </div>

      {selectedContent.thumbnail && (
        <div className="content-thumbnail">
          <img
            src={selectedContent.thumbnail}
            alt={`${selectedContent.title} Thumbnail`}
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        </div>
      )}

      <div className="content-description">
        <h3>Description</h3>
        <p>{selectedContent.description}</p>
      </div>

      {selectedContent.learning_outcomes && selectedContent.learning_outcomes.length > 0 && (
        <div className="content-learning-outcomes">
          <h3>Learning Outcomes</h3>
          <ul>
            {selectedContent.learning_outcomes.map((outcome, idx) => (
              <li key={idx}>{outcome}</li>
            ))}
          </ul>
        </div>
      )}

      {selectedContent.tags && selectedContent.tags.length > 0 && (
        <div className="content-tags">
          <h3>Tags</h3>
          <ul style={{ display: 'flex', gap: '10px', listStyle: 'none', padding: 0 }}>
            {selectedContent.tags.map((tag, idx) => (
              <li
                key={idx}
                style={{
                  backgroundColor: '#5570f1',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                }}
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary File */}
      {selectedContent.primaryFile && (
        <div className="content-primary-file" style={{ marginTop: '20px' }}>
          <h3>Primary File</h3>
          {(getFileType(selectedContent.primaryFile) === 'video') && (
            <video
              src={selectedContent.primaryFile}
              controls
              style={{ width: '100%', borderRadius: 8 }}
            />
          )}
          {(getFileType(selectedContent.primaryFile) === 'document') && (
            <iframe
              src={selectedContent.primaryFile}
              title="Primary Document Preview"
              width="100%"
              height="500px"
              style={{ borderRadius: 8, border: '1px solid #edf2f7' }}
            />
          )}
          {(getFileType(selectedContent.primaryFile) === 'image') && (
            <img
              src={selectedContent.primaryFile}
              alt="Primary Content"
              style={{ maxWidth: "100%", borderRadius: 8, boxShadow: "0 0 8px #edf2f7" }}
            />
          )}
          {(getFileType(selectedContent.primaryFile) === 'unknown') && (
            <a href={selectedContent.primaryFile} target="_blank" rel="noopener noreferrer">
              Download Primary File
            </a>
          )}
        </div>
      )}

      {/* Additional File */}
      {selectedContent.additionalFile && (
        <div className="content-additional-file" style={{ marginTop: '20px' }}>
          <h3>Additional File</h3>
          {(getFileType(selectedContent.additionalFile) === 'video') && (
            <video
              src={selectedContent.additionalFile}
              controls
              style={{ width: '100%', borderRadius: 8 }}
            />
          )}
          {(getFileType(selectedContent.additionalFile) === 'document') && (
            <iframe
              src={selectedContent.additionalFile}
              title="Additional Document Preview"
              width="100%"
              height="500px"
              style={{ borderRadius: 8, border: '1px solid #edf2f7' }}
            />
          )}
          {(getFileType(selectedContent.additionalFile) === 'image') && (
            <img
              src={selectedContent.additionalFile}
              alt="Additional Content"
              style={{ maxWidth: "100%", borderRadius: 8, boxShadow: "0 0 8px #edf2f7" }}
            />
          )}
          {(getFileType(selectedContent.additionalFile) === 'unknown') && (
            <a href={selectedContent.additionalFile} target="_blank" rel="noopener noreferrer">
              Download Additional File
            </a>
          )}
        </div>
      )}

      {/* External Resource */}
      {selectedContent.externalResource && (
        <div className="content-external-resource" style={{ marginTop: '20px' }}>
          <h3>External Resource</h3>
          <a href={selectedContent.externalResource} target="_blank" rel="noopener noreferrer">{selectedContent.externalResource}</a>
        </div>
      )}

      {/* Instructions */}
      {selectedContent.instructions && (
        <div className="content-instructions" style={{ marginTop: '20px' }}>
          <h3>Instructions</h3>
          <p>{selectedContent.instructions}</p>
        </div>
      )}

      <div className="content-actions" style={{ marginTop: '30px' }}>
        <button className="btn btn-back" onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default GlobalModuleDetail;
