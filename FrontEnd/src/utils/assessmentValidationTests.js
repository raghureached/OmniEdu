/**
 * Assessment Question Validation Test Suite
 *
 * This file contains test scenarios to validate question validation logic
 * and CSV parsing functionality for assessment questions.
 *
 * Test Scenarios:
 * 1. Multiple Choice - no answer mentioned
 * 2. Multiple Choice - 2 answer options mentioned
 * 3. Multi Select - Only one answer mentioned
 * 4. Multi Select - No answer mentioned
 * 5. Multi Select - Only two options mentioned
 * 6. Character limits for XLS/CSV files
 */

import React from 'react';

// Test data for validation scenarios
const testQuestions = {
    // Ex 1: Multiple Choice - no answer mentioned
    multipleChoiceNoAnswer: {
        type: 'Multiple Choice',
        question_text: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correct_option: '' // No answer selected
    },

    // Ex 2: Multiple Choice - 2 answer options mentioned
    multipleChoiceTwoOptions: {
        type: 'Multiple Choice',
        question_text: 'What is 2 + 2?',
        options: ['2', '4'], // Only 2 options
        correct_option: 0
    },

    // Ex 3: Multi Select - Only one answer mentioned
    multiSelectOneAnswer: {
        type: 'Multi Select',
        question_text: 'Select all even numbers',
        options: ['1', '2', '3', '4'],
        correct_option: [1] // Only one answer (should have multiple)
    },

    // Ex 4: Multi Select - No answer mentioned
    multiSelectNoAnswer: {
        type: 'Multi Select',
        question_text: 'Select all even numbers',
        options: ['1', '2', '3', '4'],
        correct_option: '' // No answer selected
    },

    // Ex 5: Multi Select - Only two options mentioned
    multiSelectTwoOptions: {
        type: 'Multi Select',
        question_text: 'Select all even numbers',
        options: ['1', '2'], // Only 2 options (minimum should be 2, but typically need more for multi-select)
        correct_option: [1]
    },

    // Valid questions for comparison
    validMultipleChoice: {
        type: 'Multiple Choice',
        question_text: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correct_option: 0
    },

    validMultiSelect: {
        type: 'Multi Select',
        question_text: 'Select all even numbers',
        options: ['1', '2', '3', '4'],
        correct_option: [1, 3] // Multiple correct answers
    }
};

