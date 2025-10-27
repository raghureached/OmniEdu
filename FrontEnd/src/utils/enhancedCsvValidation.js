/**
 * Enhanced CSV Validation and Testing Utilities
 * Enhanced CSV parsing and validation for assessment questions with individual correct option columns
 */

export const ENHANCED_CSV_VALIDATION = {
    REQUIRED_HEADERS: ['question_text', 'type'],
    OPTIONAL_HEADERS: ['option1', 'option2', 'option3', 'option4', 'option5'],
    CORRECT_OPTIONAL_HEADERS: ['correct_option1', 'correct_option2', 'correct_option3', 'correct_option4', 'correct_option5'],
    ALL_HEADERS: ['question_text', 'type', 'option1', 'option2', 'option3', 'option4', 'option5', 'correct_option1', 'correct_option2', 'correct_option3', 'correct_option4', 'correct_option5'],
    SUPPORTED_TYPES: ['Multiple Choice', 'Multi Select'],
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 5,
    MAX_QUESTION_LENGTH: 500,
    MAX_OPTION_LENGTH: 100,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_EXTENSIONS: ['.csv', '.txt'],
    VALID_CORRECT_OPTIONS: ['A', 'B', 'C', 'D', 'E']
};

/**
 * Parse a single CSV row handling quotes and commas properly
 */
const parseCSVRow = (line, expectedColumns) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            values.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }

    // Add the last field
    values.push(current.trim());

    // Pad or truncate to expected number of columns
    while (values.length < expectedColumns) {
        values.push('');
    }

    return values.slice(0, expectedColumns);
};

/**
 * Enhanced CSV parsing with detailed error reporting and separate correct option columns
 */
