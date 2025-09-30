const GlobalAssessment = require("../../models/globalAssessments_model")
const GlobalQuestion = require("../../models/globalQuestions_model")
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===== File Upload: store under Backend/uploads and return permanent URL =====
// __dirname is Backend/src/controllers/globalAdmin.controller
// Go up three levels to reach Backend/ then into uploads
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
        const unique = `${base}_${Date.now()}${ext}`;
        cb(null, unique);
    }
});

const upload = multer({ storage });

const fileUploadMiddleware = upload.single('file');

const fileUploadHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ isSuccess: false, message: 'No file uploaded' });
        }
        // const filename = req.file.filename;
        // const url = `/uploads/${filename}`;
        // return res.status(200).json({ isSuccess: true, url });
        // inside fileUploadHandler
        const filename = req.file.filename;

        // Respect reverse proxy headers when available (e.g., Nginx)
        const forwardedProto = req.headers['x-forwarded-proto'];
        const forwardedHost = req.headers['x-forwarded-host'];
        const proto = forwardedProto || req.protocol;
        const host = forwardedHost || req.get('host');

        const absoluteUrl = `${proto}://${host}/uploads/${filename}`;
        return res.status(200).json({ isSuccess: true, url: absoluteUrl });
    } catch (error) {
        return res.status(500).json({ isSuccess: false, message: 'Upload failed', error: error.message });
    }
};
// Add this small validator at top-level (optional but recommended)
function isValidDuration(hhmm) {
    if (typeof hhmm !== 'string') return false;
    const m = hhmm.match(/^(\d{1,2}):([0-5]\d)$/);
    if (!m) return false;
    const h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    return h >= 0 && mm >= 0 && mm <= 59;
}
function normalizeCorrectOption(value) {
    // Accept numbers, arrays, or strings like "0,2"
    if (Array.isArray(value)) {
        return value
            .map(v => Number.parseInt(v, 10))
            .filter(n => Number.isInteger(n));
    }
    if (typeof value === 'string') {
        if (value.includes(',')) {
            return value
                .split(',')
                .map(s => Number.parseInt(s.trim(), 10))
                .filter(n => Number.isInteger(n));
        }
        const n = Number.parseInt(value.trim(), 10);
        return Number.isInteger(n) ? [n] : [];
    }
    if (Number.isInteger(value)) {
        return [value];
    }
    return [];
}
const createAssessment = async (req, res) => {
    try {
        const { title, description, questions, status, duration, tags, team, subteam, attempts, unlimited_attempts, percentage_to_pass, display_answers, display_answers_when } = req.body;
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "Title and questions are required"
            });
        }

        if (!Array.isArray(tags) || tags.length === 0) {
            return res.status(400).json({ isSuccess: false, message: "Tags (array) are required" });
        }
        if (!duration || typeof duration !== "string") {
            return res.status(400).json({ isSuccess: false, message: "Duration (string) is required" });
        }
        if (!team) {
            return res.status(400).json({ isSuccess: false, message: "Team is required" });
        }
        if (!subteam) {
            return res.status(400).json({ isSuccess: false, message: "SubTeam is required" });
        }
        const unlimited = Boolean(unlimited_attempts);
        const attemptsNum = unlimited ? 1 : (Number.isFinite(Number(attempts)) ? Math.max(1, Number(attempts)) : 1);
        const passPct = Number(percentage_to_pass);
        if (!Number.isFinite(passPct) || passPct < 0 || passPct > 100) {
            return res.status(400).json({ isSuccess: false, message: "percentage_to_pass must be between 0 and 100" });
        }

        // Validate duration format HH:MM (optional but safer)
        if (!duration || typeof duration !== 'string' || !isValidDuration(duration)) {
            return res.status(400).json({
                isSuccess: false,
                message: 'Duration must be a string in HH:MM format',
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

                // // Ensure correct_option index is valid
                // if (Array.isArray(q.correct_option)) {
                //     const invalid = q.correct_option.some(i => i < 0 || i >= q.options.length);
                //     if (invalid) {
                //         errors.push({ index, reason: "Invalid correct_option indices" });
                //         return;
                //     }
                // } else if (q.correct_option < 0 || q.correct_option >= q.options.length) {
                //     errors.push({ index, reason: "Invalid correct_option index" });
                //     return;
                // }
                // After you computed/validated options and other fields
                const type = String(q.type || '').trim();
                if (!['Multiple Choice', 'Multi Select'].includes(type)) {
                    errors.push({ index, reason: 'Invalid type. Allowed: Multiple Choice, Multi Select' });
                    return;
                }

                // Normalize correct_option to array of ints
                const normalizedCorrect = normalizeCorrectOption(q.correct_option);

                // Enforce counts based on type
                if (type === 'Multiple Choice') {
                    if (normalizedCorrect.length !== 1) {
                        errors.push({ index, reason: 'Multiple Choice must have exactly 1 correct option index' });
                        return;
                    }
                } else if (type === 'Multi Select') {
                    if (normalizedCorrect.length < 1) { // set to < 2 if you want strictly multiple
                        errors.push({ index, reason: 'Multi Select must have at least 1 correct option index' });
                        return;
                    }
                }

                // Also ensure correct indexes are within options bounds
                const maxIndex = (q.options || []).length - 1;
                if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
                    errors.push({ index, reason: 'correct_option indexes out of range for provided options' });
                    return;
                }

                // DO NOT require instructions; just normalize
                const instructions = typeof q.instructions === 'string' ? q.instructions : '';

                validQuestions.push({
                    type: q.type.trim(),
                    question_text: q.question_text.trim(),
                    file_url: q.file_url?.trim() || null,
                    options: q.options,
                    correct_option: normalizedCorrect,
                    instructions, // NEW

                });
            } catch (questionError) {
                errors.push({ index, reason: `Question validation failed: ${questionError.message}` });
                return res.status(400).json({
                    isSuccess: false,
                    message: "Invalid question format",
                    errors
                });
            }
        });

        if (validQuestions.length === 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "No valid questions found",
                errors
            });
        }
        if (errors.length > 0) {
            return res.status(400).json({
                isSuccess: false,
                message: "Invalid question format",
                errors
            });
        }

        const savedQuestions = await GlobalQuestion.insertMany(validQuestions, { ordered: false });

        // const assessment = new GlobalAssessment({
        //     title,
        //     description: description || "",
        //     questions: savedQuestions.map(q => q._id),
        //     tags,
        //     duration,
        //     team,
        //     subteam,
        //     attempts,
        //     percentage_to_pass,
        //     created_by: req.user?._id,
        //     status,

        // });
        const assessment = new GlobalAssessment({
            title,
            description: description || "",
            questions: savedQuestions.map(q => q._id),
            tags,
            duration,
            team,
            subteam,
            attempts: attemptsNum,
            unlimited_attempts: unlimited,
            percentage_to_pass: passPct,
            display_answers: display_answers ?? false,
            display_answers_when: display_answers_when || "Never",
            created_by: req.user?._id,
            status,
        });

        await assessment.save();
        res.status(201).json({
            isSuccess: true,
            message: "Assessment created successfully",
            data: assessment,
            errors
        });

    } catch (error) {
        console.error("Error creating assessment:", error);
        res.status(500).json({ isSuccess: false, message: error.message });
    }
};

