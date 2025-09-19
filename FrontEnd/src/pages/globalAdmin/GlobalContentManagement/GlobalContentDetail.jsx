import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchContentById } from "../../../store/slices/contentSlice";
import './GlobalContentDetail.css'

const GlobalContentDetails = () => {
  const { contentId } = useParams();
  const navigate = useNavigate()
//   console.log(contentId)
  const dispatch = useDispatch();
  const { selectedContent, loading, error } = useSelector((state) => state.content);

  useEffect(() => {
    dispatch(fetchContentById(contentId));
  }, [dispatch, contentId]);

  if (loading) return <p>Loading content...</p>;
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
  
  return (
    <div className="content-details">
      <div className="content-header">
        <h1>{selectedContent.title}</h1>
      </div>

      <div className="content-meta">
        <span>Type: {selectedContent.type}</span>
        <span>Status: {selectedContent.is_active ? 'Active' : 'Inactive'}</span>
        <span>
          Created: {new Date(selectedContent.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="content-body">{selectedContent.content}</div>

      {selectedContent.file_url && (
  <div className="content-file">
    {getFileType(selectedContent.file_url) === 'video' && (
      <div className="content-video">
        <video
          src={selectedContent.file_url}
          controls
          width="100%"
          style={{ borderRadius: 8 }}
        />
      </div>
    )}

    {getFileType(selectedContent.file_url) === 'document' && (
      <div className="content-document">
        <iframe
          src={selectedContent.file_url}
          title="Document Preview"
          width="100%"
          height="500px"
          style={{ borderRadius: 8, border: '1px solid #edf2f7' }}
        />
      </div>
    )}

    {getFileType(selectedContent.file_url) === 'image' && (
      <div className="content-image">
        <img
          src={selectedContent.file_url}
          alt="Content"
          style={{ maxWidth: "100%", borderRadius: 8, boxShadow: "0 0 8px #edf2f7" }}
        />
      </div>
    )}

    {getFileType(selectedContent.file_url) === 'unknown' && (
      <div className="content-unknown">
        <a href={selectedContent.file_url} target="_blank" rel="noopener noreferrer">
          Download File
        </a>
      </div>
    )}
  </div>
)}


      <div className="content-actions">
        <button className="btn btn-back" onClick={() => navigate(-1)}>Back</button>
        <button className="btn btn-edit">Edit</button>
        <button className="btn btn-delete">Delete</button>
      </div>
    </div>
  );
};

export default GlobalContentDetails;
