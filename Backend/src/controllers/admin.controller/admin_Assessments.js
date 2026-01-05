const OrganizationAssessments = require("../../models/organizationAssessments_model")
const OrganizationAssessmentQuestion = require("../../models/organizationAssessmentQuestions_model")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require("mongoose");
const csv = require("csv-parser");
const { logActivity } = require("../../utils/activityLogger");

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
        console.log(req.uploadedFile)
        const absoluteUrl = req.uploadedFile.url;
        return res.status(200).json({ isSuccess: true, url: absoluteUrl });
    } catch (error) {
        console.log(error)
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
    // Accept numbers, arrays, strings like "0,2", or letters like "A,C"
    if (Array.isArray(value)) {
        return value
            .map(v => {
                if (typeof v === 'string') {
                    // Handle letter inputs like "A", "B", "C"
                    if (/^[A-Z]$/.test(v.trim())) {
                        return v.toUpperCase().charCodeAt(0) - 65;
                    }
                }
                return Number.parseInt(v, 10);
            })
            .filter(n => Number.isInteger(n));
    }
    if (typeof value === 'string') {
        if (value.includes(',')) {
            return value
                .split(',')
                .map(s => {
                    const trimmed = s.trim();
                    if (/^[A-Z]$/.test(trimmed)) {
                        return trimmed.toUpperCase().charCodeAt(0) - 65;
                    }
                    return Number.parseInt(trimmed, 10);
                })
                .filter(n => Number.isInteger(n));
        }
        const trimmed = value.trim();
        if (/^[A-Z]$/.test(trimmed)) {
            return [trimmed.toUpperCase().charCodeAt(0) - 65];
        }
        const n = Number.parseInt(trimmed, 10);
        return Number.isInteger(n) ? [n] : [];
    }
    if (Number.isInteger(value)) {
        return [value];
    }
    return [];
}