const csv = require("csv-parser");


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
                    const savedQuestions = await GlobalQuestion.insertMany(questions, { ordered: false });

                    // Parse tags from body (array or comma-separated string)
                    let tags = [];
                    if (Array.isArray(req.body.tags)) {
                        tags = req.body.tags.filter(Boolean).map(t => String(t).trim()).filter(t => t.length > 0);
                    } else if (typeof req.body.tags === 'string') {
                        tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    }

                    // Create assessment
                    const assessment = new GlobalAssessment({
                        title: req.body.title || "Untitled Assessment",
                        description: req.body.description || "",
                        questions: savedQuestions.map((q) => q._id),
                        tags, // include tags if provided
                        created_by: req.user?._id,
                        status: req.body.status,
                        classification: req.body.classification,
                    });
                    await assessment.save();

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
        const assessments = await GlobalAssessment.find().skip((page - 1) * limit).limit(limit)
        return res.status(200).json({
            isSuccess: true,
            message: "Assessments fetched successfully",
            data: assessments,
            pagination: {
                page,
                limit,
                total: await GlobalAssessment.countDocuments()
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
        const questions = await GlobalAssessment.findOne({ uuid: req.params.id }).populate("questions")
        const { page = 1, limit = 50 } = req.query
        const paginatedQuestions = questions.questions.slice((page - 1) * limit, page * limit)
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
        const questions = await GlobalAssessment.findOne({ uuid: req.params.id }).populate("questions")
        const randomQuestions = questions.questions.sort(() => 0.5 - Math.random()).slice(0, noOfQuestions);
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
        const assessment = await GlobalAssessment.findOne({ uuid: req.params.id }).populate("questions")
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
        // Update assessment-level fields first
        const assessment = await GlobalAssessment.findOneAndUpdate(
            { uuid: req.params.id },
            {
                title: req.body.title,
                description: req.body.description,
                status: req.body.status,
                tags: req.body.tags,
                duration: req.body.duration,
                team: req.body.team,
                subteam: req.body.subteam,
                attempts: req.body.attempts,
                unlimited_attempts: req.body.unlimited_attempts === true || req.body.unlimited_attempts === 'true',
                percentage_to_pass: req.body.percentage_to_pass,
                display_answers: req.body.display_answers,
                display_answers_when: req.body.display_answers_when,
            },
            { new: true }
        );

        // Optionally update related questions if provided
        const questions = Array.isArray(req.body.questions) ? req.body.questions : [];
        if (questions.length > 0) {
            await Promise.all(
                questions.map(async (q) => {
                    const id = q.id || q.uuid || q._id;
                    if (!id) return;
                    // // Normalize correct_option to array of integers
                    // let correct = q.correct_option;
                    // if (typeof correct === 'string') {
                    //     correct = correct.includes(',')
                    //         ? correct
                    //             .split(',')
                    //             .map((s) => parseInt(s.trim(), 10))
                    //             .filter((n) => Number.isInteger(n))
                    //         : Number.isInteger(parseInt(correct.trim(), 10))
                    //             ? [parseInt(correct.trim(), 10)]
                    //             : [];
                    // } else if (Number.isInteger(correct)) {
                    //     correct = [correct];
                    // } else if (Array.isArray(correct)) {
                    //     correct = correct.filter((n) => Number.isInteger(n));
                    // } else {
                    //     correct = [];
                    // }
                    const type = typeof q.type === 'string' ? q.type.trim() : undefined;
                    const normalizedCorrect = normalizeCorrectOption(q.correct_option);

                    // Fetch options if not provided (so we can validate bounds)
                    let options = Array.isArray(q.options) ? q.options : undefined;
                    if (!options) {
                        const existing = await GlobalQuestion.findOne({ uuid: id });
                        options = existing ? existing.options : [];
                    }

                    if (type && !['Multiple Choice', 'Multi Select'].includes(type)) {
                        throw new Error('Invalid type. Allowed: Multiple Choice, Multi Select');
                    }

                    // Enforce counts (only if correct_option was provided)
                    if (q.correct_option !== undefined) {
                        const effectiveType = type || (await GlobalQuestion.findOne({ uuid: id }))?.type || 'Multiple Choice';
                        if (effectiveType === 'Multiple Choice') {
                            if (normalizedCorrect.length !== 1) {
                                throw new Error('Multiple Choice must have exactly 1 correct option index');
                            }
                        } else if (effectiveType === 'Multi Select') {
                            if (normalizedCorrect.length < 1) { // or < 2 if strictly multiple
                                throw new Error('Multi Select must have at least 1 correct option index');
                            }
                        }
                        const maxIndex = options.length - 1;
                        if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
                            throw new Error('correct_option indexes out of range for provided options');
                        }
                    }

                    // Update GlobalQuestion by uuid or _id
                    const filter = /^[0-9a-fA-F]{24}$/.test(String(id))
                        ? { _id: id }
                        : { uuid: id };

                    // await GlobalQuestion.findOneAndUpdate(
                    //     filter,
                    //     {
                    //         question_text: q.question_text,
                    //         type: q.type,
                    //         options: q.options,
                    //         correct_option: correct,
                    //         file_url: q.file_url || null,
                    //         // Include instructions if provided (optional)
                    //         ...(typeof q.instructions === 'string' ? { instructions: q.instructions } : {}),

                    //     },
                    //     { new: false }
                    await GlobalQuestion.findOneAndUpdate(
                        { uuid: id },
                        {
                            ...(typeof q.question_text === 'string' ? { question_text: q.question_text } : {}),
                            ...(Array.isArray(q.options) ? { options: q.options } : {}),
                            ...(q.correct_option !== undefined ? { correct_option: normalizedCorrect } : {}),
                            ...(typeof q.type === 'string' ? { type } : {}),
                            ...(typeof q.file_url === 'string' ? { file_url: q.file_url } : {}),
                            ...(typeof q.instructions === 'string' ? { instructions: q.instructions } : {}),
                        },
                        { new: false }
                    );
                })
            );
        }

        // Return populated assessment so frontend can display latest question values
        const populated = await GlobalAssessment.findOne({ uuid: req.params.id }).populate('questions');

        return res.status(200).json({
            isSuccess: true,
            message: "Assessment updated successfully",
            data: populated || assessment,
        });
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to update assessment",
            error: error.message,
        });
    }
}

