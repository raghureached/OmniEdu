import React, { useState, useEffect, useRef } from 'react';
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
import { Search, Filter, Share } from 'lucide-react';
import { GoX } from 'react-icons/go';

const LearningHub = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, in_progress: 0, expired: 0 });
  const [inProgressModules, setInProgressModules] = useState([]);
  const [recommendedModules, setRecommendedModules] = useState([])
  const [completed, setCompleted] = useState([])
  const [assigned, setAssigned] = useState([])
  const [workspace, setWorkspace] = useState([])
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState({ stars: 0, badges: 0, credits: 0 });
  const assignments = useSelector((state) => state.userAssignments.assignments);
  const navigate = useNavigate()

  // Added states for search/filter/export UI
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ search: "", type: "", category: "" });
  const [tempFilters, setTempFilters] = useState({ search: "", type: "", category: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [derivedSelectedCount, setDerivedSelectedCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const filterButtonRef = useRef(null);
  const filterPanelRef = useRef(null);

  // Basic handlers for filters and export (stubs/minimal logic)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setTempFilters({ search: "", type: "", category: "" });
    setFilters({ search: "", type: "", category: "" });
    setShowFilters(false);
  };

  const handleFilter = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  // Helpers and filtering logic
  const getContentFromItem = (item) => {
    return item?.assignment_id?.contentId || item?.enrollment_id?.contentId || null;
  };

  const normalizeType = (t) => {
    if (!t) return "";
    if (t.toLowerCase() === "learningpath") return "Learning Path";
    return t;
  };

  const matchesFilters = (item) => {
    const content = getContentFromItem(item);
    if (!content) return false;
    const type = normalizeType(item?.contentType || "");
    const category = content?.category || "";
    const haystack = `${content?.title || ""} ${content?.description || ""} ${(content?.tags || []).join(" ")}`.toLowerCase();

    if (filters.search && !haystack.includes((filters.search || "").toLowerCase())) return false;
    if (filters.type && normalizeType(filters.type) !== type) return false; // Using 'status' select as Type filter in UI
    if (filters.category && filters.category !== category) return false;
    return true;
  };

  const filteredWorkspace = Array.isArray(workspace) ? workspace.filter(matchesFilters) : [];
  const filteredAssigned = Array.isArray(assigned) ? assigned.filter(matchesFilters) : [];
  const filteredInProgress = Array.isArray(inProgressModules) ? inProgressModules.filter(matchesFilters) : [];
  const filteredCompleted = Array.isArray(completed) ? completed.filter(matchesFilters) : [];

  useEffect(() => {
    const allItems = [
      ...(Array.isArray(workspace) ? workspace : []),
      ...(Array.isArray(assigned) ? assigned : []),
      ...(Array.isArray(inProgressModules) ? inProgressModules : []),
      ...(Array.isArray(completed) ? completed : []),
    ];
    const cats = new Set();
    allItems.forEach((it) => {
      const c = getContentFromItem(it);
      if (c?.category) cats.add(c.category);
    });
    setCategories(Array.from(cats));

    const visibleCount =
      filteredWorkspace.length +
      filteredAssigned.length +
      filteredInProgress.length +
      filteredCompleted.length;
    setDerivedSelectedCount(visibleCount);
  }, [workspace, assigned, inProgressModules, completed, filters, searchTerm]);

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
    // Fetch categories if needed (placeholder empty array keeps UI functional)
    // Optionally, you can populate from an endpoint like /api/admin/getCategories
    const fetchWorkSpace = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user/getWorkspace');
        const data = await response.data;
        setWorkspace(data);
      } catch (error) {
        console.error('Error fetching workspace:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkSpace()
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

  if (loading) {
    return <LoadingScreen text="Fetching Data..." />
  }

  return (
    <div className="learning-hub-container">
      <div className="learning-hub-header">
        <p style={{marginBottom:"10px"}}>Track your progress and discover new learning opportunities</p>
        <div className='search-box-content' style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Search size={16} color="#6b7280" className="search-icon" />
            <input
              type="text"
              placeholder="Search Resources"

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
          <div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                ref={filterButtonRef}
                className="control-btn"
                onClick={() => {
                  setShowFilters(prev => {
                    const next = !prev;
                    if (next) {
                      setShowBulkAction(false);
                    }
                    return next;
                  });
                }}
              >
                <Filter size={16} />
                Filter
              </button>

              {showFilters && (
                <div ref={filterPanelRef} className="adminmodule-filter-panel">
                  <span
                    style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px" }}
                    onClick={() => setShowFilters(false)}
                  >
                    <GoX size={20} color="#6b7280" />
                  </span>
                  <div className="filter-group">
                    <label>Type</label>
                    <select
                      name="type"
                      value={tempFilters?.type || ""}
                      onChange={handleFilterChange}
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
                      value={tempFilters?.category || ""}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-actions">
                    <button className="btn-secondary" onClick={resetFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                      Clear
                    </button>
                    <button className="btn-primary" onClick={handleFilter} style={{ padding: '6px 12px', fontSize: '14px' }}>
                      Apply
                    </button>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        <section className="learning-learning-section">
          <div className="learning-section-header">
            <h3>Workspace</h3>

          </div>

          <div className="learning-modules-grid">
            {loading ? (
              renderSkeleton(2)
            ) : (
              filteredWorkspace.length > 0 ?
                filteredWorkspace.slice(0, 4).map(item => (
                  item?.assignment_id?.contentId && <CourseCard key={item.id} assign_id={item.assignment_id._id} data={item.assignment_id.contentId} status={item.status} progressPct={item.progress_pct} contentType={item.contentType} />
                ))
                : "You have no Assigned workspace."
            )}
          </div>
        </section>
        <section className="learning-learning-section">
          <div className="learning-section-header">
            <h3>Assigned</h3>
            {assigned.length > 0 && <span className="learning-view-all" onClick={() => navigate("/user/assigned")}>View All</span>}
          </div>

          <div className="learning-modules-grid">
            {loading ? (
              renderSkeleton(2)
            ) : (
              filteredAssigned.length > 0 ?
                filteredAssigned.slice(0, 4).map(item => (
                  item?.assignment_id?.contentId && <CourseCard key={item.id} assign_id={item.assignment_id._id} data={item.assignment_id.contentId} status={item.status} progressPct={item.progress_pct} contentType={item.contentType} />
                ))
                : "You have no Assigned trainings."
            )}
          </div>
        </section>

        <section className="learning-learning-section">
          <div className="learning-section-header">
            <h3>In Progress</h3>
            {inProgressModules.length > 0 && <span className="learning-view-all" onClick={() => navigate("/user/inProgress")}>View All</span>}
          </div>

          <div className="learning-modules-grid">
            {loading ? (
              renderSkeleton(2)
            ) : (
              filteredInProgress.length > 0 ?
                filteredInProgress?.map(m => (
                  m?.assignment_id?.contentId && <CourseCard key={m.id} assign_id={m.assignment_id._id} data={m?.assignment_id?.contentId || m?.enrollment_id?.contentId} status="in_progress" contentType={m?.contentType} progressPct={m?.progress_pct} />
                ))
                : "You have no In Progress trainings."
            )}
          </div>
        </section>
        <section className="learning-learning-section">
          <div className="learning-section-header">
            <h3>Completed</h3>
            {completed.length > 0 && <span className="learning-view-all" onClick={() => navigate("/user/completed")}>View All</span>}
          </div>

          <div className="learning-modules-grid">
            {loading ? (
              renderSkeleton(4)
            ) : (
              filteredCompleted.length > 0 ?
                filteredCompleted?.slice(0, 4).map(module => (
                  <CourseCard key={module.id} data={module.assignment_id.contentId || module.enrollment_id.contentId} contentType={module.contentType} progressPct={100} status="completed" />
                ))
                : "You have no Completed trainings."
            )}
          </div>
        </section>

        <section className="learning-learning-section">
          <div className="learning-section-header">
            <h3>Recommended For You</h3>
            {recommendedModules.length > 0 && <span className="learning-view-all" onClick={() => navigate("/recommended")}>View All</span>}
          </div>

          <div className="learning-modules-grid">
            {loading ? (
              renderSkeleton(4)
            ) : (
              "Feature under development"
            )}
          </div>
        </section>
      </div>
      );
};

      export default LearningHub;