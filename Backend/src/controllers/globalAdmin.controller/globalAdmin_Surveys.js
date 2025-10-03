const SurveyResponses = require("../../models/global_surveyResponses_model");
const Surveys = require("../../models/global_surveys_model");
const GlobalSurveyQuestion = require("../../models/global_surveys_Questions_model");
const { v4: uuidv4 } = require("uuid");
const { logGlobalAdminActivity } = require("./globalAdmin_activity");
const GlobalSurveyFeedback = require("../../models/global_surveys_feedback");


/// aligned with new question and survey models
const createSurvey = async (req, res) => {
  try {
    const { title, description, questions, created_by, tags = [], team, subteam, status,feedback } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "At least one question is required" });
    }

    // Validate questions per new schema: type, options, total_points, instructions
    for (const q of questions) {
      if (!q.type || !["Multiple Choice", "Multi Select"].includes(q.type)) {
        return res.status(400).json({ success: false, message: "Invalid question type. Use 'Multiple Choice' or 'Multi Select'" });
      }
      if (!q.question_text || !q.question_text.trim()) {
        return res.status(400).json({ success: false, message: "question_text is required for all questions" });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ success: false, message: "Each question must have at least two options" });
      }
    }

    const createdQuestions = await GlobalSurveyQuestion.insertMany(
      questions.map((q) => {
        const options = Array.isArray(q.options)
          ? q.options.map(o => (o || '').trim()).filter(Boolean)
          : [];
        const header = (q.instruction_header || '').trim();
        const text = (q.instruction_text || '').trim();
        const combined = (typeof q.instructions === 'string' && q.instructions.trim())
          ? q.instructions.trim()
          : [header, text].filter(Boolean).join('\n\n');
        return ({
          question_text: q.question_text.trim(),
          type: q.type,
          options,
          instructions: combined,
          instruction_header: header,
          instruction_text: text,
        });
      })
    );

    const questionIds = createdQuestions.map((q) => q._id);

    const surveyDoc = {
      uuid: uuidv4(),
      title: title.trim(),
      description,
      questions: questionIds,
      tags: Array.isArray(tags) ? tags : [],
      status: 'Draft', // Always set status to Draft
      ...(team ? { team } : {}),
      ...(subteam ? { subteam } : {}),
      ...(created_by ? { created_by } : {}),
    };
    // feedback create
    const feedbackPayload = {
      instructionTop: feedback?.instructionTop || "",
      instruction_header_top: feedback?.instruction_header_top || "",
      question_text: feedback?.question_text || "",
      instructionBottom: feedback?.instructionBottom || "",
      //instruction_header_bottom: feedback?.instruction_header_bottom || "",
    };
    if ([feedbackPayload.instructionTop, feedbackPayload.question_text, feedbackPayload.instructionBottom].some(s => (s || "").trim() !== "")) {
      const fb = await GlobalSurveyFeedback.create(feedbackPayload);
      surveyDoc.feedback = fb._id;
    }
    const survey = await Surveys.create(surveyDoc);

    await logGlobalAdminActivity(req, "Create Survey", "survey", `Survey created successfully ${survey.title}`);

    return res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: survey,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create survey",
      error: error.message,
    });
  }
};


// const editSurvey = async (req, res) => {
//   try {
//     const { title, description, questions, created_by, tags, team, subteam, status } = req.body;

//     let questionIds = [];

//     if (Array.isArray(questions) && questions.length > 0) {
//       for (const q of questions) {
//         // Validate per new schema
//         if (!q.type || !["Multiple Choice", "Multi Select"].includes(q.type)) {
//           return res.status(400).json({ success: false, message: "Invalid question type. Use 'Multiple Choice' or 'Multi Select'" });
//         }
//         if (!q.question_text || !q.question_text.trim()) {
//           return res.status(400).json({ success: false, message: "question_text is required for all questions" });
//         }
//         if (!Array.isArray(q.options) || q.options.length < 2) {
//           return res.status(400).json({ success: false, message: "Each question must have at least two options" });
//         }

//         if (q._id) {
//           const updated = await GlobalSurveyQuestion.findByIdAndUpdate(
//             q._id,
//             {
//               question_text: q.question_text.trim(),
//               type: q.type,
//               options: q.options,
//               //total_points: typeof q.total_points === 'number' ? q.total_points : 1,
//               instructions: typeof q.instructions === 'string' ? q.instructions : '',
//             },
//             { new: true }
//           );
//           questionIds.push(updated._id);
//         } else {
//           const newQ = await GlobalSurveyQuestion.create({
//             question_text: q.question_text.trim(),
//             type: q.type,
//             options: q.options,
//             //total_points: typeof q.total_points === 'number' ? q.total_points : 1,
//             instructions: typeof q.instructions === 'string' ? q.instructions : '',
//           });
//           questionIds.push(newQ._id);
//         }
//       }
//     }