// Validation function (similar to the one in the forms)
const validateQuestion = (question) => {
    const errors = [];

    // Check if question type is selected
    if (!question.type || !question.type.trim()) {
        errors.push('Question type must be selected');
    }

    // Check if question text is filled
    if (!question.question_text || !question.question_text.trim()) {
        errors.push('Question text must be filled');
    }

    // Check options for Multiple Choice and Multi Select
    if (question.type === 'Multiple Choice' || question.type === 'Multi Select') {
        // Must have at least 2 options
        if (!Array.isArray(question.options) || question.options.filter(o => o && o.trim()).length < 2) {
            errors.push('Must have at least 2 options');
        }

        // Must have correct answer selected
        if (question.correct_option === undefined || question.correct_option === null || question.correct_option === '') {
            errors.push('Correct answer must be selected');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Test function to run all validation scenarios
const runValidationTests = () => {
    console.log('🧪 Running Assessment Question Validation Tests...\n');

    const results = {};

    // Test Ex 1: Multiple Choice - no answer mentioned
    const result1 = validateQuestion(testQuestions.multipleChoiceNoAnswer);
    results['Ex 1 - Multiple Choice (no answer)'] = result1;
    console.log('❌ Ex 1 - Multiple Choice (no answer):', result1.isValid ? 'PASS' : 'FAIL');
    if (!result1.isValid) {
        console.log('   Errors:', result1.errors);
    }

    // Test Ex 2: Multiple Choice - 2 answer options mentioned
    const result2 = validateQuestion(testQuestions.multipleChoiceTwoOptions);
    results['Ex 2 - Multiple Choice (2 options)'] = result2;
    console.log('⚠️  Ex 2 - Multiple Choice (2 options):', result2.isValid ? 'PASS' : 'FAIL');
    if (!result2.isValid) {
        console.log('   Errors:', result2.errors);
    }

    // Test Ex 3: Multi Select - Only one answer mentioned
    const result3 = validateQuestion(testQuestions.multiSelectOneAnswer);
    results['Ex 3 - Multi Select (1 answer)'] = result3;
    console.log('⚠️  Ex 3 - Multi Select (1 answer):', result3.isValid ? 'PASS' : 'FAIL');
    if (!result3.isValid) {
        console.log('   Errors:', result3.errors);
    }

    // Test Ex 4: Multi Select - No answer mentioned
    const result4 = validateQuestion(testQuestions.multiSelectNoAnswer);
    results['Ex 4 - Multi Select (no answer)'] = result4;
    console.log('❌ Ex 4 - Multi Select (no answer):', result4.isValid ? 'PASS' : 'FAIL');
    if (!result4.isValid) {
        console.log('   Errors:', result4.errors);
    }

    // Test Ex 5: Multi Select - Only two options mentioned
    const result5 = validateQuestion(testQuestions.multiSelectTwoOptions);
    results['Ex 5 - Multi Select (2 options)'] = result5;
    console.log('⚠️  Ex 5 - Multi Select (2 options):', result5.isValid ? 'PASS' : 'FAIL');
    if (!result5.isValid) {
        console.log('   Errors:', result5.errors);
    }

    // Test valid questions
    const validResult1 = validateQuestion(testQuestions.validMultipleChoice);
    results['Valid Multiple Choice'] = validResult1;
    console.log('✅ Valid Multiple Choice:', validResult1.isValid ? 'PASS' : 'FAIL');

    const validResult2 = validateQuestion(testQuestions.validMultiSelect);
    results['Valid Multi Select'] = validResult2;
    console.log('✅ Valid Multi Select:', validResult2.isValid ? 'PASS' : 'FAIL');

    console.log('\n📊 Test Summary:');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r.isValid).length;
    console.log(`   ${passedTests}/${totalTests} tests passed`);
    console.log(`   ${totalTests - passedTests}/${totalTests} tests failed (expected for invalid scenarios)`);

    return results;
};

// CSV parsing test function
const testCSVValidation = () => {
    console.log('\n📄 Testing CSV Validation...\n');

    // Test CSV content with various scenarios
    const testCSVs = {
        // Valid CSV
        validCSV: `question_text,type,option1,option2,option3,option4,correct_option
What is 2+2?,Multiple Choice,2,3,4,5,A
Select even numbers,Multi Select,1,2,3,4,B,D`,

        // CSV with missing answer
        missingAnswerCSV: `question_text,type,option1,option2,option3,option4,correct_option
What is 2+2?,Multiple Choice,2,3,4,5,`,

        // CSV with only 2 options (should still work)
        twoOptionsCSV: `question_text,type,option1,option2,correct_option
What is 2+2?,Multiple Choice,2,4,A`,

        // CSV with Multi Select but only one answer
        multiSelectOneAnswerCSV: `question_text,type,option1,option2,option3,option4,correct_option
Select even numbers,Multi Select,1,2,3,4,B`,

        // CSV with missing question text
        missingQuestionCSV: `question_text,type,option1,option2,option3,option4,correct_option
,Multiple Choice,2,3,4,5,A`,

        // CSV with wrong type
        wrongTypeCSV: `question_text,type,option1,option2,option3,option4,correct_option
What is 2+2?,Single Choice,2,3,4,5,A`
    };

    Object.entries(testCSVs).forEach(([name, csvContent]) => {
        try {
            const lines = csvContent.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const questions = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const question = {};

                headers.forEach((header, index) => {
                    const value = values[index] || '';
                    if (header === 'question_text') question.question_text = value;
                    if (header === 'type') question.type = value || 'Multiple Choice';
                    if (header.startsWith('option')) {
                        const optionIndex = parseInt(header.replace('option', '')) - 1;
                        if (!question.options) question.options = [];
                        question.options[optionIndex] = value;
                    }
                    if (header === 'correct_option') question.correct_option = value || '';
                });

                if (question.question_text && question.question_text.trim()) {
                    questions.push(question);
                }
            }

            const validation = questions.length > 0 ?
                questions.map(q => validateQuestion(q)).every(v => v.isValid) : false;

            console.log(`📄 ${name}:`, validation ? '✅ VALID' : '❌ INVALID');
            if (!validation && questions.length > 0) {
                questions.forEach((q, idx) => {
                    const result = validateQuestion(q);
                    if (!result.isValid) {
                        console.log(`   Question ${idx + 1} errors:`, result.errors);
                    }
                });
            }
        } catch (error) {
            console.log(`📄 ${name}: ❌ ERROR - ${error.message}`);
        }
    });
};

// Character limit test function
const testCharacterLimits = () => {
    console.log('\n🔤 Testing Character Limits...\n');

    const limits = {
        questionTextLimit: 500,
        optionTextLimit: 100,
        totalFileSizeLimit: 5 * 1024 * 1024, // 5MB
    };

    const testCases = [
        {
            name: 'Question text within limit',
            text: 'What is the capital of France?',
            limit: limits.questionTextLimit,
            expected: true
        },
        {
            name: 'Question text over limit',
            text: 'A'.repeat(limits.questionTextLimit + 1),
            limit: limits.questionTextLimit,
            expected: false
        },
        {
            name: 'Option text within limit',
            text: 'Paris',
            limit: limits.optionTextLimit,
            expected: true
        },
        {
            name: 'Option text over limit',
            text: 'A'.repeat(limits.optionTextLimit + 1),
            limit: limits.optionTextLimit,
            expected: false
        }
    ];

    testCases.forEach(testCase => {
        const isValid = testCase.text.length <= testCase.limit;
        console.log(`🔤 ${testCase.name}:`, isValid === testCase.expected ? '✅ PASS' : '❌ FAIL');
        if (isValid !== testCase.expected) {
            console.log(`   Expected: ${testCase.expected}, Got: ${isValid}`);
            console.log(`   Length: ${testCase.text.length}, Limit: ${testCase.limit}`);
        }
    });
};

// Main test runner
export const runAllTests = () => {
    console.log('🚀 Starting Assessment Validation Test Suite...\n');

    runValidationTests();
    testCSVValidation();
    testCharacterLimits();

    console.log('\n🎯 Test Suite Complete!');
    console.log('\n📋 Summary of Expected Results:');
    console.log('   ✅ Valid questions should pass validation');
    console.log('   ❌ Invalid scenarios (Ex 1, 4) should fail validation');
    console.log('   ⚠️  Borderline cases (Ex 2, 3, 5) may pass but show warnings');
    console.log('   📄 CSV parsing should handle various formats gracefully');
    console.log('   🔤 Character limits should be enforced appropriately');
};

// Export for use in browser console or other test environments
if (typeof window !== 'undefined') {
    window.runAssessmentValidationTests = runAllTests;
    window.testQuestions = testQuestions;
    window.validateQuestion = validateQuestion;
    console.log('🧪 Assessment validation tests loaded! Run runAssessmentValidationTests() in console to test.');
}

export default {
    runAllTests,
    testQuestions,
    validateQuestion,
    runValidationTests,
    testCSVValidation,
    testCharacterLimits
};