// Controller for creating assessment
const createAssessment = async (req, res) => {
    //console.log(req.body)
    let session;
    let transactionCommitted = false; // Track transaction state
    try {
        const {
            title, description, tags, duration, team, subteam, Level, noOfQuestions,
            attempts, unlimited_attempts, percentage_to_pass,
            display_answers, status, credits, stars, badges, category, feedbackEnabled, shuffle_questions, shuffle_options, questions = [], instructions

        } = req.body;
        console.log(req.body)
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        // Build and save questions
        const questionIds = [];
        const inputQuestions = Array.isArray(questions) ? questions : [];
        if (inputQuestions.length === 0) {
            return res.status(400).json({ success: false, message: "At least one question is required" });
        }

        // Start MongoDB session
        session = await mongoose.startSession();
        session.startTransaction();

        for (let index = 0; index < inputQuestions.length; index++) {
            const q = inputQuestions[index];
            if (!q || typeof q.question_text !== 'string' || typeof q.type !== 'string') {
                throw new Error(`Invalid question at index ${index}: missing type or question_text`);
            }

            const type = String(q.type || '').trim();
            if (!['Multiple Choice', 'Multi Select'].includes(type)) {
                throw new Error(`Invalid type for question ${index}. Allowed: Multiple Choice, Multi Select`);
            }

            const options = Array.isArray(q.options) ? q.options.filter(o => typeof o === 'string' && o.length > 0) : [];
            if (options.length < 2) {
                throw new Error(`Question ${index} must have at least two options`);
            }

            const normalizedCorrect = normalizeCorrectOption(q.correct_option);
            if (type === 'Multiple Choice') {
                if (normalizedCorrect.length !== 1) {
                    throw new Error(`Question ${index}: Multiple Choice must have exactly 1 correct option index`);
                }
            } else {
                if (normalizedCorrect.length < 1) {
                    throw new Error(`Question ${index}: Multi Select must have at least 1 correct option index`);
                }
            }
            const maxIndex = options.length - 1;
            if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
                throw new Error(`Question ${index}: correct_option indexes out of range for provided options`);
            }
            // console.log(req.uploadedFiles)
            const newQuestion = new OrganizationAssessmentQuestion({
                question_text: q.question_text.trim(),
                type,
                options,
                correct_option: normalizedCorrect,
                total_points: Number.isFinite(Number(q.total_points)) ? Number(q.total_points) : 1,
                file_url: typeof q.file_url === 'string' && q.file_url.trim() ? q.file_url.trim() : null,
            });

            const savedQuestion = await newQuestion.save({ session });
            questionIds.push(savedQuestion._id);
        }
        console.log(req.uploadedFile)
        const thumbnail_url = req.uploadedFile?.url;
        // Create assessment using the saved question ids
        const newAssessment = new OrganizationAssessments({
            organization_id,
            title,
            description,
            tags,
            duration,
            team,
            subteam,
            Level,
            noOfQuestions,
            attempts,
            unlimited_attempts,
            percentage_to_pass,
            display_answers,
            status,
            credits,
            stars,
            badges,
            category,
            feedbackEnabled,
            shuffle_questions,
            shuffle_options,
            questions: questionIds,
            instructions: instructions,
            created_by: req.user?._id,
            thumbnail: thumbnail_url
        });

        const savedAssessment = await newAssessment.save({ session });

        // Commit transaction
        await session.commitTransaction();
        transactionCommitted = true; // Mark as committed

        const populatedAssessment = await OrganizationAssessments.findById(savedAssessment._id)
            .populate('questions');

        await logActivity({
            userId:req.user._id,
            action:"Create",
            details:`Created assessment ${savedAssessment.title}`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"success",
        })
        res.status(201).json({
            success: true,
            message: "Assessment created successfully",
            assessment: populatedAssessment,
        });

    } catch (error) {
        // Only abort if transaction wasn't committed
        if (session && !transactionCommitted) {
            await session.abortTransaction();
        }
        await logActivity({
            userId:req.user._id,
            action:"Create",
            details:`Failed to create assessment`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"failed",
        })
        res.status(500).json({ success: false, message: "Failed to create assessment", error: error.message });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

const uploadAssessmentCSV = async (req, res) => {
    let session;
    let transactionCommitted = false; // Track transaction state
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ isSuccess: false, message: "Organization ID is required" });
        }

        if (!req.file) {
            return res.status(400).json({ isSuccess: false, message: "No file uploaded" });
        }

        const file = req.file;
        const questions = [];
        const errors = [];

        // Map letter answers to index
        const letterToIndex = { A: 0, B: 1, C: 2, D: 3, E: 4 };

        // Start MongoDB session
        session = await mongoose.startSession();
        session.startTransaction();

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
                    const savedQuestions = await OrganizationAssessmentQuestion.insertMany(questions, { ordered: false, session });

                    // Parse tags from body (array or comma-separated string)
                    let tags = [];
                    if (Array.isArray(req.body.tags)) {
                        tags = req.body.tags.filter(Boolean).map(t => String(t).trim()).filter(t => t.length > 0);
                    } else if (typeof req.body.tags === 'string') {
                        tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
                    }

                    // Create assessment
                    const assessment = new OrganizationAssessments({
                        organization_id,
                        title: req.body.title || "Untitled Assessment",
                        description: req.body.description || "",
                        questions: savedQuestions.map((q) => q._id),
                        tags, // include tags if provided
                        created_by: req.user?._id,
                        status: req.body.status,
                        classification: req.body.classification,
                    });

                    const savedAssessment = await assessment.save({ session });

                    // Commit transaction
                    await session.commitTransaction();
                    transactionCommitted = true; // Mark as committed

                    await logActivity({
                        userId:req.user._id,
                        action:"Create",
                        details:`Created assessment from CSV: ${assessment.title}`,
                        userRole:req.user.role,
                        ip:req.ip,
                        userAgent:req.headers['user-agent'],
                        status:"success",
                    })

                    fs.unlinkSync(file.path);
                    return res.status(201).json({
                        isSuccess: true,
                        message: "Assessment created from CSV",
                        data: savedAssessment,
                        errors // return any skipped rows for debugging
                    });
                } catch (dbError) {
                    // Only abort if transaction wasn't committed
                    if (session && !transactionCommitted) {
                        await session.abortTransaction();
                    }
                    console.error("DB save error:", dbError);
                    fs.unlinkSync(file.path);
                    return res.status(500).json({
                        isSuccess: false,
                        message: "Error saving questions or assessment",
                        error: dbError.message,
                        errors
                    });
                } finally {
                    if (session) {
                        session.endSession();
                    }
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
        
        await logActivity({
            userId:req.user._id,
            action:"Create",
            details:`Failed to create assessment from CSV`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"failed",
        })
        
        return res.status(500).json({ isSuccess: false, message: error.message });
    } finally {
        if (session && !transactionCommitted) {
            await session.abortTransaction();
        }
        if (session) {
            session.endSession();
        }
    }
};


