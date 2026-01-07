import React, { useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchUserAssignments } from '../../../store/slices/userAssignmentSlice';
import { CourseCard } from '../Cards/ContentCards';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { Search, Filter } from 'lucide-react';
import { GoX } from 'react-icons/go';
import api from '../../../services/api';
import './InProgress.css';
const InProgress = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [inProgressModules, setInProgressModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ search: '', type: '', category: '' });
  const [tempFilters, setTempFilters] = useState({ search: '', type: '', category: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    const cats = new Set();
    inProgressModules.forEach((item) => {
      const content = item?.assignment_id?.contentId || item?.enrollment_id?.contentId;
      if (content?.category) cats.add(content.category);
    });
    setCategories(Array.from(cats));
  }, [inProgressModules]);

  const normalizeType = (t) => {
    if (!t) return '';
    if (t.toLowerCase() === 'learningpath') return 'Learning Path';
    return t;
  };

  const filteredModules = inProgressModules.filter(item => {
    const content = item?.assignment_id?.contentId || item?.enrollment_id?.contentId;
    if (!content) return false;

    const searchLower = (filters.search || '').toLowerCase();
    const haystack = `${content?.title || ''} ${content?.description || ''} ${(content?.tags || []).join(' ')}`.toLowerCase();
    if (searchLower && !haystack.includes(searchLower)) return false;

    const type = normalizeType(item?.contentType || '');
    if (filters.type && normalizeType(filters.type) !== type) return false;

    if (filters.category && filters.category !== (content?.category || '')) return false;

    return true;
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
          <button
            className="control-btn"
            style={{ marginLeft: 10 }}
            onClick={() => setShowFilters((p) => !p)}
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="adminmodule-filter-panel" style={{ marginTop: 8 }}>
          <span
            style={{ cursor: 'pointer', position: 'absolute', right: 10, top: 10 }}
            onClick={() => setShowFilters(false)}
          >
            <GoX size={20} color="#6b7280" />
          </span>
          <div className="filter-group">
            <label>Type</label>
            <select
              name="type"
              value={tempFilters?.type || ''}
              onChange={(e) => setTempFilters((p) => ({ ...p, type: e.target.value }))}
            >
              <option value="">All</option>
              <option value="Module">Module</option>
              <option value="Assessment">Assessment</option>
              <option value="Learning Path">Learning Path</option>
              <option value="SCORM">SCORM</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select
              name="category"
              value={tempFilters?.category || ''}
              onChange={(e) => setTempFilters((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn-secondary" onClick={() => { setTempFilters({ search: '', type: '', category: '' }); setFilters({ search: '', type: '', category: '' }); setShowFilters(false); }} style={{ padding: '6px 12px', fontSize: 14 }}>Clear</button>
            <button className="btn-primary" onClick={() => { setFilters(tempFilters); setShowFilters(false); }} style={{ padding: '6px 12px', fontSize: 14 }}>Apply</button>
          </div>
        </div>
      )}
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