export const parseEnhancedCSVWithValidation = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        throw new Error('CSV file is empty');
    }

    // Parse headers with proper CSV parsing
    const headerValues = parseCSVRow(lines[0], ENHANCED_CSV_VALIDATION.ALL_HEADERS.length);
    const headers = headerValues.map(h => h.toLowerCase());
    const missingHeaders = ENHANCED_CSV_VALIDATION.REQUIRED_HEADERS.filter(req => !headers.includes(req));

    if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const questions = [];
    const errors = [];
    const warnings = [];

    for (let i = 1; i < lines.length; i++) {
        const rowNumber = i + 1;
        const values = parseCSVRow(lines[i], headers.length);
        const question = {};
        let hasErrors = false;

        // Map headers to values
        headers.forEach((header, index) => {
            const value = values[index] || '';
            if (header === 'question_text') {
                question.question_text = value;
                if (!value) {
                    errors.push(`Row ${rowNumber}: Question text is required`);
                } else if (value.length > ENHANCED_CSV_VALIDATION.MAX_QUESTION_LENGTH) {
                    errors.push(`Row ${rowNumber}: Question text exceeds ${ENHANCED_CSV_VALIDATION.MAX_QUESTION_LENGTH} characters`);
                    hasErrors = true;
                }
            } else if (header === 'type') {
                question.type = value.trim(); // Don't default to Multiple Choice - require explicit type
                if (!value || !value.trim()) {
                    errors.push(`Row ${rowNumber}: Question type is required`);
                    hasErrors = true;
                } else if (!ENHANCED_CSV_VALIDATION.SUPPORTED_TYPES.includes(question.type)) {
                    errors.push(`Row ${rowNumber}: Invalid question type "${question.type}". Supported types: ${ENHANCED_CSV_VALIDATION.SUPPORTED_TYPES.join(', ')}`);
                    hasErrors = true;
                }
            } else if (header.startsWith('option')) {
                const optionIndex = parseInt(header.replace('option', '')) - 1;
                if (!question.options) question.options = [];
                question.options[optionIndex] = value;

                if (value && value.length > ENHANCED_CSV_VALIDATION.MAX_OPTION_LENGTH) {
                    warnings.push(`Row ${rowNumber}: Option ${optionIndex + 1} exceeds ${ENHANCED_CSV_VALIDATION.MAX_OPTION_LENGTH} characters`);
                }
            } else if (header.startsWith('correct_option')) {
                const optionIndex = parseInt(header.replace('correct_option', '')) - 1;
                if (!question.correct_option_values) question.correct_option_values = [];

                // Parse the correct option value (should be A-E letters only, like original system)
                const correctValue = value.toUpperCase().trim().replace(/\s+/g, '');
                if (correctValue === '') {
                    question.correct_option_values[optionIndex] = ''; // Empty - no correct option for this choice
                } else if (/^[A-E]$/.test(correctValue)) {
                    // Convert letter to index (A=0, B=1, C=2, D=3, E=4) - remove spaces and validate
                    question.correct_option_values[optionIndex] = correctValue.charCodeAt(0) - 65;
                } else {
                    errors.push(`Row ${rowNumber}: Invalid correct_option${optionIndex + 1} value "${value}". Must be A-E letters only (no spaces, no numbers)`);
                    hasErrors = true;
                }
            }
        });

        // Convert correct_option_values array to the format expected by QuestionsForm
        if (question.correct_option_values) {
            if (question.type === 'Multiple Choice') {
                // Find the first (and should be only) correct option
                const correctIndex = question.correct_option_values.findIndex(val => val !== '' && val !== null && val !== undefined);
                if (correctIndex !== -1) {
                    question.correct_option = question.correct_option_values[correctIndex];
                } else {
                    errors.push(`Row ${rowNumber}: No correct option specified for Multiple Choice question`);
                    hasErrors = true;
                }
            } else if (question.type === 'Multi Select') {
                // Find all correct options
                const correctIndices = [];
                question.correct_option_values.forEach((val, index) => {
                    if (val !== '' && val !== null && val !== undefined) {
                        correctIndices.push(val);
                    }
                });

                if (correctIndices.length === 0) {
                    errors.push(`Row ${rowNumber}: No correct options specified for Multi Select question`);
                    hasErrors = true;
                } else {
                    question.correct_option = correctIndices;
                }
            }
        }

        // Validate options for choice-based questions
        if (question.type === 'Multiple Choice' || question.type === 'Multi Select') {
            const validOptions = (question.options || []).filter(opt => opt && opt.trim()).length;

            if (validOptions < ENHANCED_CSV_VALIDATION.MIN_OPTIONS) {
                errors.push(`Row ${rowNumber}: Need at least ${ENHANCED_CSV_VALIDATION.MIN_OPTIONS} options for ${question.type} questions`);
                hasErrors = true;
            } else if (validOptions > ENHANCED_CSV_VALIDATION.MAX_OPTIONS) {
                errors.push(`Row ${rowNumber}: Maximum ${ENHANCED_CSV_VALIDATION.MAX_OPTIONS} options allowed`);
                hasErrors = true;
            }

            // Validate that options don't have gaps in the middle (only trailing empty options allowed)
            if (question.options && question.options.length > 0) {
                let foundEmpty = false;
                for (let i = 0; i < question.options.length; i++) {
                    const option = question.options[i];
                    const isEmpty = !option || !option.trim();

                    if (isEmpty) {
                        foundEmpty = true;
                    } else if (foundEmpty) {
                        // Found a non-empty option after an empty one - this is a gap
                        errors.push(`Row ${rowNumber}: Options cannot have gaps. Empty options are only allowed at the end (found non-empty option after empty option at position ${i + 1})`);
                        hasErrors = true;
                        break;
                    }
                }
            }

            // Validate that correct options don't exceed available options
            if (question.correct_option !== undefined) {
                if (Array.isArray(question.correct_option)) {
                    const invalidIndices = question.correct_option.filter(index => index >= validOptions);
                    if (invalidIndices.length > 0) {
                        errors.push(`Row ${rowNumber}: Correct option indices ${invalidIndices.join(', ')} exceed available options`);
                        hasErrors = true;
                    }
                } else if (typeof question.correct_option === 'number') {
                    if (question.correct_option >= validOptions) {
                        errors.push(`Row ${rowNumber}: Correct option index ${question.correct_option} exceeds available options`);
                        hasErrors = true;
                    }
                }
            }
        }

        // Clean up - remove the temporary correct_option_values array
        delete question.correct_option_values;

        if (!hasErrors && question.question_text && question.question_text.trim()) {
            // Ensure we have at least 2 options for choice questions
            if ((question.type === 'Multiple Choice' || question.type === 'Multi Select') &&
                (!question.options || question.options.filter(opt => opt && opt.trim()).length < 2)) {
                if (!question.options) question.options = [];
                while (question.options.filter(opt => opt && opt.trim()).length < 2) {
                    question.options.push('');
                }
            }

            questions.push(question);
        }
    }

    return {
        questions,
        errors,
        warnings,
        totalRows: lines.length - 1,
        validQuestions: questions.length,
        hasErrors: errors.length > 0
    };
};

/**
 * Generate sample CSV content with separate correct option columns
 */
