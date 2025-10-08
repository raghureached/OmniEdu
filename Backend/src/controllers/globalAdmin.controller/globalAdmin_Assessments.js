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
// const createAssessment = async (req, res) => {
//     try {
//         const { title, description, sections, status, duration, tags, team, subteam, attempts, unlimited_attempts, percentage_to_pass, display_answers, display_answers_when } = req.body;
//         if (!title || !sections || !Array.isArray(sections) || sections.length === 0) {
//             return res.status(400).json({
//                 isSuccess: false,
//                 message: "Title and sections are required"
//             });
//         }

//         if (!Array.isArray(tags) || tags.length === 0) {
//             return res.status(400).json({ isSuccess: false, message: "Tags (array) are required" });
//         }
//         if (!duration || typeof duration !== "string") {
//             return res.status(400).json({ isSuccess: false, message: "Duration (string) is required" });
//         }
//         if (!team) {
//             return res.status(400).json({ isSuccess: false, message: "Team is required" });
//         }
//         if (!subteam) {
//             return res.status(400).json({ isSuccess: false, message: "SubTeam is required" });
//         }
//         const unlimited = Boolean(unlimited_attempts);
//         const attemptsNum = unlimited ? 1 : (Number.isFinite(Number(attempts)) ? Math.max(1, Number(attempts)) : 1);
//         const passPct = Number(percentage_to_pass);
//         if (!Number.isFinite(passPct) || passPct < 0 || passPct > 100) {
//             return res.status(400).json({ isSuccess: false, message: "percentage_to_pass must be between 0 and 100" });
//         }

//         // Validate duration format HH:MM (optional but safer)
//         if (!duration || typeof duration !== 'string' || !isValidDuration(duration)) {
//             return res.status(400).json({
//                 isSuccess: false,
//                 message: 'Duration must be a string in HH:MM format',
//             });
//         }
//         const errors = [];
        
//         const validQuestions = [];

//         // Validate each question
//         questions.forEach((q, index) => {
//             try {
//                 if (!q.type || !q.question_text) {
//                     errors.push({ index, reason: "Missing type or question text" });
//                     return;
//                 }


//                 if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
//                     errors.push({ index, reason: "Options must be a non-empty array" });
//                     return;
//                 }

//                 if (q.correct_option === undefined || q.correct_option === null ||
//                     (Array.isArray(q.correct_option) && q.correct_option.length === 0)) {
//                     errors.push({ index, reason: "Missing or invalid correct_option" });
//                     return;
//                 }
//                 const type = String(q.type || '').trim();
//                 if (!['Multiple Choice', 'Multi Select'].includes(type)) {
//                     errors.push({ index, reason: 'Invalid type. Allowed: Multiple Choice, Multi Select' });
//                     return;
//                 }

//                 // Normalize correct_option to array of ints
//                 const normalizedCorrect = normalizeCorrectOption(q.correct_option);

//                 // Enforce counts based on type
//                 if (type === 'Multiple Choice') {
//                     if (normalizedCorrect.length !== 1) {
//                         errors.push({ index, reason: 'Multiple Choice must have exactly 1 correct option index' });
//                         return;
//                     }
//                 } else if (type === 'Multi Select') {
//                     if (normalizedCorrect.length < 1) { // set to < 2 if you want strictly multiple
//                         errors.push({ index, reason: 'Multi Select must have at least 1 correct option index' });
//                         return;
//                     }
//                 }

//                 // Also ensure correct indexes are within options bounds
//                 const maxIndex = (q.options || []).length - 1;
//                 if (normalizedCorrect.some(n => n < 0 || n > maxIndex)) {
//                     errors.push({ index, reason: 'correct_option indexes out of range for provided options' });
//                     return;
//                 }

//                 // DO NOT require instructions; just normalize
//                 const instructions = typeof q.instructions === 'string' ? q.instructions : '';

//                 validQuestions.push({
//                     type: q.type.trim(),
//                     question_text: q.question_text.trim(),
//                     file_url: q.file_url?.trim() || null,
//                     options: q.options,
//                     correct_option: normalizedCorrect,
//                     instructions: q.instructions?.trim() || "", // NEW
//                     shuffle_options: Boolean(q.shuffle_options), // NEW
//                 });
//             } catch (questionError) {
//                 errors.push({ index, reason: `Question validation failed: ${questionError.message}` });
//                 return res.status(400).json({
//                     isSuccess: false,
//                     message: "Invalid question format",
//                     errors
//                 });
//             }
//         });

//         if (validQuestions.length === 0) {
//             return res.status(400).json({
//                 isSuccess: false,
//                 message: "No valid questions found",
//                 errors
//             });
//         }
//         if (errors.length > 0) {
//             return res.status(400).json({
//                 isSuccess: false,
//                 message: "Invalid question format",
//                 errors
//             });
//         }

