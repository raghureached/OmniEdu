import React from 'react';
import { AlertCircle, Download, X } from 'lucide-react';
import './FailedImportModal.css';

const FailedImportModal = ({
    open,
    failedRows = [],
    successCount = 0,
    onClose,
    onDownload,
    columns = []

}) => {
    if (!open) return null;

    const totalFailed = failedRows.length;
    const totalProcessed = successCount + totalFailed;

    return (
        <div
            className="failed-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="failed-modal-title"
        >
            <div
                className="failed-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="failed-modal-close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                <div className="failed-modal-icon">
                    <AlertCircle size={28} />
                </div>

                <h2 id="failed-modal-title" className="failed-modal-title">
                    Import Completed with Issues
                </h2>

                <div className="failed-modal-stats">
                    <div className="stat-card stat-success">
                        <div className="stat-value">{successCount}</div>
                        <div className="stat-label">Successful</div>
                    </div>
                    <div className="stat-card stat-failed">
                        <div className="stat-value">{totalFailed}</div>
                        <div className="stat-label">Failed</div>
                    </div>
                    <div className="stat-card stat-total">
                        <div className="stat-value">{totalProcessed}</div>
                        <div className="stat-label">Total Processed</div>
                    </div>
                </div>

                <div className="failed-modal-message">
                    <p>
                        {totalFailed} {totalFailed === 1 ? 'row' : 'rows'} failed to import.
                        You can download the failed records to review and fix the issues.
                    </p>
                </div>

                {/* Dynamic Table */}
                {columns.length > 0 && (
                    <div className="failed-rows-preview">
                        <h3 className="preview-title">Failed Rows Preview </h3>
                        <div className="preview-table-container">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        {columns.map((col) => (
                                            <th key={col.key}>{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {failedRows.slice(0, 5).map((row, index) => (
                                        <tr key={index}>
                                            {columns.map((col) => (
                                                <td key={col.key}>
                                                    {col.key === "reason" ? (
                                                        <span className="reason-badge">
                                                            {row[col.key] || "Unknown error"}
                                                        </span>
                                                    ) : (
                                                        row[col.key] || "—"
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {failedRows.length > 5 && (
                            <p className="preview-note">
                                ...and {failedRows.length - 5} more failed {failedRows.length - 5 === 1 ? 'row' : 'rows'}
                            </p>)}
                    </div>
                )}
                <div className="failed-modal-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        type="button"
                    >
                        Close
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onDownload}
                        type="button"
                    >
                        <Download size={18} />
                        {columns.length > 3?"Download Failed Users":"Download Failed Groups"} 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FailedImportModal;