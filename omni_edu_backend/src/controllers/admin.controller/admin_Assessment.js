const Assessment = require("../../models/assessment_model")
const Question = require("../../models/question_model")
const createAssessment = async (req, res) => {
    try {
        const { title, description, questions, status, classification } = req.body;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ 
                isSuccess: false, 
                message: "Title and questions are required" 
            });
        }

        const errors = [];
        const validQuestions = [];

        // Validate each question
        questions.forEach((q, index) => {
            try {
                if (!q.type || !q.question_text) {
                    errors.push({ index, reason: "Missing type or question text" });
                    return;
                }

                if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
                    errors.push({ index, reason: "Options must be a non-empty array" });
                    return;
                }

                if (q.correct_option === undefined || q.correct_option === null || 
                    (Array.isArray(q.correct_option) && q.correct_option.length === 0)) {
                    errors.push({ index, reason: "Missing or invalid correct_option" });
                    return;
                }

                // Ensure correct_option index is valid
                if (Array.isArray(q.correct_option)) {
                    const invalid = q.correct_option.some(i => i < 0 || i >= q.options.length);
                    if (invalid) {
                        errors.push({ index, reason: "Invalid correct_option indices" });
                        return;
                    }
                } else if (q.correct_option < 0 || q.correct_option >= q.options.length) {
                    errors.push({ index, reason: "Invalid correct_option index" });
                    return;
                }

                validQuestions.push({
                    type: q.type.trim(),
                    question_text: q.question_text.trim(),
                    file_url: q.file_url?.trim() || null,
                    options: q.options,
                    correct_option: q.correct_option,
                });
            } catch (questionError) {
                errors.push({ index, reason: `Question validation failed: ${questionError.message}` });
            }
        });

        if (validQuestions.length === 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "No valid questions found",
                errors
            });
        }

        const savedQuestions = await Question.insertMany(validQuestions, { ordered: false });

        const assessment = new Assessment({
            title,
            description: description || "",
            questions: savedQuestions.map(q => q._id),
            created_by: req.user?._id,
            status,
            classification
        });

        await assessment.save();
        await logAdminActivity(req, "add", "Assessment created successfully", "success");
        res.status(201).json({
            isSuccess: true,
            message: "Assessment created successfully",
            data: assessment,
            errors // return invalid question info if any
        });

    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ isSuccess: false, message: error.message });
    }
};

const csv = require("csv-parser");
const fs = require("fs");
const logAdminActivity = require("./admin_activity");

const uploadAssessmentCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ isSuccess: false, message: "No file uploaded" });
        }

        const file = req.file;
        const questions = [];
        const errors = [];

        // Map letter answers to index
        const letterToIndex = { A: 0, B: 1, C: 2, D: 3, E: 4 };

        fs.createReadStream(file.path)
            .pipe(csv())
            .on("data", (row) => {
                try {
                    // Validate required fields
                    if (!row["Type of Question"] || !row["Question"]) {
                        errors.push({ row, reason: "Missing Type of Question or Question" });
                        return;
                    }
                    const options = [
                        row["Option A"],
                        row["Option B"],
                        row["Option C"],
                        row["Option D"],
                        row["Option E"]
                    ].filter(Boolean);

                    if (options.length === 0) {
                        errors.push({ row, reason: "No options provided" });
                        return;
                    }

                    const answer = row["Answer"]?.trim().toUpperCase();
                    let correct_option = null;

                    if (!answer) {
                        errors.push({ row, reason: "Missing Answer" });
                        return;
                    }

                    if (answer.includes(",")) {
                        correct_option = answer
                            .split(",")
                            .map(a => letterToIndex[a.trim()] ?? null)
                            .filter(a => a !== null);

                        if (correct_option.length === 0) {
                            errors.push({ row, reason: `Invalid multi-select answer: ${answer}` });
                            return;
                        }
                    } else {
                        correct_option = letterToIndex[answer] ?? null;
                        if (correct_option === null) {
                            errors.push({ row, reason: `Invalid answer: ${answer}` });
                            return;
                        }
                    }

                    questions.push({
                        type: row["Type of Question"].trim(),
                        question_text: row["Question"].trim(),
                        file_url: row["File URL"]?.trim() || null,
                        options,
                        correct_option,
                    });
                } catch (rowError) {
                    errors.push({ row, reason: `Row processing failed: ${rowError.message}` });
                }
            })
            .on("end", async () => {
                try {
                    if (questions.length === 0) {
                        fs.unlinkSync(file.path);
                        return res.status(400).json({
                            isSuccess: false,
                            message: "No valid questions found in CSV",
                            errors
                        });
                    }

                    // Save valid questions
                    const savedQuestions = await Question.insertMany(questions, { ordered: false });

                    // Create assessment
                    const assessment = new Assessment({
                        title: req.body.title || "Untitled Assessment",
                        description: req.body.description || "",
                        questions: savedQuestions.map((q) => q._id),
                        created_by: req.user?._id,
                        status: req.body.status,
                        classification: req.body.classification,
                    });
                    await assessment.save();
                    await logAdminActivity(req, "add", "Assessment created successfully", "success");
                    fs.unlinkSync(file.path);
                    return res.status(201).json({
                        isSuccess: true,
                        message: "Assessment created from CSV",
                        data: assessment,
                        errors // return any skipped rows for debugging
                    });
                } catch (dbError) {
                    console.error("DB save error:", dbError);
                    fs.unlinkSync(file.path);
                    return res.status(500).json({
                        isSuccess: false,
                        message: "Error saving questions or assessment",
                        error: dbError.message,
                        errors
                    });
                }
            })
            .on("error", (csvError) => {
                console.error("CSV parsing error:", csvError);
                fs.unlinkSync(file.path);
                return res.status(500).json({
                    isSuccess: false,
                    message: "CSV parsing failed",
                    error: csvError.message,
                });
            });
    } catch (error) {
        console.error("CSV upload error:", error);
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(500).json({ isSuccess: false, message: error.message });
    }
};


