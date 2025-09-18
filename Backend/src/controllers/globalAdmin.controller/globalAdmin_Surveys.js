const SurveyResponses = require("../../models/global_surveyResponses_model");
const Surveys = require("../../models/global_surveys_model");
const GlobalSurveyQuestion = require("../../models/global_surveys_Questions_model");
const { v4: uuidv4 } = require("uuid");
const { logGlobalAdminActivity } = require("./globalAdmin_activity");


// // Zod validation
// const createSurveySchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   description: z.string().nullable().optional(),
//   questions: z
//     .array(
//       z.object({
//         question_text: z.string().min(1, "Question text is required"),
//         question_type: z.enum(["text", "rating", "multiple_choice"]),
//         options: z.array(z.string()).optional(),
//         position: z.number().optional(),
//       })
//     )
//     .nonempty("At least one question is required"),
//   survey_type: z.enum(["text", "rating", "multiple_choice"]),
//   start_date: z.string().transform(val => new Date(val)).nullable().optional(),
//   end_date: z.string().transform(val => new Date(val)).nullable().optional(),
//   is_active: z.boolean().default(true),
//   created_by: z.string().nullable().optional(),
// });

//  const editSurveySchema = createSurveySchema.partial();

// Create Survey
const createSurvey = async (req, res) => {
   try {
    // const parsed = createSurveySchema.safeParse(req.body);
    // if (!parsed.success) {
    //   console.log(parsed.error)
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation error",
    //     errors: parsed.error.errors,
    //   });
    // }

    const { title, description, questions, survey_type, start_date, end_date, is_active, created_by } = req.body;

    // Insert questions
    const createdQuestions = await GlobalSurveyQuestion.insertMany(questions);
    const questionIds = createdQuestions.map(q => q._id);

    // Create survey
    const survey = await Surveys.create({
      uuid: uuidv4(),
      title,
      description,
      questions: questionIds,
      survey_type,
      start_date,
      end_date,
      is_active,
      created_by,
    });
    await logGlobalAdminActivity(req,"Create Survey","survey",`Survey created successfully ${survey.title}`)
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

// Edit Survey
const editSurvey = async (req, res) => {
  try {
    // const parsed = editSurveySchema.safeParse(req.body);
    // if (!parsed.success) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation error",
    //     errors: parsed.error.errors,
    //   });
    // }

    const { title, description, questions, survey_type, start_date, end_date, is_active, created_by } = req.body;

    let questionIds = [];

    if (questions && questions.length > 0) {
      for (const q of questions) {
        if (q._id) {
          // Update existing question
          const updated = await GlobalSurveyQuestion.findByIdAndUpdate(
            q._id,
            { question_text: q.question_text, question_type: q.question_type, options: q.options || [], position: q.position || 0 },
            { new: true }
          );
          questionIds.push(updated._id);
        } else {
          // Create new question
          const newQ = await GlobalSurveyQuestion.create(q);
          questionIds.push(newQ._id);
        }
      }
    }

    // const updatedSurvey = await Surveys.findOneAndUpdate(
    //   { uuid: req.params.id },
    //   {
    //     ...(title && { title }),
    //     ...(description && { description }),
    //     ...(questionIds.length > 0 && { questions: questionIds }),
    //     ...(survey_type && { survey_type }),
    //     ...(start_date && { start_date }),
    //     ...(end_date && { end_date }),
    //     ...(is_active !== undefined && { is_active }),
    //     ...(created_by && { created_by }),
    //   },
    //   { new: true }
    // );
    const updatedSurvey = await Surveys.findOneAndUpdate(
  { uuid: req.params.id },
  {
    ...(title && { title }),
    ...(description && { description }),
    ...(questionIds.length > 0 && { questions: questionIds }),
    ...(survey_type && { survey_type }),
    ...(start_date && { start_date: new Date(start_date) }),
    ...(end_date && { end_date: new Date(end_date) }),
    ...(is_active !== undefined && { is_active }),
    ...(created_by && { created_by }),
  },
  { new: true }
).populate("questions"); // <-- add this
 

    if (!updatedSurvey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }
    await logGlobalAdminActivity(req,"Edit Survey","survey",`Survey updated successfully ${updatedSurvey.title}`)
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
        const surveys = await Surveys.find().skip(skip).limit(limit).populate("questions");
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
        const survey = await Surveys.findOne({uuid: req.params.id}).populate('questions')
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