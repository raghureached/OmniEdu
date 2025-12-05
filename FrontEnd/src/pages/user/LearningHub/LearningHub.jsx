import React, { useState, useEffect } from 'react';
import './LearningHub.css';
// Import icons from react-icons
import { FaCheckCircle, FaHourglassHalf, FaPlayCircle, FaExclamationTriangle } from 'react-icons/fa';
import { FaMedal, FaStar, FaAward } from 'react-icons/fa';
import api from '../../../services/api';
import { CourseCard } from '../Cards/ContentCards';
import { fetchUserAssignments } from '../../../store/slices/userAssignmentSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../../components/common/Loading/Loading';

const LearningHub = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, in_progress: 0, expired: 0 });
  const [inProgressModules, setInProgressModules] = useState([]);
  const [recommendedModules, setRecommendedModules] = useState([])
  const [completed,setCompleted] = useState([])
  const [assigned,setAssigned] = useState([])
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState({ stars: 0, badges: 0, credits: 0 });
  const assignments = useSelector((state) => state.userAssignments.assignments);
  const navigate = useNavigate()

  const filteredAssignments = assignments.filter((assignment) => assignment.status === "assigned");
  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getStats');
        const data = await response.data.data;
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchRewards = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getUserRewards');
        const data = await response.data.data;

        setRewards(data);
      } catch (error) {
        console.error('Error fetching rewards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    fetchRewards();
    const fetchInProgress = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getInProgress');
        const data = await response.data;
        setInProgressModules(data);
      } catch (error) {
        console.error('Error fetching in progress modules:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchAssigned = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getAssigned');
        const data = await response.data;
        setAssigned(data);
      } catch (error) {
        console.error('Error fetching assigned modules:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInProgress();
    fetchAssigned();
    const fetchCompleted = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getCompleted');
        const data = await response.data;
        setCompleted(data);
      } catch (error) {
        console.error('Error fetching completed modules:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompleted();
    dispatch(fetchUserAssignments()).then(() => setLoading(false));
  }, [])



  // Render loading skeleton
  const renderSkeleton = (count) => {
    return Array(count).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="module-card skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-progress"></div>
        <div className="skeleton-info"></div>
        <div className="skeleton-button"></div>
      </div>
    ));
  };

  if(loading){
    return <LoadingScreen text="Fetching Data..."/>
  }

  return (
    <div className="learning-hub-container">
      <div className="learning-hub-header">
        <p>Track your progress and discover new learning opportunities</p>
      </div>

      {/* Training & Leaderboard Overview Section */}
      {/* <section className="learning-overview-section">
        <div className="learning-section-header">
          <h3>Training & Leaderboard Overview</h3>
        </div>
        
        {loading ? (
          renderDashboardSkeleton()
        ) : (
          ""
        )}
      </section> */}
      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>Assigned</h3>
          {assigned.length > 0 && <span className="learning-view-all" onClick={()=>navigate("/assigned")}>View All</span>}
        </div>

        <div className="learning-modules-grid">
          {loading ? (
            renderSkeleton(2)
          ) : (
            assigned.length > 0 ?
              assigned.slice(0,4).map(item => (
                item?.assignment_id?.contentId && <CourseCard key={item.id} assign_id={item.assignment_id._id} data={item.assignment_id.contentId} status={item.status} progressPct={item.progress_pct} contentType={item.contentType} />
              ))
              : "You have no Assigned trainings."
          )}
        </div>
      </section>

      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>In Progress</h3>
          {inProgressModules.length > 0 && <span className="learning-view-all" onClick={()=>navigate("/inprogress")}>View All</span>}
        </div>

        <div className="learning-modules-grid">
          {loading ? (
            renderSkeleton(2)
          ) : (
            inProgressModules.length > 0 ?
              inProgressModules?.map(m => ( 
                m?.assignment_id?.contentId && <CourseCard key={m.id} assign_id={m.assignment_id._id} data={m?.assignment_id?.contentId || m?.enrollment_id?.contentId} status="in_progress" contentType={m?.contentType} progressPct={m?.progress_pct} />
              ))
              : "You have no In Progress trainings."
          )}
        </div>
      </section>
      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>Completed</h3>
          {completed.length > 0 && <span className="learning-view-all" onClick={()=>navigate("/completed")}>View All</span>}
        </div>

        <div className="learning-modules-grid">
          {loading ? (
            renderSkeleton(4)
          ) : (
            completed.length > 0 ?
              completed?.slice(0,4).map(module => (
                <CourseCard key={module.id} data={module.enrollment_id.contentId || module.assignment_id.contentId} contentType={module.contentType} status="not_enrolled" />
              ))
              : "You have no Completed trainings."
          )}
        </div>
      </section>

      <section className="learning-learning-section">
        <div className="learning-section-header">
          <h3>Recommended For You</h3>
          {recommendedModules.length > 0 && <span className="learning-view-all" onClick={()=>navigate("/recommended")}>View All</span>}
        </div>

        <div className="learning-modules-grid">
          {loading ? (
            renderSkeleton(4)
          ) : (
            ""
          )}
        </div>
      </section>
    </div>
  );
};

export default LearningHub;