const getAssessments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const assessments = await Assessment.find().skip((page - 1) * limit).limit(limit)
        await logAdminActivity(req, "view", `Assessments fetched`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Assessments fetched successfully",
            data: assessments,
            pagination: {
                page,
                limit,
                total: await Assessment.countDocuments()
            }
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch assessments",
            error: error.message
        })
    }
}


const getQuestions = async (req, res) => {
    try {
        const questions = await Assessment.findOne({uuid:req.params.id}).populate("questions")
        const {page = 1, limit = 50} = req.query
        const paginatedQuestions = questions.questions.slice((page - 1) * limit, page * limit)
        await logAdminActivity(req, "view", `Questions fetched`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Questions fetched successfully",
            data: paginatedQuestions,
            pagination: {
                page,
                limit,
                total: questions.questions.length
            }
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch questions",
            error: error.message
        })
    }
}
const getQuestionsRandom = async (req, res) => {
    try {
        const { noOfQuestions } = req.query
        const questions = await Assessment.findOne({uuid:req.params.id}).populate("questions")
        const randomQuestions = questions.questions.sort(() => 0.5 - Math.random()).slice(0, noOfQuestions);
        await logAdminActivity(req, "view", `Questions fetched`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Questions fetched successfully",
            data: randomQuestions
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch questions",
            error: error.message
        })
    }
}

const getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findOne({uuid:req.params.id}).populate("questions")
        await logAdminActivity(req, "view", `Assessment fetched`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Assessment fetched successfully",
            data: assessment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch assessment",
            error: error.message
        })
    }
}

const editAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findOneAndUpdate({uuid:req.params.id}, {
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            classification: req.body.classification
        })
        await logAdminActivity(req, "edit", `Assessment updated`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Assessment updated successfully",
            data: assessment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to update assessment",
            error: error.message
        })
    }
}

const deleteAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findOneAndDelete({uuid:req.params.id})
        await logAdminActivity(req, "delete", `Assessment deleted`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Assessment deleted successfully",
            data: assessment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to delete assessment",
            error: error.message
        })
    }
}

const editQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndUpdate({uuid:req.params.id}, {
            question_text: req.body.question_text,
            options: req.body.options,
            correct_option: req.body.correct_option
        })
        await logAdminActivity(req, "edit", `Question updated`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Question updated successfully",
            data: question
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to update question",
            error: error.message
        })
    }
}

const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findOneAndDelete({uuid:req.params.id})
        await logAdminActivity(req, "delete", `Question deleted`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Question deleted successfully",
            data: question
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to delete question",
            error: error.message
        })
    }
}


const searchAssessment = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const { status, search = "" } = req.query;

        const filter = {
            title: { $regex: search, $options: "i" },
            ...(status && { status }),
        };

        const total = await Assessment.countDocuments(filter);
        const assessments = await Assessment.find(filter)
            .skip(skip)
            .limit(limit);
        await logAdminActivity(req, "view", `Assessments fetched`, "success");
        return res.status(200).json({
            isSuccess: true,
            message: "Assessments fetched successfully",
            data: assessments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch assessments",
            error: error.message,
        });
    }
};


module.exports = {
    createAssessment,
    uploadAssessmentCSV,
    getAssessments,
    getQuestions,
    getAssessmentById,
    editAssessment,
    deleteAssessment,
    editQuestion,
    deleteQuestion,
    searchAssessment,
    getQuestionsRandom
}