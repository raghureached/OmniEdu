import React, { useState } from 'react';
import './ContentCards.css';
import {Book} from "lucide-react"
import ModulePreview from '../../../components/common/Preview/Preview';
import { useNavigate } from 'react-router-dom';

export const CourseCard = ({ 
  data,
  status,
  progressPct = 0   ,
  contentType 
}) => {
    const [previewModal, setPreviewModal] = useState(false);
    const navigate = useNavigate();
    const buttonStatus = {
        "assigned": "Start",
        "in_progress": "Resume",
        "completed": "View",
        "expired": "Expired"
    };
    const contentIcons = {
        "Module":"",
        "Assessment": "",
        "Surevy":"",
        "Learning Path":"",
    }
    const getIcon = (contentType) => {
        return contentIcons[contentType] + contentType;
    }
    const getDuration = (duration) => {
        return `${(duration/60).toFixed(1)}`;
    }
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">★</span>);
      }
    }
    return stars;
  };
  const buttonStatusFunc = (status) => {
    // console.log(data)
    if(status === "assigned") {
        navigate(`/module/${data.uuid}`);
    }
    if(status === "in_progress") {
      
    }
    if(status === "completed") {
      
    }
    if(status === "expired") {
      
    }
  }
  // circular progress metrics
  const size = 44;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(progressPct) || 0));
  const dash = (pct / 100) * c;

  return (
    <div className="course-card">
      <div className="course-image">
        <img src={data.thumbnail} alt={data.title} />
        <div className="badges">
            <span className="badge">{getIcon(contentType)}</span>
        </div>
      </div>
      <div className="course-content">
        <div className="course-header">
          <h3 className="course-title">{data.title.slice(0,50)}...</h3>
          <div className="credits">
            <span className="credits-value">{getDuration(data.duration)}</span>
            <span className="credits-label">Hours</span>
          </div>
        </div>
        <p className="course-description">{data.description.slice(0, 100)}...</p>
        <div className="course-footer">
          <div className="rating">
            <div className="progress" aria-label={`Progress ${Math.round(pct)}%`} role="img">
              <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                  className="progress-ring__bg"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  strokeWidth={stroke}
                  fill="none"
                />
                <circle
                  className="progress-ring__fg"
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={`${c} ${c}`}
                  strokeDashoffset={c - dash}
                />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="progress-ring__label">
                  {Math.round(pct)}%
                </text>
              </svg>
            </div>
            <div className="stars">
            </div>
          </div>
        <button className="btn-primary" onClick={()=>buttonStatusFunc(status)}>{buttonStatus[status]}</button>
        </div>
      </div>
    </div>
  );
};
