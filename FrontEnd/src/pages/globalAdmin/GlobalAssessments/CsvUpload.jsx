import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { parseEnhancedCSVWithValidation, downloadEnhancedSampleCSV } from '../../../utils/enhancedCsvValidation.js';

const CsvUpload = ({ onQuestionsUpload, disabled = false }) => {
    const [dragActive, setDragActive] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [showFullErrors, setShowFullErrors] = useState(false);
    const fileInputRef = useRef(null);

    const downloadSampleCSV = () => {
        // Use the enhanced sample CSV format
        downloadEnhancedSampleCSV();
    };

    // Helper functions for error display
    const getErrorDetails = (errorText) => {
        if (!errorText.includes('\n\n')) return { title: errorText, details: '', errorLines: [] };

        const parts = errorText.split('\n\n');
        const title = parts[0];
        const details = parts[1];
        const errorLines = details.split('\n').filter(line => line.trim() !== '');

        return { title, details, errorLines };
    };

    const formatErrorsForDisplay = (errorLines, showAll = false) => {
        if (!errorLines.length) return '';

        const maxInitialErrors = 3;
        const errorsToShow = showAll ? errorLines : errorLines.slice(0, maxInitialErrors);
        const remainingCount = errorLines.length - maxInitialErrors;

        let formattedErrors = errorsToShow.join('\n');

        if (!showAll && remainingCount > 0) {
            formattedErrors += `\n\n... and ${remainingCount} more error${remainingCount > 1 ? 's' : ''}`;
        }

        return formattedErrors;
    };

    const parseCSV = (csvText) => {
        // Use the enhanced CSV validation
        const result = parseEnhancedCSVWithValidation(csvText);

      
        if (result.hasErrors) {
            throw new Error(`CSV validation errors: ${result.errors.join('\n')}`);
        }

        return result.questions;
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            setError(`❌ Upload Failed: ${file.name}\n\nError: Please upload a CSV file`);
            // Don't set uploaded file name on file type error
            return;
        }

        // Set file name immediately when file is selected
        setUploadedFileName(file.name);
        // Clear any previous messages
        setError('');
        setSuccess('');

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const questions = parseCSV(csvText);

                // Store the uploaded file name only on success
                // setUploadedFileName(file.name); // Already set when file was selected
                setSuccess(`✅ Successfully parsed ${questions.length} questions from ${file.name}`);
                setError('');

                if (onQuestionsUpload) {
                    onQuestionsUpload(questions);
                }

                // Removed auto-clear timeout - success message stays until user clicks X

            } catch (err) {
                // Enhanced error handling for CSV validation errors
                const errorMessage = err.message;

                // Clear uploaded file name on validation error
                setUploadedFileName('');

                // Check if it's a CSV validation error
                if (errorMessage.includes('CSV validation errors:')) {
                    const validationErrors = errorMessage.replace('CSV validation errors: ', '');
                    setError(`❌ Upload Failed: ${file.name}\n\nValidation Errors:\n${validationErrors}`);
                } else {
                    setError(`❌ Upload Failed: ${file.name}\n\nError: ${errorMessage}`);
                }

                setSuccess('');
                // Don't call onQuestionsUpload for failed uploads
            }
        };

        reader.onerror = () => {
            setError(`❌ Upload Failed: ${file.name}\n\nError: Error reading file`);
            // Clear uploaded file name on read error
            setUploadedFileName('');
            setSuccess('');
        };

        reader.readAsText(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileUpload(files[0]);
            // Reset the file input after handling dropped file
            // This allows selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
            // Reset the file input immediately after handling the file
            // This allows selecting the same file again
            e.target.value = '';
        }
    };

    const resetUpload = () => {
        setError('');
        setSuccess('');
        setUploadedFileName('');
        setShowFullErrors(false); // Reset to collapsed state for next upload
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const dismissSuccess = () => {
        setSuccess('');
    };

    const dismissError = () => {
        setError('');
        setShowFullErrors(false); // Reset to collapsed state for next error
    };

    return (
        <div className="csv-upload-container">
            <div className="csv-upload-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} />
                    <h3>Upload Questions from CSV</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={downloadSampleCSV}
                        title="Download sample CSV format"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            fontSize: '14px'
                        }}
                    >
                        <Download size={16} />
                        Format
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowHelp(!showHelp)}
                        title={showHelp ? "Hide CSV format help" : "Show CSV format help"}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            fontSize: '14px'
                        }}
                    >
                        {showHelp ? "✕" : "?"}
                        <span style={{ fontSize: '14px' }}>
                            {showHelp ? "Close" : "Help"}
                        </span>
                    </button>
                </div>
            </div>

            <div
                className={`csv-upload-dropzone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileInputChange}
                    disabled={disabled}
                    style={{ display: 'none' }}
                    id="csv-file-input"
                />

                <div className="csv-upload-content">
                    <Upload size={32} className="csv-upload-icon" />
                    <div className="csv-upload-text">
                        <p>Drag and drop your CSV file here, or click to browse</p>
                        {/* <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Supported format: question_text, type, option1, option2, ..., correct_option
                        </p> */}
                    </div>
                    <label htmlFor="csv-file-input" className="btn-primary" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
                        Browse Files
                    </label>

                    {/* Display uploaded file name inside dropzone */}
                    { uploadedFileName && (
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #0ea5e9',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}>
                            <FileText size={14} style={{ color: '#0ea5e9' }} />
                            <span style={{ fontSize: '13px', color: '#0c4a6e', fontWeight: '500' }}>
                                Uploaded: {uploadedFileName}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {error && (() => {
                const { title, errorLines } = getErrorDetails(error);
                const shouldShowMoreButton = errorLines.length > 3;
                const displayErrors = formatErrorsForDisplay(errorLines, showFullErrors);

                return (
                    <div className="csv-upload-error" style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #f87171',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '16px',
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#dc2626',
                                    marginBottom: '8px',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {title}
                                </div>
                                {displayErrors && (
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#7f1d1d',
                                        backgroundColor: '#fef2f2',
                                        padding: '12px',
                                        whiteSpace: 'pre-line',
                                        fontFamily: 'monospace',
                                        // borderRadius: '4px',
                                        // border: '1px solid #fecaca'
                                    }}>
                                        {displayErrors}
                                    </div>
                                )}
                                {shouldShowMoreButton && (
                                    <div >
                                        <button
                                            type="button"
                                            onClick={() => setShowFullErrors(!showFullErrors)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#dc2626',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                        >
                                            {showFullErrors ? (
                                                <>
                                                    <ChevronUp size={14} />
                                                    Show Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown size={14} />
                                                    Show More 
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={dismissError}
                                className="csv-upload-error-close"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    zIndex: 10
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                );
            })()}

            {success && (
                <div className="csv-upload-success" style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #4ade80',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                            style={{ marginTop: '2px', flexShrink: 0 }}
                        >
                            <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#15803d',
                            whiteSpace: 'pre-line',
                            flex: 1
                        }}>
                            {success}
                        </div>
                        <button
                            type="button"
                            onClick={dismissSuccess}
                            className="csv-upload-success-close"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#22c55e',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                zIndex: 10
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="csv-upload-help" style={{ display: showHelp ? 'block' : 'none' }}>
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e' }}>
                        <strong>💡 Quick Start:</strong> Click the "Format" button above to download a sample CSV file with the correct format and examples!
                    </p>
                </div>
                <h4>Enhanced CSV Format Requirements:</h4>
                <div className="csv-upload-example">
                    <code>
                        question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5<br/>
                        What is 2+2?,Multiple Choice,2,3,4,5,,,,C,,<br/>
                        Select all even numbers,Multi Select,1,2,3,4,5,,B,,D,,
                    </code>
                </div>
                <p><strong>Required Columns:</strong></p>
                <ul>
                    <li><strong>question_text:</strong> The question text (required)</li>
                    <li><strong>type:</strong> "Multiple Choice" or "Multi Select" (required)</li>
                    <li><strong>option1-option5:</strong> Answer choices (minimum 2, maximum 5)</li>
                    <li><strong>correct_option1-correct_option5:</strong> Correct answer(s) using letters A-E only (e.g., A, B, C, D, E)</li>
                </ul>
                <p><strong>Format Rules:</strong></p>
                <ul>
                    <li><strong>Minimum:</strong> 2 options per question (option1, option2)</li>
                    <li><strong>Maximum:</strong> 5 options per question (option1-option5)</li>
                    <li><strong>Correct Options:</strong> Use A-E for single answers, A-E for multiple answers (one letter per correct_option column)</li>
                    <li><strong>Numbers not allowed:</strong> Only letters A-E are accepted in correct_option columns</li>
                    <li><strong>Empty cells:</strong> Leave correct_option columns empty for incorrect options</li>
                    <li><strong>No gaps in options:</strong> Empty options are only allowed at the end (e.g., Berlin,Paris,Madrid,,, ✅ but Berlin,,Madrid,,, ❌)</li>
                    <li><strong>No quotes needed:</strong> Plain text format works best</li>
                </ul>
            </div>
        </div>
    );
};

export default CsvUpload;
