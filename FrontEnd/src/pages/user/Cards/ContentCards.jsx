import React, { useState } from 'react';
import './ContentCards.css';
import { data, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useNotification } from '../../../components/common/Notification/NotificationProvider';
import { notifySuccess } from '../../../utils/notification';
import { useDispatch } from 'react-redux';
import { fetchUserAssignments } from '../../../store/slices/userAssignmentSlice';
export const CourseCard = ({ 
  data,
  assign_id,
  status,
  progressPct = 0,
  contentType 
}) => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const buttonStatus = {
        "assigned": "Start",
        "enrolled": "Start",
        "in_progress": "Resume",
        "completed": "View",
        "expired": "Expired",
        "not_enrolled": "Enroll"
    };
    const contentIcons = {
        "Module":"",
        "Assessment": "",
        "Survey":"",
        "Learning Path":"",
        "Learningpath":""
    }
    const getIcon = (contentType) => {
        return contentIcons[contentType] + contentType;
    }
  
  const buttonStatusFunc = async (status) => {
  const type = contentType?.toLowerCase()?.replace(/\s+/g, '');
  if (!type) return;

  const isGlobal = data.who === "Global";

  // ASSIGNED  (only org assignments should hit this)
  if (status === "assigned") {
    setLoading(true);
    await api.post(`/api/user/updateStatus/${assign_id}/in_progress`);
    await dispatch(fetchUserAssignments());
    navigate(`/${type}/${data.uuid}/${assign_id}`);
    setLoading(false);
    return;
  }

  // ENROLLED (GLOBAL catalog)
  if (status === "enrolled" && isGlobal) {
    setLoading(true);
    await api.post(`/api/user/updateStatus/${assign_id}/in_progress`);
    await dispatch(fetchUserAssignments());
    navigate(`/enrolled/${type}/${data.uuid}`);
    setLoading(false);
    return;
  }

  // IN PROGRESS
  if (status === "in_progress") {
    if (isGlobal) {
      // Global: enrolled route
      navigate(`/enrolled/${type}/${data.uuid}/true`);
    } else {
      // Org assignment route
      navigate(`/${type}/${data.uuid}/${assign_id}/true`);
    }
    return;
  }

  // COMPLETED
  if (status === "completed") {
    if (isGlobal) {
      navigate(`/enrolled/${type}/${data.uuid}`);
    } else {
      navigate(`/${type}/${data.uuid}/${assign_id}`);
    }
    return;
  }

  // EXPIRED
  if (status === "expired") {
    // For now do nothing
    return;
  }

  // NOT ENROLLED (GLOBAL catalog)
  if (status === "not_enrolled" && isGlobal) {
    setLoading(true);
    const payload = {
      type: type,
      who: data.who,
      model: data.model,
      name: data.name,
      elementSchedules: data.elementSchedules ? data.elementSchedules : [],
    };
    const response = await api.post(`/api/user/enroll/${data._id}`, payload);
    if (response.status === 200 || response.status === 201) {
      notifySuccess("Enrolled successfully", {
        title: "Enrolled successfully",
        message: "Please Refresh the page to see the changes",
        duration: 5000,
        dismissible: true,
      });
      // you could also navigate to the enrolled view here if you want:
      // navigate(`/enrolled/${type}/${data.uuid}`);
    }
    setLoading(false);
    return;
  }

  // Fallback: do nothing
};
  const size = 44;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(progressPct) || 0));
  const dash = (pct / 100) * c;

  return (
    <div className="course-card">
      <div className="course-image">
        <img src={data?.thumbnail} alt={data?.title} />
        <div className="badges">
            <span className={`badge ${contentType?.replace(/\s+/g, '').toLowerCase()}`} >{getIcon(contentType?.slice(0,1).toUpperCase()+contentType?.slice(1))}</span>
        </div>
      </div>
      <div className="course-content">
        <div className="course-header">
          <h3 className="course-title">{data?.title.slice(0,50)}...</h3>
          <div className="credits">
            <span className="credits-value">{(data?.duration || 0)}</span>
            <span className="credits-label">Mins</span>
          </div>
        </div>
        <p className="course-description">{data?.description.slice(0, 100)}...</p>
        <div className="course-footer">
          <div className="rating">
            {progressPct >= 0 && <div className="progress" aria-label={`Progress ${Math.round(pct)}%`} role="img">
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
            </div>}
            <div className="stars">
            </div>
          </div>
        <button className="btn-primary" onClick={()=>buttonStatusFunc(status)}>{loading ? "Loading..." : buttonStatus[status]}</button>
        </div>
      </div>
    </div>
  );
};
