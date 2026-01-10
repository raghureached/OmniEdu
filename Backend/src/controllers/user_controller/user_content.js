
const Surveys = require("../../models/globalAdmin/Surveys/global_surveys_model");
const GlobalAssessments = require("../../models/globalAdmin/Assessments/globalAssessments_model");
const GlobalModule = require("../../models/globalAdmin/Module/globalModule_model");
const Leaderboard = require("../../models/leaderboard.model");
const LearningPath = require("../../models/Admin/LearningPaths/learningPath_model");
const Module = require("../../models/Admin/Module/moduleOrganization_model");
const OrganizationAssessments = require("../../models/Admin/Assessments/organizationAssessments_model");
const OrganizationSurveys = require("../../models/Admin/Surveys/organizationSurveys_model");
const UserContentProgress = require("../../models/User/userContentProgress_model");
const UserProfile = require("../../models/User/userProfiles_model");
const User = require("../../models/User/users_model");

const getModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findOne({ uuid: moduleId }).populate("team").populate("subteam");
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    return res.status(200).json(module);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
const getEnrolledModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    // console.log(moduleId)
    const module = await GlobalModule.findOne({ uuid: moduleId }).populate("team").populate("subteam");
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    return res.status(200).json(module);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await OrganizationAssessments.findOne({ uuid: assessmentId }).populate("questions").populate("team").populate("subteam");
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    return res.status(200).json(assessment);
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const getEnrolledAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await GlobalAssessments.findOne({ uuid: assessmentId }).populate("questions").populate("team").populate("subteam");
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    return res.status(200).json(assessment);
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const getSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const survey = await OrganizationSurveys.findOne({ uuid: surveyId }).populate({
      path: "sections",
      populate: {
        path: "questions",
        model: "OrganizationSurveyQuestion"
      }
    }).populate("team").populate("subteam");
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }
    return res.status(200).json(survey);
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const getLearningPath = async (req, res) => {
  try {
    const { learningPathId } = req.params;
    const learningPath = await LearningPath.findOne({ uuid: learningPathId }).populate("team").populate("subteam");
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning Path not found' });
    }
    return res.status(200).json(learningPath);
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: error.message });
  }
}
const markCompleteLP = async (req, res) => {
  try {
    const { lpId, id, pct } = req.params;
    const userId = req.user._id;


    const updateMain = await UserContentProgress.findOneAndUpdate(
      {
        user_id: userId,
        contentId: lpId,
      },
      {
        progress_pct: pct
      }
    )

    const update = await UserContentProgress.findOneAndUpdate(
      {
        user_id: userId,
        contentId: lpId,
        'elements.elementId': id
      },
      {
        $set: {
          'elements.$.status': "completed",
          'elements.$.progress_pct': 100
        }
      },
      { new: true }
    );

    return res.status(200).json({ message: "Module marked complete", data: update });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

const getCompletedinLP = async (req, res) => {
  try {
    const { lpId } = req.params;
    const userId = req.user._id;

    const lpProgress = await UserContentProgress.findOne({
      user_id: userId,
      contentId: lpId,

    });

    if (!lpProgress) {
      return res.status(200).json([]);
    }

    const completedElements = lpProgress.elements ?
      lpProgress.elements.filter((e) => e.status === "completed") : [];
    const set = new Set(completedElements.map((e) => e.elementId));
    const uniqueElements = Array.from(set);
    return res.status(200).json(uniqueElements);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}
const markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { stars, badges, credits,duration } = req.body;
    const current = await UserContentProgress.findOne({user_id:userId,contentId:id});
    if(current.status === "completed") return res.status(201).json({message:"Content is aldready completed by User."});
    const update = await UserContentProgress.findOneAndUpdate(
      { user_id: userId, contentId: id },
      {
        status: "completed",
        progress_pct: 100,
        completed_at:Date.now()
      },
      { new: true }
    );
    const updateRewards = await UserProfile.findOneAndUpdate(
      { user_id: userId },
      {
        $inc: {
          stars: stars,
          badges: badges,
          credits: credits
        }
      },
      { new: true }
    );
    // Get user's team for leaderboard
    const userProfile = await UserProfile.findOne({ user_id: userId });
    const teamId = userProfile.teams.length > 0 ? userProfile.teams[0].team_id : null;
    
    const updatedLeaderboard = await Leaderboard.findOneAndUpdate(
      { user_id: userId },
      {
        $inc: {
          noOfhoursCompleted: duration
        },
        $setOnInsert: {
          organization_id: req.user.organization_id,
          team_id: teamId
        }
      },
      { new: true, upsert: true }

    );
    return res.status(200).json({ message: "Module marked complete", data: update });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const getInProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const inProgress = await UserContentProgress.find({
      user_id: req.user._id,
      status: "in_progress",
    })
      .populate([
        {
          path: "assignment_id",
          select: "uuid name title description assign_type contentId assign_on due_date created_by contentType",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
            { path: "created_by", select: "name email" },
          ],
        },
        {
          path: "enrollment_id",
          select: "uuid name assign_type contentId assign_on contentType",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
          ],
        },
      ])
      .lean();
    const inProgressWithWho = Array.isArray(inProgress)
      ? inProgress.map((doc) => ({
          ...doc,
          who: doc?.enrollment_id ? "omniedu" : doc?.who,
        }))
      : inProgress;
    return res.status(200).json(inProgressWithWho);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const status = req.params.status;
    const update = await UserContentProgress.findOneAndUpdate(
      { user_id: userId, assignment_id: id },
      {
        status: status
      },
      { new: true }
    );
    return res.status(200).json({ message: "Status updated", data: update });
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const enrolledbyUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrolled = await UserContentProgress.find({
      user_id: userId,
    });

    // Populate each document properly
    const data = await Promise.all(
      enrolled.map((e) =>
        e.populate({
          path: "enrollment_id",
          select:
            "uuid name title description assign_type contentId assign_on due_date created_by",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
          ],
        })
      )
    );

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const getCompleted = async (req, res) => {
  try {
    const userId = req.user._id;
    const completed = await UserContentProgress.find({
      user_id: userId,
      status: "completed"
    })
      .populate([
        {
          path: "assignment_id",
          select: "uuid name title description assign_type contentId assign_on due_date created_by",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
            { path: "created_by", select: "name email" },
          ],
        },
        {
          path: "enrollment_id",
          select: "uuid name assign_type contentId assign_on",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
          ],
        },
      ])
      .lean();
    const completedWithWho = Array.isArray(completed)
      ? completed.map((doc) => ({
          ...doc,
          who: doc?.enrollment_id ? "omniedu" : doc?.who,
        }))
      : completed;
    return res.status(200).json(completedWithWho);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
}

