import React, { useMemo, useState, useEffect } from 'react';
import { X, Calendar, User, BookOpen, ClipboardCheck, FileText, Download } from 'lucide-react';
import './AnalyticsPop.css';

function formatDate(d) {
  try {
    if (!d) return 'N/A';
    const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (Number.isNaN(dt?.getTime?.())) return 'N/A';
    return dt.toLocaleDateString();
  } catch {
    return 'N/A';
  }
}

const GlobalAdminAnalyticsPop = ({ isOpen, onClose, data, loading }) => {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const title = data?.info?.title || '';
  const contentType = (data?.info?.contentType || '').toLowerCase();
  const headerTitle = useMemo(() => {
    switch (contentType) {
      case 'assessment':
        return 'Assessment Analytics';
      case 'survey':
        return 'Survey Analytics';
      case 'module':
      default:
        return 'Module Analytics';
    }
  }, [contentType]);
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState('desc'); // sort by Assigned On
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [isOpen, rows.length]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const sortedRows = useMemo(() => {
    const getTs = (v) => {
      if (!v) return 0;
      const d = new Date(v);
      const t = d.getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = getTs(a.assignedOn);
      const bv = getTs(b.assignedOn);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return copy;
  }, [rows, sortDir]);
  const currentRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return sortedRows.slice(start, end);
  }, [sortedRows, page]);

  const contentIcon = useMemo(() => {
    switch (contentType) {
      case 'assessment':
        return <ClipboardCheck size={16} />;
      case 'survey':
        return <FileText size={16} />;
      case 'module':
      default:
        return <BookOpen size={16} />;
    }
  }, [contentType]);

  const exportToCSV = () => {
    if (!rows.length) return;
    const headers = [
      'Organization Name',
      'Type of Content',
      'Name of Resource',
      'Assigned On',
      'Assigned By',
    ];
    const csvLines = rows.map(r => {
      const displayType = data?.info?.contentType || r.contentType || 'Module';
      return [
        r.organizationName || '',
        displayType,
        r.resourceName || '',
        formatDate(r.assignedOn),
        r.assignedBy || '',
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...csvLines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `global-admin-content-organizations-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const getBadgeClass = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'module') return 'type-course'; // align with existing CSS
    if (t === 'assessment') return 'type-assessment';
    if (t === 'survey') return 'type-survey';
    return 'type-course';
  };

  return (
    <div className="analytics-modal-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-modal-header">
          <div>
            <h2 className="analytics-modal-title">{headerTitle}</h2>
            <p className="analytics-modal-subtitle" title={title}>
              {contentIcon} <span style={{ marginLeft: 6 }}>{title || 'Content'}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="analytics-export-btn" 
              onClick={exportToCSV}
              disabled={rows.length === 0 || loading}
            >
              <Download size={16} />
              Export CSV
            </button>
            <button className="analytics-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="analytics-modal-body">
          {loading ? (
            <div className="analytics-loading">
              <div className="analytics-loading-spinner"></div>
              <span>Loading assignments...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="analytics-empty-state">
              <div className="analytics-empty-icon">
                {contentIcon}
              </div>
              <h3 className="analytics-empty-title">No Assignments Found</h3>
              <p className="analytics-empty-description">
                This content has not been assigned to any organizations yet.
              </p>
            </div>
          ) : (
            <div className="analytics-table-container">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Type of Content</th>
                    <th>Name of Resource</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
                      Assigned On {sortDir === 'asc' ? '▲' : '▼'}
                    </th>
                    <th>Assigned By</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((r, idx) => {
                    const displayType = data?.info?.contentType || r.contentType || 'Module';
                    return (
                    <tr key={idx}>
                      <td>{r.organizationName || ''}</td>
                      <td>
                        <div className="table-content-type">
                          {contentIcon}
                          <span className={`content-type-badge ${getBadgeClass(displayType)}`}>
                            {displayType}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="resource-name" title={r.resourceName || ''}>
                          {r.resourceName || ''}
                        </div>
                      </td>
                      <td className="date-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {formatDate(r.assignedOn)}
                        </div>
                      </td>
                      <td className="assigned-by">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} />
                          {r.assignedBy || ''}
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 ,marginBottom: 12}}>
                {/* <div style={{ color: '#6b7280', fontSize: 12 }}>
                  {rows.length > 0 && (
                    <span>
                      Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, rows.length)} of {rows.length}
                    </span>
                  )}
                </div> */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="nav-analytics-export-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    style={{ padding: '6px 10px' }}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: 14, color: 'black' }}>Page {page} of {totalPages}</span>
                  <button
                    className="nav-analytics-export-btn"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    style={{ padding: '6px 10px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalAdminAnalyticsPop;
