/**
 * CSV Validation and Testing Utilities
 * Enhanced CSV parsing and validation for assessment questions
 */

export const CSV_VALIDATION = {
    REQUIRED_HEADERS: ['question_text', 'type'],
    OPTIONAL_HEADERS: ['option1', 'option2', 'option3', 'option4', 'option5', 'correct_option'],
    SUPPORTED_TYPES: ['Multiple Choice', 'Multi Select'],
    MIN_OPTIONS: 2,
    MAX_OPTIONS: 5,
    MAX_QUESTION_LENGTH: 500,
    MAX_OPTION_LENGTH: 100,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_EXTENSIONS: ['.csv', '.txt']
};

/**
 * Enhanced CSV parsing with detailed error reporting
 */
export const parseCSVWithValidation = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const missingHeaders = CSV_VALIDATION.REQUIRED_HEADERS.filter(req => !headers.includes(req));

    if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    const questions = [];
    const errors = [];
    const warnings = [];

    for (let i = 1; i < lines.length; i++) {
        const rowNumber = i + 1;
        const values = lines[i].split(',').map(v => v.trim());
        const question = {};
        let hasErrors = false;

        // Map headers to values
        headers.forEach((header, index) => {
            const value = values[index] || '';
            if (header === 'question_text') {
                question.question_text = value;
                if (!value) {
                    errors.push(`Row ${rowNumber}: Question text is required`);
                    hasErrors = true;
                } else if (value.length > CSV_VALIDATION.MAX_QUESTION_LENGTH) {
                    errors.push(`Row ${rowNumber}: Question text exceeds ${CSV_VALIDATION.MAX_QUESTION_LENGTH} characters`);
                    hasErrors = true;
                }
            } else if (header === 'type') {
                question.type = value || 'Multiple Choice';
                if (!CSV_VALIDATION.SUPPORTED_TYPES.includes(question.type)) {
                    errors.push(`Row ${rowNumber}: Invalid question type "${question.type}". Supported types: ${CSV_VALIDATION.SUPPORTED_TYPES.join(', ')}`);
                    hasErrors = true;
                }
            } else if (header.startsWith('option')) {
                const optionIndex = parseInt(header.replace('option', '')) - 1;
                if (!question.options) question.options = [];
                question.options[optionIndex] = value;

                if (value && value.length > CSV_VALIDATION.MAX_OPTION_LENGTH) {
                    warnings.push(`Row ${rowNumber}: Option ${optionIndex + 1} exceeds ${CSV_VALIDATION.MAX_OPTION_LENGTH} characters`);
                }
            } else if (header === 'correct_option') {
                question.correct_option = parseCorrectOption(value, question.options || []);
            }
        });

        // Validate options for choice-based questions
        if (question.type === 'Multiple Choice' || question.type === 'Multi Select') {
            const validOptions = (question.options || []).filter(opt => opt && opt.trim()).length;

            if (validOptions < CSV_VALIDATION.MIN_OPTIONS) {
                errors.push(`Row ${rowNumber}: Need at least ${CSV_VALIDATION.MIN_OPTIONS} options for ${question.type} questions`);
                hasErrors = true;
            } else if (validOptions > CSV_VALIDATION.MAX_OPTIONS) {
                errors.push(`Row ${rowNumber}: Maximum ${CSV_VALIDATION.MAX_OPTIONS} options allowed`);
                hasErrors = true;
            }

            if (!question.correct_option || question.correct_option === '') {
                errors.push(`Row ${rowNumber}: Correct answer is required`);
                hasErrors = true;
            }
        }

        if (!hasErrors && question.question_text && question.question_text.trim()) {
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
 * Parse correct option from CSV value
 */
const parseCorrectOption = (value, options) => {
    if (!value || !value.trim()) return '';

    const correctValue = value.toUpperCase().trim();
    const validOptions = options.filter(opt => opt && opt.trim()).length;

    // Handle comma-separated values for multi-select
    if (correctValue.includes(',')) {
        const parts = correctValue.split(',').map(s => s.trim());
        const indices = [];

        for (const part of parts) {
            if (/^[A-Z]$/.test(part)) {
                const index = part.charCodeAt(0) - 65;
                if (index >= 0 && index < validOptions) {
                    indices.push(index);
                }
            } else if (/^\d+$/.test(part)) {
                const index = parseInt(part) - 1;
                if (index >= 0 && index < validOptions) {
                    indices.push(index);
                }
            }
        }

        return indices.length > 0 ? indices : '';
    } else if (/^[A-Z]$/.test(correctValue)) {
        const index = correctValue.charCodeAt(0) - 65;
        return index >= 0 && index < validOptions ? index : '';
    } else if (/^\d+$/.test(correctValue)) {
        const index = parseInt(correctValue) - 1;
        return index >= 0 && index < validOptions ? index : '';
    }

    return '';
};

/**
 * Generate sample CSV content
 */
export const generateSampleCSV = () => {
    const sampleData = [
        ['question_text', 'type', 'option1', 'option2', 'option3', 'option4', 'option5', 'correct_option'],
        ['What is 2 + 2?', 'Multiple Choice', '2', '3', '4', '5', '', 'A'],
        ['Select all even numbers', 'Multi Select', '1', '2', '3', '4', '5', 'B,D'],
        ['What is the capital of France?', 'Multiple Choice', 'London', 'Berlin', 'Paris', 'Madrid', '', 'C'],
        ['Which are primary colors?', 'Multi Select', 'Red', 'Green', 'Blue', 'Yellow', 'Purple', 'A,C,D'],
        ['What year was the first computer invented?', 'Multiple Choice', '1822', '1943', '1957', '1975', '', 'B'],
        ['Select all programming languages', 'Multi Select', 'Java', 'HTML', 'Python', 'CSS', 'JavaScript', 'A,C,E']
    ];

    return sampleData.map(row =>
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
};

/**
 * Download sample CSV file
 */
export const downloadSampleCSV = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'assessment_questions_format.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
    const errors = [];

    // Check file extension
    if (!CSV_VALIDATION.SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
        errors.push(`Unsupported file type. Please upload ${CSV_VALIDATION.SUPPORTED_EXTENSIONS.join(' or ')} files.`);
    }

    // Check file size
    if (file.size > CSV_VALIDATION.MAX_FILE_SIZE) {
        errors.push(`File size exceeds ${CSV_VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Test scenarios for validation
 */
export const runTestScenarios = () => {
    console.log('🧪 Running CSV Validation Test Scenarios...\n');

    const testCSVs = {
        // Ex 1: Multiple Choice - no answer mentioned
        'Ex 1 - Multiple Choice (no answer)': `question_text,type,option1,option2,option3,option4,correct_option
What is 2+2?,Multiple Choice,2,3,4,5,`,

        // Ex 2: Multiple Choice - 2 answer options mentioned
        'Ex 2 - Multiple Choice (2 options)': `question_text,type,option1,option2,correct_option
What is 2+2?,Multiple Choice,2,4,A`,

        // Ex 3: Multi Select - Only one answer mentioned
        'Ex 3 - Multi Select (1 answer)': `question_text,type,option1,option2,option3,option4,correct_option
Select even numbers,Multi Select,1,2,3,4,B`,

        // Ex 4: Multi Select - No answer mentioned
        'Ex 4 - Multi Select (no answer)': `question_text,type,option1,option2,option3,option4,correct_option
Select even numbers,Multi Select,1,2,3,4,`,

        // Ex 5: Multi Select - Only two options mentioned
        'Ex 5 - Multi Select (2 options)': `question_text,type,option1,option2,correct_option
Select even numbers,Multi Select,1,2,B`,

        // Valid CSV
        'Valid CSV': `question_text,type,option1,option2,option3,option4,correct_option
What is 2+2?,Multiple Choice,2,3,4,5,A
Select even numbers,Multi Select,1,2,3,4,B,D`
    };

    Object.entries(testCSVs).forEach(([scenario, csvContent]) => {
        console.log(`\n📋 Testing: ${scenario}`);
        try {
            const result = parseCSVWithValidation(csvContent);

            if (result.hasErrors) {
                console.log('❌ FAILED - Validation errors found:');
                result.errors.forEach(error => console.log(`   - ${error}`));
            } else {
                console.log(`✅ PASSED - ${result.validQuestions} valid questions parsed`);
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
    const limits = CSV_VALIDATION;

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
    CSV_VALIDATION,
    parseCSVWithValidation,
    generateSampleCSV,
    downloadSampleCSV,
    validateFile,
    runTestScenarios
};