const getRecomended = async (req, res) => {
  try {
    // Get all content + user's progress
    const [modules, assessments, surveys, learningPaths, userProgress] =
      await Promise.all([
        Module.find({ status: "Published" })
          .select("title description duration tags thumbnail credits stars badges uuid category")
          .lean(),

        OrganizationAssessments.find({ status: "Published" })
          .select("title description duration tags thumbnail credits stars badges uuid category")
          .lean(),

        OrganizationSurveys.find({ status: "Published" })
          .select("title description duration tags thumbnail credits stars badges uuid category")
          .lean(),

        LearningPath.find({ status: "Published" })
          .select("title description duration tags thumbnail credits stars badges uuid category lessons")
          .lean(),

        UserContentProgress.find({ user_id: req.user._id })
          .select("contentId")
          .lean(),
      ]);

    // Build a Set of content IDs the user has already touched
    const userProgressIds = new Set(
      userProgress.map((p) => p.contentId.toString())
    );

    // Only keep content the user has NOT started yet
    const availableModules = modules.filter(
      (m) => !userProgressIds.has(m._id.toString())
    );
    const availableAssessments = assessments.filter(
      (a) => !userProgressIds.has(a._id.toString())
    );
    const availableSurveys = surveys.filter(
      (s) => !userProgressIds.has(s._id.toString())
    );
    const availableLearningPaths = learningPaths.filter(
      (lp) => !userProgressIds.has(lp._id.toString())
    );

    // Tag with type/model (similar to getCatalog) so frontend can use it
    availableModules.forEach((m) => {
      m.type = "Module";
      m.model = "OrganizationModule";
      m.who = "Admin";
    });

    availableAssessments.forEach((a) => {
      a.type = "Assessment";
      a.model = "OrganizationAssessments";
      a.who = "Admin";
    });

    availableSurveys.forEach((s) => {
      s.type = "Survey";
      s.model = "OrganizationSurvey";
      s.who = "Admin";
    });

    availableLearningPaths.forEach((lp) => {
      lp.type = "Learning Path";
      lp.model = "LearningPath";
      lp.who = "Admin";
    });

    // Combine into a single list; optionally you can slice to limit results
    const recommended = [
      ...availableModules,
      ...availableAssessments,
      ...availableSurveys,
      ...availableLearningPaths,
    ];

    return res.status(200).json(recommended);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const getAssigned = async (req, res) => {
  try {
    const assigned = await UserContentProgress.find({
      user_id: req.user._id,
      $or: [
        { status: "assigned" },
        { status: "enrolled" },
      ],
    })
      .populate([
        {
          path: "assignment_id",
          select: "uuid name title description assign_type contentId assign_on due_date created_by",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
            { path: "created_by", select: "name email" },
          ],
        },
        {
          path: "enrollment_id",
          select: "uuid name assign_type contentId assign_on",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
          ],
        },
      ])
      .lean();
    const assignedWithWho = Array.isArray(assigned)
      ? assigned.map((doc) => ({
          ...doc,
          who: doc?.enrollment_id ? "omniedu" : doc?.who,
        }))
      : assigned;
    return res.status(200).json(assignedWithWho);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const getLeaderboard = async (req, res) => {
  try {
    console.log(req.user)
    const leaderboard = await Leaderboard.find({ organization_id: req.user.organization_id }).sort({ noOfhoursCompleted: -1 });
    const totalUsers = await User.find({ organization_id: req.user.organization_id });
    const position = leaderboard.findIndex((l) => l.user_id.toString() === req.user._id.toString()) + 1;
    return res.status(200).json({leaderboard,totalUsers:totalUsers.length,position:position === 0 ? 'N/A' : position});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}
const getLeaderboardinTeam = async (req, res) => {
  try {
    const userId = req.user._id;
    const teams = await UserProfile.findOne({ user_id: userId }).select("teams");
    const PrimaryTeam = teams.teams[0].team_id;
    const leaderboard = await Leaderboard.find({ team_id: PrimaryTeam }).sort({ noOfhoursCompleted: -1 });
    const position = leaderboard.findIndex((l) => l.user_id.toString() === req.user._id.toString()) + 1;
    return res.status(200).json({leaderboard,totalUsers:leaderboard.length,position:position === 0 ? 'N/A' : position});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}

const getWorkspace = async(req,res) =>{
  try {
    const userId = req.user._id;
    const assigned = await UserContentProgress.find({
      user_id: req.user._id,
      status: "",
    })
      .populate([
        {
          path: "assignment_id",
          select: "uuid name title description assign_type contentId assign_on due_date created_by",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
            { path: "created_by", select: "name email" },
          ],
        },
        {
          path: "enrollment_id",
          select: "uuid name assign_type contentId assign_on",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
          ],
        },
      ])
      .lean();
    // const  = await UserContentProgress.find({ user_id: userId, status: "in_progress" }).populate("contentId");
    return res.status(200).json(assigned);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message });
  }
}
module.exports = {
  getModule,
  getAssessment,
  getSurvey,
  getLearningPath,
  markComplete,
  markCompleteLP,
  getInProgress,
  updateStatus,
  enrolledbyUser,
  getCompleted,
  getRecomended,
  getAssigned,
  getEnrolledModule,
  getEnrolledAssessment,
  getCompletedinLP,
  getLeaderboard,
  getLeaderboardinTeam,
  getWorkspace
}


