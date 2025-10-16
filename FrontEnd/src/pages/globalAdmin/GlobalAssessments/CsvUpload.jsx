import React, { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import './CsvUpload.css';

const CsvUpload = ({ onQuestionsUpload, disabled = false }) => {
    const [dragActive, setDragActive] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Expected headers
        const expectedHeaders = ['question_text', 'type', 'option1', 'option2', 'option3', 'option4', 'option5', 'correct_option'];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        // Check if required headers are present
        const requiredHeaders = ['question_text', 'type'];
        const missingHeaders = requiredHeaders.filter(req => !headers.includes(req));

        if (missingHeaders.length > 0) {
            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
        }

        const questions = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) {
                // Pad with empty strings if needed
                while (values.length < headers.length) {
                    values.push('');
                }
            }

            const question = {};

            // Debug: Log each row being parsed
            console.log(`Parsing row ${i}:`, { headers, values });

            headers.forEach((header, index) => {
                if (expectedHeaders.includes(header)) {
                    const value = values[index] || '';

                    if (header === 'question_text') {
                        question.question_text = value;
                    } else if (header === 'type') {
                        question.type = value || 'Multiple Choice';
                        console.log(`Setting type to: ${question.type}`);
                    } else if (header.startsWith('option')) {
                        const optionIndex = parseInt(header.replace('option', '')) - 1;
                        if (!question.options) question.options = [];
                        question.options[optionIndex] = value;
                    } else if (header === 'correct_option') {
                        // Parse correct option - could be letter (A,B,C) or number (1,2,3)
                        const correctValue = value.toUpperCase().trim();

                        // Handle comma-separated values for multi-select (e.g., "A,B" or "1,2")
                        if (correctValue.includes(',')) {
                            const parts = correctValue.split(',').map(s => s.trim());
                            const indices = [];

                            for (const part of parts) {
                                if (/^[A-Z]$/.test(part)) {
                                    // Convert letter to number (A=0, B=1, etc.)
                                    indices.push(part.charCodeAt(0) - 65);
                                } else if (/^\d+$/.test(part)) {
                                    // Use number directly (0-based)
                                    indices.push(parseInt(part) - 1);
                                }
                            }

                            question.correct_option = indices.length > 0 ? indices : [];
                        } else if (/^[A-Z]$/.test(correctValue)) {
                            // Single letter (A=0, B=1, etc.)
                            question.correct_option = correctValue.charCodeAt(0) - 65;
                        } else if (/^\d+$/.test(correctValue)) {
                            // Single number (0-based)
                            question.correct_option = parseInt(correctValue) - 1;
                        } else {
                            question.correct_option = '';
                        }
                    }
                }
            });

            // Debug: Log the parsed question object
            console.log(`Parsed question ${i}:`, question);

            // Validate question
            if (question.question_text && question.question_text.trim()) {
                // Ensure we have at least 2 options
                if (!question.options || question.options.filter(opt => opt && opt.trim()).length < 2) {
                    question.options = question.options || [];
                    while (question.options.filter(opt => opt && opt.trim()).length < 2) {
                        question.options.push('');
                    }
                }

                // Default type if not specified
                if (!question.type) {
                    question.type = 'Multiple Choice';
                }

                questions.push(question);
            }
        }

        if (questions.length === 0) {
            throw new Error('No valid questions found in CSV');
        }

        console.log('Final parsed questions:', questions);
        return questions;
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
            setError('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                const questions = parseCSV(csvText);

                setSuccess(`Successfully parsed ${questions.length} questions from CSV`);
                setError('');

                if (onQuestionsUpload) {
                    onQuestionsUpload(questions);
                }

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);

            } catch (err) {
                setError(err.message);
                setSuccess('');
            }
        };

        reader.onerror = () => {
            setError('Error reading file');
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
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const resetUpload = () => {
        setError('');
        setSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="csv-upload-container">
            <div className="csv-upload-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} />
                    <h3>Upload Questions from CSV</h3>
                </div>
                <button
                    type="button"
                    className="csv-upload-info"
                    onClick={() => setShowHelp(!showHelp)}
                    title={showHelp ? "Hide CSV format help" : "Show CSV format help"}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: '80px',
                        justifyContent: 'center'
                    }}
                >
                    {showHelp ? "✕" : "?"}
                    <span style={{ fontSize: '14px' }}>
                        {showHelp ? "Close" : "Help"}
                    </span>
                </button>
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
                </div>
            </div>

            {error && (
                <div className="csv-upload-error">
                    <X size={16} />
                    <span>{error}</span>
                    <button type="button" onClick={resetUpload} className="csv-upload-error-close">
                        <X size={14} />
                    </button>
                </div>
            )}

            {success && (
                <div className="csv-upload-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    <span>{success}</span>
                    <button type="button" onClick={resetUpload} className="csv-upload-success-close">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="csv-upload-help" style={{ display: showHelp ? 'block' : 'none' }}>
                <h4>CSV Format Requirements:</h4>
                <div className="csv-upload-example">
                    <code>
                        question_text,type,option1,option2,option3,option4,correct_option<br/>
                        What is 2+2?,Multiple Choice,2,3,4,5,A<br/>
                        Select all even numbers,Multi Select,1,2,3,4,A,B
                    </code>
                </div>
                <p><strong>Required Columns:</strong></p>
                <ul>
                    <li><strong>question_text:</strong> The question text (required)</li>
                    <li><strong>type:</strong> "Multiple Choice" or "Multi Select" (required)</li>
                    <li><strong>option1-option4:</strong> Answer choices (minimum 2, maximum 5)</li>
                    <li><strong>correct_option:</strong> Correct answer(s) using letters A-E or comma-separated (e.g., A or A,B,C)</li>
                </ul>
                <p><strong>Format Rules:</strong></p>
                <ul>
                    <li><strong>Minimum:</strong> 2 options per question (option1, option2)</li>
                    <li><strong>Maximum:</strong> 5 options per question (option1-option5)</li>
                    <li><strong>Correct Options:</strong> Use A-E for single answers, A-E comma-separated for multiple answers</li>
                    <li><strong>No quotes needed:</strong> Plain text format works best</li>
                </ul>
            </div>
        </div>
    );
};

export default CsvUpload;
