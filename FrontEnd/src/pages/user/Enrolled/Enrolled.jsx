import React, { useState } from 'react';
import './Enrolled.css';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchUserEnrollments } from '../../../store/slices/userAssignmentSlice';
import { CourseCard } from '../Cards/ContentCards';
import LoadingScreen from '../../../components/common/Loading/Loading';

const Enrolled = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    dispatch(fetchUserEnrollments()).then(() => setLoading(false));
  }, []);

  const enrolled = useSelector((state) => state.userAssignments.enrolled);

  const currentItems= enrolled;
  // console.log(currentItems)
  if(loading){
    return <LoadingScreen text="Loading Enrollments" />
  }

  return (
    <div className="assigned-container">
      <div className="assigned-header">
        {/* <p>These are the content you are enrolled in</p> */}
        
      </div>

      <div className="assigned-content">
        {currentItems.length > 0 ? (
          <div className="assigned-grid">
            {currentItems.map(item => (
              item?.enrollment_id?.contentId && <CourseCard key={item.id} data={item.enrollment_id.contentId} assign_id={item.enrollment_id._id} status={item.status} progressPct={item.progress_pct} contentType={item.contentType}/>
            ))}
          </div>
        ) : (
          <div className="assigned-empty-state">
            <p>You currently have no Enrollments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enrolled;