//     const updatedSurvey = await Surveys.findOneAndUpdate(
//       { uuid: req.params.id },
//       {
//         ...(title ? { title: title.trim() } : {}),
//         ...(description ? { description } : {}),
//         ...(questionIds.length > 0 ? { questions: questionIds } : {}),
//         ...(Array.isArray(tags) ? { tags } : {}),
//         ...(team ? { team } : {}),
//         ...(subteam ? { subteam } : {}),
//         ...(status ? { status } : {}),
//         ...(created_by ? { created_by } : {}),
//       },
//       { new: true }
//     ).populate("questions");

//     if (!updatedSurvey) {
//       return res.status(404).json({ success: false, message: "Survey not found" });
//     }

//     await logGlobalAdminActivity(req, "Edit Survey", "survey", `Survey updated successfully ${updatedSurvey.title}`);

//     return res.status(200).json({
//       success: true,
//       message: "Survey updated successfully",
//       data: { updatedSurvey, questions },
//     });

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update survey",
//       error: error.message,
//     });
//   }
// };

////////////////////////
// const createSurvey = async (req, res) => {
//   try {
//     const { title, description, questions, survey_type, start_date, end_date, is_active, created_by } = req.body;

//     // Insert questions with info_text support
//     const createdQuestions = await GlobalSurveyQuestion.insertMany(
//       questions.map(q => ({
//         info_text: q.info_text || null, // ✅ include info_text
//         question_text: q.question_text || "", // keep empty string if info only
//         question_type: q.question_type,
//         options: q.options || [],
//         position: q.position || 0,
//       }))
//     );

//     const questionIds = createdQuestions.map(q => q._id);

//     // Create survey
//     const survey = await Surveys.create({
//       uuid: uuidv4(),
//       title,
//       description,
//       questions: questionIds,
//       survey_type,
//       start_date,
//       end_date,
//       is_active,
//       created_by,
//     });

//     await logGlobalAdminActivity(req, "Create Survey", "survey", `Survey created successfully ${survey.title}`);

//     return res.status(201).json({
//       success: true,
//       message: "Survey created successfully",
//       data: survey,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create survey",
//       error: error.message,
//     });
//   }
// };

// const editSurvey = async (req, res) => {
//   try {
//     const { title, description, questions, survey_type, start_date, end_date, is_active, created_by } = req.body;

//     let questionIds = [];

//     if (questions && questions.length > 0) {
//       for (const q of questions) {
//         if (q._id) {
//           // Update existing question with info_text
//           const updated = await GlobalSurveyQuestion.findByIdAndUpdate(
//             q._id,
//             {
//               info_text: q.info_text || null,
//               question_text: q.question_text || "",
//               question_type: q.question_type,
//               options: q.options || [],
//               position: q.position || 0,
//             },
//             { new: true }
//           );
//           questionIds.push(updated._id);
//         } else {
//           // Create new question
//           const newQ = await GlobalSurveyQuestion.create({
//             info_text: q.info_text || null,
//             question_text: q.question_text || "",
//             question_type: q.question_type,
//             options: q.options || [],
//             position: q.position || 0,
//           });
//           questionIds.push(newQ._id);
//         }
//       }
//     }

//     const updatedSurvey = await Surveys.findOneAndUpdate(
//       { uuid: req.params.id },
//       {
//         ...(title && { title }),
//         ...(description && { description }),
//         ...(questionIds.length > 0 && { questions: questionIds }),
//         ...(survey_type && { survey_type }),
//         ...(start_date && { start_date: new Date(start_date) }),
//         ...(end_date && { end_date: new Date(end_date) }),
//         ...(is_active !== undefined && { is_active }),
//         ...(created_by && { created_by }),
//       },
//       { new: true }
//     ).populate("questions");

//     if (!updatedSurvey) {
//       return res.status(404).json({
//         success: false,
//         message: "Survey not found",
//       });
//     }

//     await logGlobalAdminActivity(req, "Edit Survey", "survey", `Survey updated successfully ${updatedSurvey.title}`);

//     return res.status(200).json({
//       success: true,
//       message: "Survey updated successfully",
//       data: { updatedSurvey, questions },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update survey",
//       error: error.message,
//     });
//   }
// };