//         const savedQuestions = await GlobalQuestion.insertMany(validQuestions, { ordered: false });
//         const assessment = new GlobalAssessment({
//             title,
//             description: description || "",
//             questions: savedQuestions.map(q => q._id),
//             tags,
//             duration,
//             team,
//             subteam,
//             attempts: attemptsNum,
//             unlimited_attempts: unlimited,
//             percentage_to_pass: passPct,
//             display_answers: display_answers ?? false,
//             display_answers_when: display_answers_when || "Never",
//             created_by: req.user?._id,
//             status,
//         });

//         await assessment.save();
//         res.status(201).json({
//             isSuccess: true,
//             message: "Assessment created successfully",
//             data: assessment,
//             errors
//         });

//     } catch (error) {
//         console.error("Error creating assessment:", error);
//         res.status(500).json({ isSuccess: false, message: error.message });
//     }
// };


// Create a full Assessment with Sections + Question

// Controller for creating assessment
const createAssessment = async (req, res) => {
    try {
      const {
        title, description, tags, duration, team, subteam,
        attempts, unlimited_attempts, percentage_to_pass,
        display_answers, display_answers_when, status,
        classification, created_by, sections
      } = req.body;
  
      if (!title) return res.status(400).json({ success: false, message: "Title is required" });
      if (!sections || !Array.isArray(sections)) return res.status(400).json({ success: false, message: "Sections are required" });
  
      const sectionIds = [];
      const parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections;
  
      for (let secIndex = 0; secIndex < parsedSections.length; secIndex++) {
        const section = parsedSections[secIndex];
        const questionIds = [];
  
        for (let qIndex = 0; qIndex < (section.questions || []).length; qIndex++) {
          const question = section.questions[qIndex];
  
          // Map file if uploaded
          let file_url = null;
          const fieldName = `sections[${secIndex}][questions][${qIndex}][file]`;
          if (req.uploadedFiles && req.uploadedFiles[fieldName]) {
            file_url = req.uploadedFiles[fieldName][0].url; // only 1 file per question
          }
  
          const newQuestion = new GlobalQuestion({
            question_text: question.question_text,
            type: question.type,
            options: question.options || [],
            correct_option: question.correct_option || [],
            total_points: question.total_points || 1,
            instructions: question.instructions || "",
            shuffle_options: question.shuffle_options || false,
            file_url,
          });
  
          const savedQuestion = await newQuestion.save();
          questionIds.push(savedQuestion._id);
        }
  
        const newSection = new GlobalAssesmentSection({
          title: section.title,
          description: section.description,
          questions: questionIds,
        });
  
        const savedSection = await newSection.save();
        sectionIds.push(savedSection._id);
      }
  
      const newAssessment = new GlobalAssessments({
        title, description, tags, duration, team, subteam,
        attempts, unlimited_attempts, percentage_to_pass,
        display_answers, display_answers_when, status,
        classification, created_by, sections: sectionIds,
      });
  
      const savedAssessment = await newAssessment.save();
  
      const populatedAssessment = await GlobalAssessments.findById(savedAssessment._id)
        .populate({ path: "sections", populate: { path: "questions" } });
  
      res.status(201).json({
        success: true,
        message: "Assessment created successfully",
        assessment: populatedAssessment,
      });
  
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ success: false, message: "Failed to create assessment", error: error.message });
    }
  };
  



const csv = require("csv-parser");
const GlobalAssesmentSection = require("../../models/globalAssesment_section_model");
const GlobalAssessments = require("../../models/globalAssessments_model");


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
        const assessments = await GlobalAssessment.find().skip((page - 1) * limit).limit(limit).populate("questions")
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
        const assessment = await GlobalAssessment.findOne({ uuid: req.params.id }).populate({
            path: "sections",
            populate: {
              path: "questions",
              model: "GlobalQuestion",
            },
        })
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

                            const newQuestion = new GlobalQuestion({
                                type: q.type.trim(),
                                question_text: q.question_text.trim(),
                                file_url: q.file_url?.trim() || null,
                                options: q.options,
                                correct_option: normalizedCorrect,
                                instructions,
                                shuffle_options: Boolean(q.shuffle_options),
                            });

                            const savedQuestion = await newQuestion.save();

                            // Add the new question to the assessment
                            await GlobalAssessment.findOneAndUpdate(
                                { uuid: req.params.id },
                                { $push: { questions: savedQuestion._id } }
                            );
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
                            if (normalizedCorrect.length < 1) {
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

                    await GlobalQuestion.findOneAndUpdate(
                        filter,
                        {
                            ...(typeof q.question_text === 'string' ? { question_text: q.question_text } : {}),
                            ...(Array.isArray(q.options) ? { options: q.options } : {}),
                            ...(q.correct_option !== undefined ? { correct_option: normalizedCorrect } : {}),
                            ...(typeof q.type === 'string' ? { type } : {}),
                            ...(typeof q.file_url === 'string' ? { file_url: q.file_url } : {}),
                            ...(typeof q.instructions === 'string' ? { instructions: q.instructions } : {}),
                            ...(typeof q.shuffle_options === 'boolean' ? { shuffle_options: q.shuffle_options } : {}),
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
            ...(typeof req.body.shuffle_options === 'boolean' ? { shuffle_options: req.body.shuffle_options } : {}),
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