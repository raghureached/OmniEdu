const OrganizationSurveyResponses = require("../../models/organizationSurveyResponses_model");
const OrganizationSurveys = require("../../models/organizationSurveys_model");
const OrganizationSurveyQuestion = require("../../models/organizationSurveysQuestions_model");
const { v4: uuidv4 } = require("uuid");
const GlobalSurveyFeedback = require("../../models/global_surveys_feedback");
const OrganizationSurveySection = require("../../models/organizationSurveySection_model");
const LearningPath = require("../../models/learningPath_model");
const { logActivity } = require("../../utils/activityLogger");

/// aligned with new question and survey models, with adapter for `elements`
const mongoose = require("mongoose");
const ForUserAssignment = require("../../models/forUserAssigments_model");
const UserContentProgress = require("../../models/userContentProgress_model");

const createSurvey = async (req, res) => {
  let session;
  let transactionCommitted = false; // Track transaction state
  try {
    const { title, description, sections, tags = [], team, subteam, status, noOfSections, noOfQuestions } = req.body;
   console.log("log in surveys controller:",req.body)
    const created_by = req.user?.id || req.body.created_by; // Ensure created_by is passed or derived
    const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!organization_id) {
      return res.status(400).json({ success: false, message: "Organization ID is required" });
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
        const createdQuestion = await OrganizationSurveyQuestion.create([question], { session });
        questionIds.push(createdQuestion[0]._id);
      }

      // Create section linked with questions
      const createdSection = await OrganizationSurveySection.create(
        [{ description: section.description, questions: questionIds }],
        { session }
      );

      sectionsIDs.push(createdSection[0]._id);
    }
    //const createdFeedback = await GlobalSurveyFeedback.create(feedback, { session });
    // Create the final survey document
    const createdSurvey = await OrganizationSurveys.create(
      [
        {
          organization_id,
          title,
          description,
          sections: sectionsIDs,
          created_by,
          tags,
          team,
          subteam,
          status,
          noOfSections,
          noOfQuestions,
         //feedback: createdFeedback[0]._id,
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    transactionCommitted = true; // Mark as committed

    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Created survey: ${title}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: createdSurvey[0],
    });
  } catch (error) {
    // Only abort if transaction wasn't committed
    if (session && !transactionCommitted) {
      await session.abortTransaction();
    }

    console.error("Error creating survey:", error);

    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Failed to create survey`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

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
  let transactionCommitted = false; // Track transaction state
  try {
    const { title, description, sections, tags = [], team, subteam, status, noOfSections, noOfQuestions } = req.body;
    const surveyUUID = req.params.id;
    const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

    if (!organization_id) {
      return res.status(400).json({ success: false, message: "Organization ID is required" });
    }

    const survey = await OrganizationSurveys.findOne({ uuid: surveyUUID, organization_id }).populate("sections");
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
      const oldSections = await OrganizationSurveySection.find({ _id: { $in: sectionIds } });
      const questionIdsToDelete = oldSections.flatMap((sec) => sec.questions);
      if (questionIdsToDelete.length > 0) {
        await OrganizationSurveyQuestion.deleteMany({ _id: { $in: questionIdsToDelete } }, { session });
      }
      await OrganizationSurveySection.deleteMany({ _id: { $in: sectionIds } }, { session });
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

        const createdQuestion = await OrganizationSurveyQuestion.create(
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

      const createdSection = await OrganizationSurveySection.create(
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
    survey.noOfSections = noOfSections;
    survey.noOfQuestions = noOfQuestions;
    await survey.save({ session });

    // Commit transaction
    await session.commitTransaction();
    transactionCommitted = true; // Mark as committed

    const updatedSurvey = await OrganizationSurveys.findById(survey._id)
      .populate({
        path: "sections",
        populate: { path: "questions" },
      })



    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Updated survey: ${title}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: updatedSurvey,
    });
  } catch (error) {
    // Only abort if transaction wasn't committed
    if (session && !transactionCommitted) {
      await session.abortTransaction();
    }
    console.error("Error updating survey:", error);
    
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Failed to update survey`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
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
  let transactionCommitted = false; // Track transaction state
  try {
    const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

    if (!organization_id) {
      return res.status(400).json({ success: false, message: "Organization ID is required" });
    }

    // Start MongoDB transaction
    session = await mongoose.startSession();
    session.startTransaction();

    const survey = await OrganizationSurveys.findOne({ uuid: req.params.id, organization_id })
      .populate("sections")


    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found",
      });
    }

    // Block delete if this survey is part of any Learning Path
    const referencedLP = await LearningPath.findOne({
      $or: [
        { "lessons.id": survey._id },
        { "lessons.uuid": req.params.id },
      ],
    }).select("_id title uuid");

    if (referencedLP) {
      return res.status(400).json({
        success: false,
        message: "This survey is part of a Learning Path. Please remove it from the Learning Path first.",
        learningPath: { id: referencedLP._id, title: referencedLP.title, uuid: referencedLP.uuid },
      });
    }

    // --- Step 1: Delete questions under each section ---
    if (Array.isArray(survey.sections) && survey.sections.length > 0) {
      const sectionIds = survey.sections.map((s) => s._id);
      const sections = await OrganizationSurveySection.find({ _id: { $in: sectionIds } });
      const questionIds = sections.flatMap((section) => section.questions);

      if (questionIds.length > 0) {
        await OrganizationSurveyQuestion.deleteMany({ _id: { $in: questionIds } }, { session });
      }

      // --- Step 2: Delete sections ---
      await OrganizationSurveySection.deleteMany({ _id: { $in: sectionIds } }, { session });
    }

    // --- Step 3: Delete feedback (if any) ---
    // if (survey.feedback) {
    //   await GlobalSurveyFeedback.findByIdAndDelete(survey.feedback._id, { session });
    // }

    // --- Step 4: Delete the survey itself ---
    const deletedSurvey = await OrganizationSurveys.findOneAndDelete({ uuid: req.params.id, organization_id }, { session });
    const deletedAssignments = await ForUserAssignment.deleteMany({contentId:deletedSurvey._id})
    const userProgress = await UserContentProgress.deleteMany({contentId:deletedAssignments._id})

    await session.commitTransaction();
    transactionCommitted = true; // Mark as committed

    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Deleted survey: ${survey?.title || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: "Survey deleted successfully",
      data: deletedSurvey,
    });
  } catch (error) {
    // Only abort if transaction wasn't committed
    if (session && !transactionCommitted) {
      await session.abortTransaction();
    }
    console.error("Error deleting survey:", error);
    
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to delete survey`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
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
    const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

    if (!organization_id) {
      return res.status(400).json({ success: false, message: "Organization ID is required" });
    }

    // Fetch only surveys from current organization
    const surveys = await OrganizationSurveys.find({ organization_id })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "sections",
        populate: {
          path: "questions",
          model: "OrganizationSurveyQuestion",
        },
      })
      // .populate("feedback")
      .lean(); // lean() for faster response and smaller payload

    const total = await OrganizationSurveys.countDocuments({ organization_id });

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
        const response = await OrganizationSurveyResponses.findById(req.params.id)
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
        const responses = await OrganizationSurveyResponses.find()
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
    const organization_id = req.user?.organization_id; // Get organization_id from authenticated user

    if (!organization_id) {
      return res.status(400).json({ success: false, message: "Organization ID is required" });
    }

    const survey = await OrganizationSurveys.findOne({ uuid: req.params.id, organization_id })
      .populate({
        path: "sections",
        populate: {
          path: "questions",
          model: "OrganizationSurveyQuestion",
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