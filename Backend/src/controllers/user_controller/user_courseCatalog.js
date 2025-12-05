const GlobalAssingnment = require("../../models/global_Assignment");
const GlobalModule = require("../../models/globalModule_model");
const GlobalAssessments = require("../../models/globalAssessments_model");
const Surveys = require("../../models/global_surveys_model");
const UserContentProgress = require("../../models/userContentProgress_model");

const getCatalog = async (req, res) => {
  try {
    // 1) fetch global assignments for this org
    const assignments = await GlobalAssingnment.find({
      orgId: req.user.organization_id,
    });

    const now = new Date();

    // helper: Date + "HH:mm" -> Date
    const combineDateAndTime = (date, timeStr) => {
      if (!date || !timeStr) return null;
      const [hours, minutes] = timeStr.split(":").map((v) => parseInt(v, 10) || 0);
      const d = new Date(date);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // 2) keep only currently active assignments
    const activeAssignments = assignments.filter((item) => {
      const assignDateTime = combineDateAndTime(item.assignDate, item.assignTime);
      const dueDateTime = combineDateAndTime(item.dueDate, item.dueTime);
      if (!assignDateTime || !dueDateTime) return false;
      return assignDateTime <= now && now <= dueDateTime;
    });

    // 3) separate IDs by type
    const moduleIds = activeAssignments
      .filter((a) => a.ModuleId)
      .map((a) => a.ModuleId);

    const assessmentIds = activeAssignments
      .filter((a) => a.assessmentId)
      .map((a) => a.assessmentId);

    const surveyIds = activeAssignments
      .filter((a) => a.surveyId)
      .map((a) => a.surveyId);

    // 4) fetch content + user progress in parallel
    const [modules, assessments, surveys, userProgress] = await Promise.all([
      moduleIds.length
        ? GlobalModule.find({ _id: { $in: moduleIds }, status: "Published" })
            .select("title description duration tags thumbnail credits stars badges uuid category")
            .lean()
        : [],
      assessmentIds.length
        ? GlobalAssessments.find({ _id: { $in: assessmentIds }, status: "Published" })
            .select("title description duration tags thumbnail credits stars badges uuid category")
            .lean()
        : [],
      surveyIds.length
        ? Surveys.find({ _id: { $in: surveyIds }, status: "Published" })
            .select("title description duration tags thumbnail credits stars badges uuid category")
            .lean()
        : [],
      UserContentProgress.find({ user_id: req.user._id }).select("contentId").lean(),
    ]);

    const userProgressIds = new Set(
      userProgress.map((p) => p.contentId.toString())
    );

    // 5) decorate with type/model/who and inProgress
    modules.forEach((m) => {
      m.type = "Module";
      m.model = "GlobalModule";
      m.who = "Global";
      if (userProgressIds.has(m._id.toString())) {
        m.inProgress = true;
      }
    });

    assessments.forEach((a) => {
      a.type = "Assessment";
      a.model = "GlobalAssessments";
      a.who = "Global";
      if (userProgressIds.has(a._id.toString())) {
        a.inProgress = true;
      }
    });

    surveys.forEach((s) => {
      s.type = "Survey";
      s.model = "GlobalSurvey";
      s.who = "Global";
      if (userProgressIds.has(s._id.toString())) {
        s.inProgress = true;
      }
    });

    const catalog = [...modules, ...assessments, ...surveys];

    return res.status(200).json({
      isSuccess: true,
      message: "Catalog fetched successfully",
      data: catalog,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch catalog",
      error: error.message,
    });
  }
};

module.exports = { getCatalog };