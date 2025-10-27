import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent, deleteContent } from '../../../store/slices/contentSlice';
import LearningPathModal from './LearningPathModal';
import './LearningPaths.css';
import { Edit3, FileText, Search, Trash2, Users } from 'lucide-react';
import { getLearningPaths } from '../../../store/slices/learningPathSlice';
import { deleteLearningPath } from '../../../store/slices/learningPathSlice';

const LearningPaths = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.content);
  const {assessments} = useSelector((state) => state.adminAssessments)
  const {learningPaths} = useSelector((state) => state.learningPaths)

  // State for filters
  const [nameSearch, setNameSearch] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);

  // Dummy data for demonstration
  const dummyPaths = [
    {
      id: 1,
      title: 'Frontend Onboarding',
      classification: 'Role-Specific Training',
      status: 'Published',
      version: '1.0',
      updatedAt: '2025-04-20',
      moduleCount: 5,
      enrolledCount: 24,
      completionRate: '78%',
      description: 'A comprehensive onboarding path covering React, tooling, code standards, and deployments.',
      tags: ['React', 'Tooling', 'Onboarding']
    },
    {
      id: 2,
      title: 'Backend Fundamentals',
      classification: 'Role-Specific Training',
      status: 'Published',
      version: '1.2',
      updatedAt: '2025-03-15',
      moduleCount: 6,
      enrolledCount: 18,
      completionRate: '65%',
      description: 'Core backend concepts including Node.js, APIs, databases, and authentication best practices.',
      tags: ['Node.js', 'API', 'Database']
    },
    {
      id: 3,
      title: 'Leadership Development',
      classification: 'Leadership',
      status: 'Draft',
      version: '0.9',
      updatedAt: '2025-05-01',
      moduleCount: 4,
      enrolledCount: 0,
      completionRate: '0%',
      description: 'Develop soft skills: communication, mentorship, stakeholder management, and conflict resolution.',
      tags: ['Leadership', 'Communication']
    },
    {
      id: 4,
      title: 'Customer Support Training',
      classification: 'Role-Specific Training',
      status: 'Archived',
      version: '2.1',
      updatedAt: '2024-12-10',
      moduleCount: 7,
      enrolledCount: 42,
      completionRate: '92%',
      description: 'Training for support workflows, product knowledge, ticket handling, and customer empathy.',
      tags: ['Support', 'Product', 'CX']
    }
  ];
  useEffect(() => {
    dispatch(getLearningPaths());
  }, [dispatch]);

  const handleDeletePath = (pathId) => {
    if (window.confirm('Are you sure you want to delete this learning path?')) {
      // Optional backend sync
      dispatch(deleteLearningPath(pathId));
    }
  };

  const openCreateModal = () => {
    setEditingPath(null);
    setIsModalOpen(true);
  };

  const openEditModal = (path) => {
    setEditingPath(path);
    setIsModalOpen(true);
  };

  const handleSavePath = (data) => {
    const { tagsText, ...payload } = data || {};
    if (editingPath) {
      // update
      // dispatch((editingPath.id, payload));
    } else {
      // create
      const newItem = {
        id: Math.max(0, ...learningPaths.map(p => p.id)) + 1,
        title: payload.title,
        classification: payload.classification,
        status: payload.status,
        version: payload.version || '1.0',
        updatedAt: new Date().toISOString(),
        moduleCount: 0,
        enrolledCount: 0,
        completionRate: '0%',
        description: payload.description || '',
        tags: Array.isArray(payload.tags) ? payload.tags : []
      };
    }
    setIsModalOpen(false);
    setEditingPath(null);
  };
  const handleEditPath = (path)=>{
    setIsModalOpen(true)
    setEditingPath(path)
  }
  // Apply filters to paths
  const filteredPaths = learningPaths.filter(path => {
    const matchesName = path.title.toLowerCase().includes(nameSearch.toLowerCase());
    const matchesClassification = classificationFilter === 'all' || path.classification === classificationFilter;
    const matchesStatus = statusFilter === 'all' || path.status === statusFilter;

    return matchesName && matchesClassification && matchesStatus;
  });

  // Handle filter reset
  const handleFilterReset = () => {
    setNameSearch('');
    setClassificationFilter('all');
    setStatusFilter('all');
  };
  const normalizeDuration = (duration) =>{
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }

  return (
    <div className="learnpath-container">
      <div className="learnpath-header">
        <div className="learnpath-header-content">
        <div className="global-content-header-info">
            <h1 className="global-content-page-title">Learning Paths Management</h1>
            <p className="global-content-page-subtitle">Create, Manage and Organize your learning paths</p>
          </div>
          <div className="global-content-stats">
            <div className="global-content-stat-card">
              <div className="global-content-stat-icon">
                <FileText size={20} />
              </div>
              <div className="global-content-stat-info">
                <span className="global-content-stat-number">{learningPaths.length}</span>
                <span className="global-content-stat-label"> Learning Paths</span>
              </div>
            </div>
            <div className="global-content-stat-card">
              <div className="global-content-stat-icon published">
                <Users size={20} />
              </div>
              <div className="global-content-stat-info">
                <span className="global-content-stat-number">{items.filter(a => a.status === 'Published').length}</span>
                <span className="global-content-stat-label">Published</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="learnpath-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="learnpath-filter-row">
          <div className="search-box-content">
            {/* <label>Name</label> */}
            <Search size={16} color="#6b7280" className="search-icon" />

            <input type="text" placeholder="Search Learning Paths" value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} />
          </div>
          {/* <div className="learnpath-filter-group">
            <label>Classification</label>
            <select value={classificationFilter} onChange={(e) => setClassificationFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Role-Specific Training">Role-Specific Training</option>
              <option value="Leadership">Leadership</option>
              <option value="Compliance">Compliance</option>
              <option value="Onboarding">Onboarding</option>
            </select>
          </div> */}
          {/* <div className="learnpath-filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div> */}
          {/* <div className="learnpath-filter-actions">
            <button className="learnpath-btn-secondary" onClick={() => {}}>
              Filter
            </button>
            <button className="learnpath-btn-tertiary" onClick={handleFilterReset}>
              Reset
            </button>
          </div> */}
        </div>
        <button className="btn-primary" onClick={openCreateModal}>+ Add Learning Path</button>
      </div>

      <div className="learnpath-table-wrapper">
        {filteredPaths.length === 0 ? (
          <div className="learnpath-empty">No learning paths found</div>
        ) : (
          <table className="learnpath-table">
            <thead>
              <tr>
                <th>Name</th>
                {/* <th>Classification</th> */}
                <th>Status</th>
                {/* <th>Version</th> */}
                <th>Est. Duration</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaths.map((path) => (
                <tr key={path.id}>
                  <td>
                    <div className="learnpath-name">
                      <div className="learnpath-title-wrap">
                        <h4 className="learnpath-name-title">{path.title}</h4>
                        <p className="learnpath-name-desc">{path.description || 'No description provided'}</p>
                        {Array.isArray(path.tags) && path.tags.length > 0 && (
                          <div className="learnpath-tags">
                            {path.tags.map((t, idx) => (
                              <span key={`${path.id}-tag-${idx}`} className="learnpath-tag">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* <td>{path.classification}</td> */}
                  <td>
                    <span className={`learnpath-badge learnpath-${path.status.toLowerCase()}`}>{path.status}</span>
                  </td>
                  {/* <td>{path.version}</td> */}
                  <td>{normalizeDuration(path.duration)}</td>
                  <td>{new Date(path.updatedAt).toLocaleDateString()}</td>
                  <td className="learnpath-actions">
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="global-action-btn delete"
                        onClick={()=>handleDeletePath(path.uuid)}>
                        <Trash2 size={16} />
                      </button>
                      <button className="global-action-btn edit" onClick={()=>handleEditPath(path)}>
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <LearningPathModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPath(null); }}
        onSave={handleSavePath}
        initialData={editingPath}
      />
    </div>
  );
};

export default LearningPaths;