//new code for surveys with feedback
const editSurvey = async (req, res) => {
  try {
    const { title, description, questions, created_by, tags, team, subteam, status, feedback } = req.body;

    const survey = await Surveys.findOne({ uuid: req.params.id });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });

    // Build questionIds if questions provided
    let questionIds = [];
    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        if (!q.type || !["Multiple Choice", "Multi Select"].includes(q.type)) {
          return res.status(400).json({ success: false, message: "Invalid question type. Use 'Multiple Choice' or 'Multi Select'" });
        }
        if (!q.question_text || !q.question_text.trim()) {
          return res.status(400).json({ success: false, message: "question_text is required for all questions" });
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({ success: false, message: "Each question must have at least two options" });
        }

        const options = Array.isArray(q.options)
          ? q.options.map(o => (o || '').trim()).filter(Boolean)
          : [];
        const header = (q.instruction_header || '').trim();
        const text = (q.instruction_text || '').trim();
        const combined = (typeof q.instructions === 'string' && q.instructions.trim())
          ? q.instructions.trim()
          : [header, text].filter(Boolean).join('\n\n');

        if (q._id) {
          const updated = await GlobalSurveyQuestion.findByIdAndUpdate(
            q._id,
            {
              question_text: q.question_text.trim(),
              type: q.type,
              options,
              instructions: combined,
              instruction_header: header,
              instruction_text: text,
            },
            { new: true }
          );
          questionIds.push(updated._id);
        } else {
          const newQ = await GlobalSurveyQuestion.create({
            question_text: q.question_text.trim(),
            type: q.type,
            options,
            instructions: combined,
            instruction_header: header,
            instruction_text: text,
          });
          questionIds.push(newQ._id);
        }
      }
    }

    // Assign fields on instance
    if (title) survey.title = title.trim();
    if (description) survey.description = description;
    if (Array.isArray(tags)) survey.tags = tags;
    if (team) survey.team = team;
    if (subteam) survey.subteam = subteam;
    survey.status = 'Draft'; // Always set status to Draft
    if (created_by) survey.created_by = created_by;
    if (questionIds.length > 0) survey.questions = questionIds;

    // Feedback upsert (your block)
    if (feedback) {
      const feedbackPayload = {
        instructionTop: feedback?.instructionTop || "",
        instruction_header_top: feedback?.instruction_header_top || "",
        question_text: feedback?.question_text || "",
        instructionBottom: feedback?.instructionBottom || "",
        //instruction_header_bottom: feedback?.instruction_header_bottom || "",
      };
      const hasContent = [feedbackPayload.instructionTop, feedbackPayload.question_text, feedbackPayload.instructionBottom]
        .some(s => (s || "").trim() !== "");

      if (hasContent) {
        if (survey.feedback) {
          await GlobalSurveyFeedback.findByIdAndUpdate(survey.feedback, feedbackPayload, { new: true });
        } else {
          const fb = await GlobalSurveyFeedback.create(feedbackPayload);
          survey.feedback = fb._id;
        }
      } else {
        // Optional: clear feedback when user wipes all fields
        // survey.feedback = null;
      }
    }

    await survey.save();
    const updatedSurvey = await Surveys.findById(survey._id)
      .populate("questions")
      .populate("feedback");

    if (!updatedSurvey) {
      return res.status(404).json({ success: false, message: "Survey not found" });
    }

    await logGlobalAdminActivity(req, "Edit Survey", "survey", `Survey updated successfully ${updatedSurvey.title}`);

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: { updatedSurvey, questions },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update survey",
      error: error.message,
    });
  }
};

const deleteSurvey = async(req, res) => {
    try {
        const deletedSurvey = await Surveys.findOneAndDelete({ uuid: req.params.id });
        if (!deletedSurvey) {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            })
        }
        await logGlobalAdminActivity(req,"Delete Survey","survey",`Survey deleted successfully ${deletedSurvey.title}`)
        return res.status(200).json({
            success: true,
            message: 'Survey deleted successfully',
            data: deletedSurvey,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete survey',
            error: error.message,
        });
    }
}

const getSurveys = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const surveys = await Surveys.find().skip(skip).limit(limit).populate("questions").populate('feedback');;
        const total = await Surveys.countDocuments()
        // await logGlobalAdminActivity(req,"Get Surveys","survey","Surveys fetched successfully")
        return res.status(200).json({
            success: true,
            message: 'Surveys fetched successfully',
            data: surveys,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch surveys',
            error: error.message,
        });
    }
}

const viewResponse = async(req, res) => {
    try {
        const response = await SurveyResponses.findById(req.params.id)
        // await logGlobalAdminActivity(req,"View Response","survey",`Response fetched successfully ${response.title}`)
        return res.status(200).json({
            success: true,
            message: "Response fetched successfully",
            data: response
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch response",
            error: error.message
        })
    }
}
const viewResponses = async(req, res) => {
    try {
        const responses = await SurveyResponses.find()
        // await logGlobalAdminActivity(req,"View Responses","survey","Responses fetched successfully")
        return res.status(200).json({
            success: true,
            message: "Responses fetched successfully",
            data: responses
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch responses",
            error: error.message
        })
    }
}
const getSurvey = async(req, res) => {
    try {
        const survey = await Surveys.findOne({uuid: req.params.id}).populate('questions').populate("feedback");
        // await logGlobalAdminActivity(req,"Get Survey","survey",`Survey fetched successfully ${survey.title}`)
        return res.status(200).json({
            success: true,
            message: "Survey fetched successfully",
            data: survey
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch survey",
            error: error.message
        })
    }
}

module.exports = {
    createSurvey,
    editSurvey,
    deleteSurvey,
    getSurveys,
    viewResponse,
    viewResponses,
    getSurvey
}