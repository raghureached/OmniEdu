import React, { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchUserAssignments } from '../../../store/slices/userAssignmentSlice';
import { CourseCard } from '../Cards/ContentCards';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { Search } from 'lucide-react';
import api from '../../../services/api';
import './InProgress.css';
const InProgress = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [inProgressModules, setInProgressModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: ''
  });
  useEffect(() => {
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
    fetchInProgress();
  }, []);
  const [activeTab, setActiveTab] = useState('training');
  // const assignments = useSelector(state => state.userAssignments);
  
  // Filter modules based on search term
  const filteredModules = inProgressModules.filter(item => {
    const content = item?.assignment_id?.contentId || item?.enrollment_id?.contentId;
    if (!content) return false;
    
    const searchLower = filters.search.toLowerCase();
    return (
      content.title?.toLowerCase().includes(searchLower) ||
      content.description?.toLowerCase().includes(searchLower) ||
      content.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });
  
  const currentItems = filteredModules;


  if(loading){
    return <LoadingScreen text="Loading Assignments" />
  }

  return (
    <div className="assigned-container">
      <div className="assigned-header">
        <div className="search-box-content" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            placeholder="Search In Progress Modules"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setFilters(prev => ({
                ...prev,
                search: e.target.value
              }));
            }}
          />
        </div>
      </div>

      <div className="assigned-content">
        {currentItems.length > 0 ? (
          <div className="assigned-grid">
            {currentItems.map(item => (
              
              item?.assignment_id?.contentId && <CourseCard key={item.id} assign_id={item.assignment_id._id} data={item.assignment_id.contentId} status={item.status} progressPct={item.progress_pct} contentType={item.contentType}/>
            ))}
          </div>
        ) : (
          <div className="assigned-empty-state">
            <p>You currently have no {activeTab === 'training' ? 'in progress trainings' : 'assignments'}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InProgress;