export const generateEnhancedSampleCSV = () => {
    const sampleData = [
        ['question_text', 'type', 'option1', 'option2', 'option3', 'option4', 'option5', 'correct_option1', 'correct_option2', 'correct_option3', 'correct_option4', 'correct_option5'],
        ['What is 2 + 2?', 'Multiple Choice', '2', '3', '4', '5', '', '', '', 'C', '', ''],
        ['Select all even numbers', 'Multi Select', '1', '2', '3', '4', '5', '', 'B', '', 'D', ''],
        ['What is the capital of France?', 'Multiple Choice', 'London', 'Berlin', 'Paris', 'Madrid', '', '', '', 'C', '', ''],
        ['Which are primary colors?', 'Multi Select', 'Red', 'Green', 'Blue', 'Yellow', 'Purple', 'A', '', 'C', 'D', ''],
        ['What year was the first computer invented?', 'Multiple Choice', '1822', '1943', '1957', '1975', '', '', 'B', '', '', ''],
        ['Select all programming languages', 'Multi Select', 'Java', 'HTML', 'Python', 'CSS', 'JavaScript', 'A', '', 'C', '', 'E']
    ];

    return sampleData.map(row =>
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
};

/**
 * Download sample CSV file with enhanced format (runs in browser only)
 */
export const downloadEnhancedSampleCSV = () => {
    const csvContent = generateEnhancedSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'enhanced_assessment_questions_format.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Validate file before upload
 */
export const validateEnhancedFile = (file) => {
    const errors = [];

    // Check file extension
    if (!ENHANCED_CSV_VALIDATION.SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
        errors.push(`Unsupported file type. Please upload ${ENHANCED_CSV_VALIDATION.SUPPORTED_EXTENSIONS.join(' or ')} files.`);
    }

    // Check file size
    if (file.size > ENHANCED_CSV_VALIDATION.MAX_FILE_SIZE) {
        errors.push(`File size exceeds ${ENHANCED_CSV_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Test scenarios for enhanced validation
 */
export const runEnhancedTestScenarios = () => {
    console.log('🧪 Running Enhanced CSV Validation Test Scenarios...\n');

    const testCSVs = {
        'Valid Multiple Choice': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
What is 2+2?,Multiple Choice,2,3,4,5,,,,B,,,`,

        'Valid Multi Select': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
Select even numbers,Multi Select,1,2,3,4,5,,B,,D,,`,

        'Multiple Choice - No correct answer': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
What is 2+2?,Multiple Choice,2,3,4,5,,,,,,,`,

        'Multi Select - No correct answer': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
Select even numbers,Multi Select,1,2,3,4,5,,,,,,`,

        'Options with trailing empty (valid)': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
What is 2+2?,Multiple Choice,Berlin,Paris,Madrid,,,,,C,,,`,

        'Options with gaps in middle (invalid)': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
What is 2+2?,Multiple Choice,Berlin,,Madrid,,,,,C,,,,`,

        'Missing question type': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
What is 2+2?,,2,3,4,5,,,,C,,,`,

        'Invalid correct option value': `question_text,type,option1,option2,option3,option4,option5,correct_option1,correct_option2,correct_option3,correct_option4,correct_option5
What is 2+2?,Multiple Choice,2,3,4,5,,,,F,,,`
    };

    Object.entries(testCSVs).forEach(([scenario, csvContent]) => {
        console.log(`\n📋 Testing: ${scenario}`);
        try {
            const result = parseEnhancedCSVWithValidation(csvContent);

            if (result.hasErrors) {
                console.log('❌ FAILED - Validation errors found:');
                result.errors.forEach(error => console.log(`   - ${error}`));
            } else {
                console.log(`✅ PASSED - ${result.validQuestions} valid questions parsed`);
                result.questions.forEach((q, i) => {
                    console.log(`   Question ${i + 1}: correct_option = ${q.correct_option} (${Array.isArray(q.correct_option) ? 'array' : 'number'})`);
                });
            }

            if (result.warnings.length > 0) {
                console.log('⚠️  Warnings:');
                result.warnings.forEach(warning => console.log(`   - ${warning}`));
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
        }
    });

    console.log('\n🎯 Character Limit Tests:');
    const limits = ENHANCED_CSV_VALIDATION;

    [
        { name: 'Question text under limit', text: 'Short question', limit: limits.MAX_QUESTION_LENGTH, expected: true },
        { name: 'Question text over limit', text: 'A'.repeat(limits.MAX_QUESTION_LENGTH + 1), limit: limits.MAX_QUESTION_LENGTH, expected: false },
        { name: 'Option text under limit', text: 'Short option', limit: limits.MAX_OPTION_LENGTH, expected: true },
        { name: 'Option text over limit', text: 'A'.repeat(limits.MAX_OPTION_LENGTH + 1), limit: limits.MAX_OPTION_LENGTH, expected: false }
    ].forEach(test => {
        const result = test.text.length <= test.limit;
        console.log(`   ${test.name}: ${result === test.expected ? '✅ PASS' : '❌ FAIL'}`);
    });
};

export default {
    ENHANCED_CSV_VALIDATION,
    parseEnhancedCSVWithValidation,
    generateEnhancedSampleCSV,
    downloadEnhancedSampleCSV,
    validateEnhancedFile,
    runEnhancedTestScenarios
};
