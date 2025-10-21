const SurveyResponses = require("../../models/global_surveyResponses_model");
const Surveys = require("../../models/global_surveys_model");
const GlobalSurveyQuestion = require("../../models/global_surveys_Questions_model");
const { v4: uuidv4 } = require("uuid");
const { logGlobalAdminActivity } = require("./globalAdmin_activity");
const GlobalSurveyFeedback = require("../../models/global_surveys_feedback");
const GlobalSurveySection = require("../../models/globalSurvey_Section_model");


/// aligned with new question and survey models, with adapter for `elements`
const mongoose = require("mongoose");

const createSurvey = async (req, res) => {
  let session;
  try {
    const { title, description, sections, tags = [], team, subteam, status } = req.body;
   console.log("log in surveys controller:",req.body)
    const created_by = req.user?.id || req.body.created_by; // Ensure created_by is passed or derived

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ success: false, message: "At least one section is required" });
    }

    // Start MongoDB session
    session = await mongoose.startSession();
    session.startTransaction();

    let sectionsIDs = [];

    for (const section of sections) {
      if (!section.questions || !Array.isArray(section.questions)) {
        throw new Error("Each section must contain a 'questions' array");
      }

      const questionIds = [];

      // Create questions inside the transaction
      for (const question of section.questions) {
        const createdQuestion = await GlobalSurveyQuestion.create([question], { session });
        questionIds.push(createdQuestion[0]._id);
      }

      // Create section linked with questions
      const createdSection = await GlobalSurveySection.create(
        [{ description: section.description, questions: questionIds }],
        { session }
      );

      sectionsIDs.push(createdSection[0]._id);
    }
    //const createdFeedback = await GlobalSurveyFeedback.create(feedback, { session });
    // Create the final survey document
    const createdSurvey = await Surveys.create(
      [
        {
          title,
          description,
          sections: sectionsIDs,
          created_by,
          tags,
          team,
          subteam,
          status,
         //feedback: createdFeedback[0]._id,
        },
      ],
      { session }
    );  
    // Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: createdSurvey[0],
    });
  } catch (error) {
    // Rollback if anything fails
    if (session) {
      await session.abortTransaction();
    }

    console.error("Error creating survey:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create survey",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
const editSurvey = async (req, res) => {
  let session;
  try {
    const { title, description, sections, tags = [], team, subteam, status} = req.body;
    const surveyUUID = req.params.id;

    const survey = await Surveys.findOne({ uuid: surveyUUID }).populate("sections");
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found" });
    }

    // Start MongoDB session
    session = await mongoose.startSession();
    session.startTransaction();

    // Validate
    if (!title || !title.trim()) {
      throw new Error("Title is required");
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      throw new Error("At least one section is required");
    }

    // --- DELETE OLD SECTIONS & QUESTIONS ---
    if (Array.isArray(survey.sections) && survey.sections.length > 0) {
      const sectionIds = survey.sections.map((s) => s._id);
      const oldSections = await GlobalSurveySection.find({ _id: { $in: sectionIds } });
      const questionIdsToDelete = oldSections.flatMap((sec) => sec.questions);
      if (questionIdsToDelete.length > 0) {
        await GlobalSurveyQuestion.deleteMany({ _id: { $in: questionIdsToDelete } }, { session });
      }
      await GlobalSurveySection.deleteMany({ _id: { $in: sectionIds } }, { session });
    }

    // --- CREATE NEW SECTIONS & QUESTIONS ---
    let sectionsIDs = [];

    for (const section of sections) {
      if (!Array.isArray(section.questions) || section.questions.length === 0) {
        throw new Error("Each section must contain at least one question");
      }

      const questionIds = [];

      for (const question of section.questions) {
        if (!question.question_text || !question.question_text.trim()) {
          throw new Error("Each question must have question_text");
        }

        const createdQuestion = await GlobalSurveyQuestion.create(
          [
            {
              question_text: question.question_text.trim(),
              type: question.type,
              options: Array.isArray(question.options)
                ? question.options.map((o) => o.trim()).filter(Boolean)
                : [],
             
            },
          ],
          { session }
        );

        questionIds.push(createdQuestion[0]._id);
      }
      // const createdFeedback = await GlobalSurveyFeedback.create(feedback, { session });  

      const createdSection = await GlobalSurveySection.create(
        [
          {
            description: section.description || "",
            questions: questionIds,
          },
        ],
        { session }
      );

      sectionsIDs.push(createdSection[0]._id);
    }
    // --- UPDATE SURVEY MAIN FIELDS ---
    survey.title = title.trim();
    survey.description = description;
    survey.sections = sectionsIDs;
    survey.tags = tags;
    survey.team = team;
    survey.subteam = subteam;
    survey.status = status || "Draft";
    await survey.save({ session });

    // Commit transaction
    await session.commitTransaction();

    const updatedSurvey = await Surveys.findById(survey._id)
      .populate({
        path: "sections",
        populate: { path: "questions" },
      })
     

    await logGlobalAdminActivity(req, "Edit Survey", "survey", `Survey updated successfully ${updatedSurvey.title}`);

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: updatedSurvey,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Error updating survey:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update survey",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
};


const deleteSurvey = async (req, res) => {
  let session;
  try {
    // Start MongoDB transaction
    session = await mongoose.startSession();
    session.startTransaction();

    const survey = await Surveys.findOne({ uuid: req.params.id })
      .populate("sections")
     

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    // --- Step 1: Delete questions under each section ---
    if (Array.isArray(survey.sections) && survey.sections.length > 0) {
      const sectionIds = survey.sections.map((s) => s._id);
      const sections = await GlobalSurveySection.find({ _id: { $in: sectionIds } });
      const questionIds = sections.flatMap((section) => section.questions);

      if (questionIds.length > 0) {
        await GlobalSurveyQuestion.deleteMany({ _id: { $in: questionIds } }, { session });
      }

      // --- Step 2: Delete sections ---
      await GlobalSurveySection.deleteMany({ _id: { $in: sectionIds } }, { session });
    }

    // --- Step 3: Delete feedback (if any) ---
    // if (survey.feedback) {
    //   await GlobalSurveyFeedback.findByIdAndDelete(survey.feedback._id, { session });
    // }

    // --- Step 4: Delete the survey itself ---
    const deletedSurvey = await Surveys.findOneAndDelete({ uuid: req.params.id }, { session });

    await session.commitTransaction();

    // --- Step 5: Log admin activity ---
    await logGlobalAdminActivity(
      req,
      "Delete Survey",
      "survey",
      `Survey deleted successfully: ${deletedSurvey.title}`
    );

    return res.status(200).json({
      success: true,
      message: "Survey deleted successfully",
      data: deletedSurvey,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Error deleting survey:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete survey",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
};

const getSurveys = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Fetch all surveys with sections → questions → feedback
    const surveys = await Surveys.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "sections",
        populate: {
          path: "questions",
          model: "GlobalSurveyQuestion",
        },
      })
      // .populate("feedback")
      .lean(); // lean() for faster response and smaller payload

    const total = await Surveys.countDocuments();

    // Optional: sort sections or questions by order before sending
    const sortedSurveys = surveys.map((survey) => ({
      ...survey,
      sections: (survey.sections || [])
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          ...section,
          questions: (section.questions || []).sort((a, b) => a.order - b.order),
        })),
    }));

    return res.status(200).json({
      success: true,
      message: "Surveys fetched successfully",
      data: sortedSurveys,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch surveys",
      error: error.message,
    });
  }
};


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
const getSurvey = async (req, res) => {
  try {
    const survey = await Surveys.findOne({ uuid: req.params.id })
      .populate({
        path: "sections",
        populate: {
          path: "questions",
          model: "GlobalSurveyQuestion",
        },
      })
      // .populate("feedback");

    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found" });
    }

    // Reconstruct unified elements array from nested structure
    const elements = [];

    for (const section of survey.sections || []) {
      // Add section descriptor
      elements.push({
        type: "section",
        description: section.description || "",
      });

      // Add questions within this section
      for (const q of section.questions || []) {
     
          elements.push({
            type: "question",
            question_type: q.type,
            question_text: q.question_text || "",
            options: Array.isArray(q.options) ? q.options : [],
          });
        
      }
    }


    return res.status(200).json({
      success: true,
      message: "Survey fetched successfully",
      data: {
        ...survey.toObject(),
        elements, // Flattened structure for front-end compatibility
      },
    });
  } catch (error) {
    console.error("Error fetching survey:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch survey",
      error: error.message,
    });
  }
};


module.exports = {
    createSurvey,
    editSurvey,
    deleteSurvey,
    getSurveys,
    viewResponse,
    viewResponses,
    getSurvey
}