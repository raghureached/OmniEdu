import React, { useState } from 'react';
import './Assigned.css';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchUserAssignments } from '../../../store/slices/userAssignmentSlice';
import { CourseCard } from '../Cards/ContentCards';

const Assigned = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUserAssignments());
  }, []);
  const [activeTab, setActiveTab] = useState('training');

  const assignments = useSelector((state) => state.userAssignments.assignments);

  

  const currentItems= assignments;

  const trainingCount = assignments.length;
  const assignmentCount = assignments.length;

  return (
    <div className="assigned-container">
      {/* <div className="assigned-header">
        
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'training' ? 'active' : ''}`}
            onClick={() => setActiveTab('training')}
          >
            Trainings ({trainingCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments ({assignmentCount})
          </button>
        </div>
      </div> */}

      <div className="assigned-content">
        {currentItems.length > 0 ? (
          <div className="assigned-grid">
            {currentItems.map(item => (
              
              <CourseCard key={item.id} data={item.assignment_id.contentId} status={item.status} progressPct={item.progress_pct} contentType={item.contentType} />
            ))}
          </div>
        ) : (
          <div className="assigned-empty-state">
            <p>You currently have no {activeTab === 'training' ? 'assigned trainings' : 'assignments'}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assigned;