const getAssessments = async (req, res) => {
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const assessments = await OrganizationAssessments.find({ organization_id })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("questions")
        return res.status(200).json({
            isSuccess: true,
            message: "Assessments fetched successfully",
            data: assessments,
            pagination: {
                page,
                limit,
                total: await OrganizationAssessments.countDocuments({ organization_id })
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
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const assessment = await OrganizationAssessments.findOne({ uuid: req.params.id, organization_id }).populate("questions")
        const { page = 1, limit = 50 } = req.query
        const paginatedQuestions = assessment.questions.slice((page - 1) * limit, page * limit)
        return res.status(200).json({
            isSuccess: true,
            message: "Questions fetched successfully",
            data: paginatedQuestions,
            pagination: {
                page,
                limit,
                total: assessment.questions.length
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
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const { noOfQuestions } = req.query
        const questions = await OrganizationAssessments.findOne({ uuid: req.params.id, organization_id }).populate("questions")

        if (!questions || !questions.questions) {
            return res.status(404).json({
                isSuccess: false,
                message: "Assessment or questions not found"
            })
        }

        // Use all questions if noOfQuestions not provided or invalid
        const totalQuestions = questions.questions.length
        const numQuestions = noOfQuestions && !isNaN(noOfQuestions) && noOfQuestions > 0
            ? Math.min(parseInt(noOfQuestions), totalQuestions)
            : totalQuestions

        const randomQuestions = questions.questions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);

        // Shuffle options within each question for all questions (always enabled)
        const shuffledQuestions = randomQuestions.map(question => {
            if (question.options && question.options.length > 1) {
                // Create array of option objects with their original indices
                const optionsWithIndices = question.options.map((option, index) => ({
                    text: option,
                    originalIndex: index
                }));

                // Shuffle the options
                const shuffledOptions = optionsWithIndices.sort(() => 0.5 - Math.random());

                // Create new options array and mapping for correct answers
                const newOptions = shuffledOptions.map(opt => opt.text);
                const correctOptionMapping = shuffledOptions.map(opt => opt.originalIndex);

                // Map correct answers to new indices
                const newCorrectOptions = question.correct_option.map(correctIndex =>
                    correctOptionMapping.indexOf(correctIndex)
                );

                return {
                    ...question.toObject(),
                    options: newOptions,
                    correct_option: newCorrectOptions,
                    original_correct_option: question.correct_option // Keep original for reference
                };
            }
            return question;
        });

        return res.status(200).json({
            isSuccess: true,
            message: "Questions fetched successfully",
            data: shuffledQuestions
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
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const assessment = await OrganizationAssessments.findOne({ uuid: req.params.id, organization_id }).populate("questions")
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
    let session;
    let transactionCommitted = false; // Track transaction state
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        // Start MongoDB session
        session = await mongoose.startSession();
        session.startTransaction();

        // Update assessment-level fields first (normalize types)
        const durationNum = req.body.duration !== undefined && req.body.duration !== '' ? Number(req.body.duration) : undefined;
        const attemptsNum = req.body.attempts !== undefined && req.body.attempts !== '' ? Number(req.body.attempts) : undefined;
        const passNum = req.body.percentage_to_pass !== undefined && req.body.percentage_to_pass !== '' ? Number(req.body.percentage_to_pass) : undefined;
        const unlimited = req.body.unlimited_attempts === true || req.body.unlimited_attempts === 'true';
        const tagsArr = Array.isArray(req.body.tags) ? req.body.tags : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined);
        const thumbnail = req.uploadedFile?.url;
        // console.log(thumbnail)
        const updateDoc = {
            ...(typeof req.body.title === 'string' ? { title: req.body.title } : {}),
            ...(typeof req.body.description === 'string' ? { description: req.body.description } : {}),
            ...(typeof req.body.status === 'string' ? { status: req.body.status } : {}),
            ...(tagsArr !== undefined ? { tags: tagsArr } : {}),
            ...(Number.isFinite(durationNum) && durationNum >= 0 ? { duration: durationNum } : {}),
            ...(req.body.team ? { team: req.body.team } : {}),
            ...(req.body.subteam ? { subteam: req.body.subteam } : {}),
            ...(req.body.Level !== undefined ? { Level: req.body.Level } : {}),
            ...(req.body.noOfQuestions !== undefined ? { noOfQuestions: Number(req.body.noOfQuestions) } : {}),
            ...(Number.isFinite(attemptsNum) && attemptsNum >= 1 ? { attempts: attemptsNum } : {}),
            unlimited_attempts: unlimited,
            ...(Number.isFinite(passNum) && passNum >= 0 && passNum <= 100 ? { percentage_to_pass: passNum } : {}),
            ...(typeof req.body.display_answers === 'string' ? { display_answers: req.body.display_answers } : {}),
            ...(req.body.credits !== undefined ? { credits: Number(req.body.credits) } : {}),
            ...(req.body.stars !== undefined ? { stars: Number(req.body.stars) } : {}),
            ...(req.body.badges !== undefined ? { badges: Number(req.body.badges) } : {}),
            ...(typeof req.body.category === 'string' ? { category: req.body.category } : {}),
            ...(req.body.feedbackEnabled !== undefined ? { feedbackEnabled: req.body.feedbackEnabled === true || req.body.feedbackEnabled === 'true' } : {}),
            ...(req.body.shuffle_questions !== undefined ? { shuffle_questions: req.body.shuffle_questions === true || req.body.shuffle_questions === 'true' } : {}),
            ...(req.body.shuffle_options !== undefined ? { shuffle_options: req.body.shuffle_options === true || req.body.shuffle_options === 'true' } : {}),
            ...(typeof thumbnail === 'string' ? { thumbnail: thumbnail } : {}),
        };

        let assessment = await OrganizationAssessments.findOneAndUpdate(
            { uuid: req.params.id, organization_id },
            updateDoc,
            { new: true, session }
        );

        // Optionally update related questions if provided
        const qPayload = Array.isArray(req.body.questions) ? req.body.questions : [];
        if (qPayload.length > 0) {
            const newQuestionIds = [];
            await Promise.all(
                qPayload.map(async (q) => {
                    const id = q.id || q.uuid || q._id;
                    if (!id) {
                        // This is a new question - create it
                        try {
                            const type = String(q.type || '').trim();
                            if (!['Multiple Choice', 'Multi Select'].includes(type)) {
                                throw new Error('Invalid type. Allowed: Multiple Choice, Multi Select');
                            }

                            const normalizedCorrect = normalizeCorrectOption(q.correct_option);

                            // Enforce counts based on type
                            if (type === 'Multiple Choice') {
                                if (normalizedCorrect.length !== 1) {
                                    throw new Error('Multiple Choice must have exactly 1 correct option index');
                                }
                            } else if (type === 'Multi Select') {
                                if (normalizedCorrect.length < 1) {
                                    throw new Error('Multi Select must have at least 1 correct option index');
                                }
                            }

                            // Validate options bounds
                            const maxIndex = (q.options || []).length - 1;
                            if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
                                throw new Error('correct_option indexes out of range for provided options');
                            }

                            const instructions = typeof q.instructions === 'string' ? q.instructions : '';

                            const newQuestion = new OrganizationAssessmentQuestion({
                                type: q.type.trim(),
                                question_text: q.question_text.trim(),
                                file_url: q.file_url?.trim() || null,
                                options: q.options,
                                correct_option: normalizedCorrect,
                            });

                            const savedQuestion = await newQuestion.save({ session });
                            newQuestionIds.push(savedQuestion._id);
                        } catch (questionError) {
                            console.error('Failed to create new question:', questionError);
                            throw questionError;
                        }
                        return;
                    }

                    // Existing question - update it
                    const type = typeof q.type === 'string' ? q.type.trim() : undefined;
                    const normalizedCorrect = normalizeCorrectOption(q.correct_option);

                    // Fetch options if not provided (so we can validate bounds)
                    let options = Array.isArray(q.options) ? q.options : undefined;
                    if (!options) {
                        const existing = await OrganizationAssessmentQuestion.findOne({ uuid: id });
                        options = existing ? existing.options : [];
                    }

                    if (type && !['Multiple Choice', 'Multi Select'].includes(type)) {
                        throw new Error('Invalid type. Allowed: Multiple Choice, Multi Select');
                    }

                    // Enforce counts (only if correct_option was provided)
                    if (q.correct_option !== undefined) {
                        const effectiveType = type || (await OrganizationAssessmentQuestion.findOne({ uuid: id }))?.type || 'Multiple Choice';
                        if (effectiveType === 'Multiple Choice') {
                            if (normalizedCorrect.length !== 1) {
                                throw new Error('Multiple Choice must have exactly 1 correct option index');
                            }
                        } else if (effectiveType === 'Multi Select') {
                            if (normalizedCorrect.length < 1) {
                                throw new Error('Multi Select must have at least 1 correct option index');
                            }
                        }
                        const maxIndex = options.length - 1;
                        if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
                            throw new Error('correct_option indexes out of range for provided options');
                        }
                    }

                    // Update OrganizationAssessmentQuestion by uuid or _id
                    const filter = /^[0-9a-fA-F]{24}$/.test(String(id))
                        ? { _id: id }
                        : { uuid: id };

                    await OrganizationAssessmentQuestion.findOneAndUpdate(
                        filter,
                        {
                            ...(typeof q.question_text === 'string' ? { question_text: q.question_text } : {}),
                            ...(Array.isArray(q.options) ? { options: q.options } : {}),
                            ...(q.correct_option !== undefined ? { correct_option: normalizedCorrect } : {}),
                            ...(typeof q.type === 'string' ? { type } : {}),
                            ...(typeof q.file_url === 'string' ? { file_url: q.file_url } : {}),
                        },
                        { new: false, session }
                    );

                    // Push the ObjectId for this existing question
                    const existingDoc = await OrganizationAssessmentQuestion.findOne(filter).select('_id');
                    if (existingDoc) newQuestionIds.push(existingDoc._id);
                })
            );

            // After processing all questions, set the assessment's questions array to the collected ObjectIds
            assessment = await OrganizationAssessments.findOneAndUpdate(
                { uuid: req.params.id, organization_id },
                { $set: { questions: newQuestionIds } },
                { new: true, session }
            );
        }
        await session.commitTransaction();
        transactionCommitted = true; // Mark as committed

        const populated = await OrganizationAssessments.findOne({ uuid: req.params.id, organization_id }).populate('questions');
        await logActivity({
            userId:req.user._id,
            action:"Update",
            details:`Updated assessment ${assessment?.title || req.body.title || 'unknown'}`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"success",
        })

        return res.status(200).json({
            isSuccess: true,
            message: "Assessment updated successfully",
            data: populated || assessment,
        });
    } catch (error) {
        // Only abort if transaction wasn't committed
        if (session && !transactionCommitted) {
            await session.abortTransaction();
        }
        await logActivity({
            userId:req.user._id,
            action:"Update",
            details:`Updated assessment ${req.body.title || 'unknown'}`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"failed",
        })
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to update assessment",
            error: error.message,
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
}
//with transactions
// const editAssessment = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const { id } = req.params;
//       const qPayload = Array.isArray(req.body.questions) ? req.body.questions : [];

//       // Update assessment core details
//       const assessment = await OrganizationAssessments.findOneAndUpdate(
//         { uuid: id },
//         { ...req.body },
//         { new: true, session }
//       );

//       if (!assessment) throw new Error("Assessment not found");

//       const newQuestionIds = [];

//       for (const q of qPayload) {
//         if (q._id) {
//           await OrganizationAssessmentQuestion.findByIdAndUpdate(q._id, q, { new: true, session });
//           newQuestionIds.push(q._id);
//         } else {
//           const newQ = new OrganizationAssessmentQuestion(q);
//           const savedQ = await newQ.save({ session });
//           newQuestionIds.push(savedQ._id);
//         }
//       }

//       // Update question references
//       if (newQuestionIds.length > 0) {
//         assessment.questions = newQuestionIds;
//         await assessment.save({ session });
//       }

//       await session.commitTransaction();
//       session.endSession();

//       const populated = await OrganizationAssessments.findById(assessment._id).populate("questions");
//       res.status(200).json({
//         success: true,
//         message: "Assessment updated successfully",
//         data: populated
//       });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       res.status(500).json({
//         success: false,
//         message: "Failed to update assessment",
//         error: error.message
//       });
//     }
//   };


// const deleteAssessment = async (req, res) => {
//     try {
//         const assessment = await OrganizationAssessments.findOneAndDelete({ uuid: req.params.id })
//         return res.status(200).json({
//             isSuccess: true,
//             message: "Assessment deleted successfully",
//             data: assessment
//         })
//     } catch (error) {
//         return res.status(500).json({
//             isSuccess: false,
//             message: "Failed to delete assessment",
//             error: error.message
//         })
//     }
// }
const deleteAssessment = async (req, res) => {
    let session;
    let transactionCommitted = false; // Track transaction state
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const { id } = req.params;
        const assessment = await OrganizationAssessments.findOne({ uuid: id, organization_id });

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Start MongoDB session
        session = await mongoose.startSession();
        session.startTransaction();

        // Delete all related questions
        await OrganizationAssessmentQuestion.deleteMany({ _id: { $in: assessment.questions } }, { session });

        // Delete the assessment itself
        await OrganizationAssessments.deleteOne({ uuid: id, organization_id }, { session });

        // Commit transaction
        await session.commitTransaction();
        transactionCommitted = true; // Mark as committed

        await logActivity({
            userId:req.user._id,
            action:"Delete",
            details:`Deleted assessment: ${assessment.title}`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"success",
        })

        res.status(200).json({
            success: true,
            message: "Assessment and its questions deleted successfully"
        });
    } catch (error) {
        // Only abort if transaction wasn't committed
        if (session && !transactionCommitted) {
            await session.abortTransaction();
        }
        
        await logActivity({
            userId:req.user._id,
            action:"Delete",
            details:`Failed to delete assessment`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"failed",
        })
        
        res.status(500).json({
            success: false,
            message: "Failed to delete assessment",
            error: error.message
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};


const editQuestion = async (req, res) => {
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const payload = {
            ...(typeof req.body.question_text === 'string' ? { question_text: req.body.question_text } : {}),
            ...(Array.isArray(req.body.options) ? { options: req.body.options } : {}),
            ...(typeof req.body.type === 'string' ? { type: req.body.type.trim() } : {}),
            ...(typeof req.body.file_url === 'string' ? { file_url: req.body.file_url } : {}),
            ...(typeof req.body.instructions === 'string' ? { instructions: req.body.instructions } : {}),
            ...(typeof req.body.shuffle_options === 'boolean' ? { shuffle_options: req.body.shuffle_options } : {}),
        };

        let normalizedCorrect;
        if (req.body.correct_option !== undefined) {
            normalizedCorrect = normalizeCorrectOption(req.body.correct_option);
            payload.correct_option = normalizedCorrect;
        }

        // Fetch current question (to know type/options if not provided)
        const existing = await OrganizationAssessmentQuestion.findOne({ uuid: req.params.id });
        if (!existing) {
            return res.status(404).json({ isSuccess: false, message: 'Question not found' });
        }

        // Verify that the question belongs to an assessment in the user's organization
        const assessment = await OrganizationAssessments.findOne({
            questions: existing._id,
            organization_id
        });

        if (!assessment) {
            return res.status(403).json({ isSuccess: false, message: 'Access denied: Question not found in your organization' });
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

        const question = await OrganizationAssessmentQuestion.findOneAndUpdate(
            { uuid: req.params.id },
            payload,
            { new: true }
        );
        
        await logActivity({
            userId:req.user._id,
            action:"Update",
            details:`Updated question: ${existing.question_text?.substring(0, 50)}...`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"success",
        })
        
        return res.status(200).json({
            isSuccess: true,
            message: "Question updated successfully",
            data: question
        })
    } catch (error) {
        await logActivity({
            userId:req.user._id,
            action:"Update",
            details:`Failed to update question`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"failed",
        })
        
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to update question",
            error: error.message
        })
    }
}

const deleteQuestion = async (req, res) => {
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const question = await OrganizationAssessmentQuestion.findOne({ uuid: req.params.id });

        if (!question) {
            return res.status(404).json({
                isSuccess: false,
                message: "Question not found"
            });
        }

        // Verify that the question belongs to an assessment in the user's organization
        const assessment = await OrganizationAssessments.findOne({
            questions: question._id,
            organization_id
        });

        if (!assessment) {
            return res.status(403).json({ isSuccess: false, message: 'Access denied: Question not found in your organization' });
        }

        const deletedQuestion = await OrganizationAssessmentQuestion.findOneAndDelete({ uuid: req.params.id });

        await logActivity({
            userId:req.user._id,
            action:"Delete",
            details:`Deleted question: ${question.question_text?.substring(0, 50)}...`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"success",
        })

        return res.status(200).json({
            isSuccess: true,
            message: "Question deleted successfully",
            data: deletedQuestion
        })
    } catch (error) {
        await logActivity({
            userId:req.user._id,
            action:"Delete",
            details:`Failed to delete question`,
            userRole:req.user.role,
            ip:req.ip,
            userAgent:req.headers['user-agent'],
            status:"failed",
        })
        
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to delete question",
            error: error.message
        })
    }
}


const searchAssessment = async (req, res) => {
    try {
        const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

        if (!organization_id) {
            return res.status(400).json({ success: false, message: "Organization ID is required" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const { status, category, search = "" } = req.query;

        const filter = {
            organization_id,
            title: { $regex: search, $options: "i" },
            ...(status && { status }),
            ...(category && { category }),
        };

        const total = await OrganizationAssessments.countDocuments(filter);
        const assessments = await OrganizationAssessments.find(filter)
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