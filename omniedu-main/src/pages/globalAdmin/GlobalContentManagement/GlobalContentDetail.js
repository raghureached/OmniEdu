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
           <div className="content-video">
          <iframe
            src={selectedContent.file_url}
            title="Video Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
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
