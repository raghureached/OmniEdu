import React, { useState, useRef, useEffect } from 'react';
import './GradeSubmission.css';
import { ChevronDown, Search, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { categories } from '../../../utils/constants';
import { adminFetchSubmissions, admingradeSubmission } from '../../../store/slices/adminSubmissionSlice';
import { useParams } from 'react-router-dom';
const GradeSubmission = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { moduleId } = useParams();

  // State for searchable module dropdown
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);
  const [moduleSearchTerm, setModuleSearchTerm] = useState('');
  const moduleDropdownRef = useRef(null);

  const { items = [], loading = false, error = null } = useSelector((state) => state.adminSubmissions || {});
  // console.log(items)
  const modules = [
    'Cyber Security Fundamentals',
    'Advanced Time Management',
    'Project Management Basics',
    'Communication Skills',
    'Data Analysis',
    'Leadership Development'
  ];

  useEffect(() => {
    dispatch(adminFetchSubmissions(moduleId));
  }, []);

  // Transform API data to match component structure
  const transformedSubmissions = (items || []).map(submission => ({
    id: submission._id,
    learner: submission.userId?.name || submission.userId?.email || 'Unknown',
    module: submission.moduleId?.title || 'Unknown Module',
    submissionDate: new Date(submission.submissionDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    status: submission.grade ? 'graded' : 'submitted',
    grade: submission.grade || null,
    fileUrl: submission.file_url,
    submissionId: submission._id
  }));

  const submissions = transformedSubmissions;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target)) {
        setModuleDropdownOpen(false);
        setModuleSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openModal = (submission) => {
    console.log(submission)
    setSelectedSubmission(submission);
    setGradeValue(submission.grade || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
    setGradeValue('');
    setFeedback('');
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) {
      console.error('No submission selected');
      return;
    }

    try {
      const result = await dispatch(admingradeSubmission({
        submissionId: selectedSubmission._id || selectedSubmission.submissionId,
        grade: gradeValue,
        feedback: feedback
      })).unwrap();

      console.log('Grade saved successfully:', result);
      closeModal();
    } catch (error) {
      console.error('Failed to save grade:', error);
    }
  };

  // Module dropdown handlers
  const handleModuleSelect = (module) => {
    setModuleFilter(module);
    setModuleDropdownOpen(false);
    setModuleSearchTerm('');
  };

  const handleModuleClear = () => {
    setModuleFilter('');
    setModuleSearchTerm('');
  };

  const filteredModules = modules.filter(module =>
    module.toLowerCase().includes(moduleSearchTerm.toLowerCase())
  );

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.learner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = !moduleFilter || sub.module === moduleFilter;
    const matchesTeam = true; // Team filter logic would go here
    return matchesSearch && matchesModule && matchesTeam;
  });

  return (
    <div className="grade-sub-container">
      <div className="grade-sub-header">
        <h1 className="grade-sub-title">Review Submissions</h1>
      </div>

      {loading ? (
        <div className="grade-sub-loading">
          <p>Loading submissions...</p>
        </div>
      ) : error ? (
        <div className="grade-sub-error">
          <p>Error: {error}</p>
        </div>
      ) : (
        <>
          <div className="grade-sub-filters">
            {/* <div className="grade-sub-filter-group" ref={moduleDropdownRef}>
              <div className="grade-sub-searchable-dropdown">
                <div
                  className="grade-sub-dropdown-trigger"
                  onClick={() => setModuleDropdownOpen(!moduleDropdownOpen)}
                >
                  <span className={moduleFilter ? 'grade-sub-selected-value' : 'grade-sub-placeholder'}>
                    {moduleFilter || 'Filter by Module'}
                  </span>
                  <div className="grade-sub-dropdown-icons">
                    {moduleFilter && (
                      <X
                        size={16}
                        className="grade-sub-clear-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModuleClear();
                        }}
                      />
                    )}
                    <ChevronDown
                      size={16}
                      className={`grade-sub-chevron ${moduleDropdownOpen ? 'open' : ''}`}
                    />
                  </div>
                </div>

                {moduleDropdownOpen && (
                  <div className="grade-sub-dropdown-menu">
                    <div className="grade-sub-search-input-wrapper">
                      <Search size={16} className="grade-sub-search-icon" />
                      <input
                        type="text"
                        className="grade-sub-search-input"
                        placeholder="Search modules..."
                        value={moduleSearchTerm}
                        onChange={(e) => setModuleSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="grade-sub-dropdown-options">
                      {filteredModules.length > 0 ? (
                        filteredModules.map((module, index) => (
                          <div
                            key={index}
                            className="grade-sub-dropdown-option"
                            onClick={() => handleModuleSelect(module)}
                          >
                            {module}
                          </div>
                        ))
                      ) : (
                        <div className="grade-sub-no-results">
                          No modules found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div> */}
            {/* <div className="grade-sub-filter-group">
              <select
                className="grade-sub-input"
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
              >
                <option value="">Filter by Team</option>
                <option value="Development Team">Development Team</option>
                <option value="Sales Team">Sales Team</option>
              </select>
            </div> */}
            <div className="grade-sub-filter-group">
              <input
                type="search"
                className="grade-sub-input"
                placeholder="Search by Learner Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grade-sub-table-container">
            <table className="grade-sub-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Module</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length === 0 && 
                <td>
                  <p>No submissions found</p>
                </td>}
                {filteredSubmissions.map(submission => (
                  <tr key={submission.id}>
                    <td>{submission.learner}</td>
                    <td>{submission.module}</td>
                    <td>{submission.submissionDate}</td>
                    <td>
                      <span className={`assess-status-badge ${submission.status === "graded" ? "published" : "draft"}`}>
                        {submission.status === 'submitted' ? 'Submitted' : 'Graded'}
                      </span>
                    </td>
                    <td>{submission.grade ? `${submission.grade}/100` : '--'}</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => openModal(submission)}
                      >
                        View & Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="grade-sub-modal" onClick={closeModal}>
              <div className="grade-sub-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="grade-sub-modal-header">
                  <h2>Grade Submission</h2>
                  <button className="grade-sub-modal-close" onClick={closeModal}>×</button>
                </div>

                <div className="grade-sub-form-group">
                  <span className="grade-sub-form-label">Learner: {selectedSubmission?.learner}</span>
                  <span className="grade-sub-form-label">Module: {selectedSubmission?.module}</span>
                </div>

                <div className="grade-sub-form-group">
                  <label className="grade-sub-form-label">Submission</label>
                  <a href="#" className="grade-sub-submission-link" target="_blank" rel="noopener noreferrer">
                    View Learner's Submission File
                  </a>
                </div>

                <div className="grade-sub-form-group">
                  <label className="grade-sub-form-label" htmlFor="grade">Score (out of 100)</label>
                  <input
                    type="number"
                    id="grade"
                    className="grade-sub-input"
                    placeholder="e.g., 90"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="grade-sub-form-group">
                  <label className="grade-sub-form-label" htmlFor="feedback">Feedback</label>
                  <textarea
                    id="feedback"
                    className="grade-sub-input grade-sub-textarea"
                    rows="4"
                    placeholder="Provide constructive feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div></div>
                  <button
                    onClick={handleSaveGrade}
                    disabled={!selectedSubmission || !gradeValue}
                  >
                    Save Grade
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GradeSubmission;