const deleteAssessment = async (req, res) => {
    try {
        const assessment = await GlobalAssessment.findOneAndDelete({ uuid: req.params.id })
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
        // const question = await GlobalQuestion.findOneAndUpdate({ uuid: req.params.id }, {
        //     question_text: req.body.question_text,
        //     options: req.body.options,
        //     correct_option: req.body.correct_option
        // })
        // const question = await GlobalQuestion.findOneAndUpdate(
        //     { uuid: req.params.id }, // or _id
        //     {
        //         question_text: req.body.question_text,
        //         options: req.body.options,
        //         correct_option: req.body.correct_option,
        //         ...(typeof req.body.type === 'string' ? { type: req.body.type } : {}),
        //         ...(typeof req.body.file_url === 'string' ? { file_url: req.body.file_url } : {}),
        //         ...(typeof req.body.instructions === 'string' ? { instructions: req.body.instructions } : {}), // NEW
        //     },
        //     { new: true }
        // );

        const payload = {
            ...(typeof req.body.question_text === 'string' ? { question_text: req.body.question_text } : {}),
            ...(Array.isArray(req.body.options) ? { options: req.body.options } : {}),
            ...(typeof req.body.type === 'string' ? { type: req.body.type.trim() } : {}),
            ...(typeof req.body.file_url === 'string' ? { file_url: req.body.file_url } : {}),
            ...(typeof req.body.instructions === 'string' ? { instructions: req.body.instructions } : {}),
        };

        let normalizedCorrect;
        if (req.body.correct_option !== undefined) {
            normalizedCorrect = normalizeCorrectOption(req.body.correct_option);
            payload.correct_option = normalizedCorrect;
        }

        // Fetch current question (to know type/options if not provided)
        const existing = await GlobalQuestion.findOne({ uuid: req.params.id });
        if (!existing) {
            return res.status(404).json({ isSuccess: false, message: 'Question not found' });
        }

        const effectiveType = payload.type || existing.type;
        if (!['Multiple Choice', 'Multi Select'].includes(effectiveType)) {
            return res.status(400).json({ isSuccess: false, message: 'Invalid type. Allowed: Multiple Choice, Multi Select' });
        }

        // Validate counts if correct_option present
        if (normalizedCorrect !== undefined) {
            if (effectiveType === 'Multiple Choice') {
                if (normalizedCorrect.length !== 1) {
                    return res.status(400).json({ isSuccess: false, message: 'Multiple Choice must have exactly 1 correct option index' });
                }
            } else if (effectiveType === 'Multi Select') {
                if (normalizedCorrect.length < 1) { // or < 2 if strictly multiple
                    return res.status(400).json({ isSuccess: false, message: 'Multi Select must have at least 1 correct option index' });
                }
            }
            const maxIndex = (payload.options || existing.options || []).length - 1;
            if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
                return res.status(400).json({ isSuccess: false, message: 'correct_option indexes out of range for provided options' });
            }
        }

        const question = await GlobalQuestion.findOneAndUpdate(
            { uuid: req.params.id },
            payload,
            { new: true }
        );
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
        const question = await GlobalQuestion.findOneAndDelete({ uuid: req.params.id })
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

        const total = await GlobalAssessment.countDocuments(filter);
        const assessments = await GlobalAssessment.find(filter)
            .skip(skip)
            .limit(limit);
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
    getQuestionsRandom,
    fileUploadMiddleware,
    fileUploadHandler,
}