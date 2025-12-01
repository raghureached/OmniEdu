
const LearningPath = require("../../models/learningPath_model");
const Module = require("../../models/moduleOrganization_model");
const OrganizationAssessments = require("../../models/organizationAssessments_model");
const OrganizationSurveys = require("../../models/organizationSurveys_model");
const UserContentProgress = require("../../models/userContentProgress_model");
const UserProfile = require("../../models/userProfiles_model");

const getModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        // console.log(moduleId)
        const module = await Module.findOne({uuid:moduleId}).populate("team").populate("subteam");
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        return res.status(200).json(module);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getAssessment = async(req,res) =>{
    try {
        const { assessmentId } = req.params;
        const assessment = await OrganizationAssessments.findOne({uuid:assessmentId}).populate("questions").populate("team").populate("subteam");
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }
        return res.status(200).json(assessment);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getSurvey = async(req,res) =>{
    try {
        const { surveyId } = req.params;
        const survey = await OrganizationSurveys.findOne({uuid:surveyId}).populate({
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
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getLearningPath = async(req,res)=>{
    try {
        const { learningPathId } = req.params;
        const learningPath = await LearningPath.findOne({uuid:learningPathId}).populate("team").populate("subteam");
        if (!learningPath) {
            return res.status(404).json({ message: 'Learning Path not found' });
        }
        return res.status(200).json(learningPath);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const markComplete = async(req,res) =>{
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { stars, badges, credits } = req.body;
        const update = await UserContentProgress.findOneAndUpdate(
            { user_id: userId, contentId: id },
            { 
                status: "completed",
                progress_pct: 100
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
            } ,
            { new: true }
        );
        return res.status(200).json({ message: "Module marked complete" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getInProgress = async(req,res) =>{
    try {
        const userId = req.user._id;
        const inProgress = await UserContentProgress.find({ user_id: req.user._id, status: "in_progress" })
              .populate({
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
              })
              .lean();
        // const  = await UserContentProgress.find({ user_id: userId, status: "in_progress" }).populate("contentId");
        return res.status(200).json(inProgress);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const updateStatus = async(req,res) =>{
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const status = req.params.status;
        const update = await UserContentProgress.findOneAndUpdate(
            { user_id: userId, contentId: id },
            { 
                status: status
            },
            { new: true }
        );
        return res.status(200).json({ message: "Status updated" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const enrolledbyUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrolled = await UserContentProgress.find({
      user_id: userId,
      orgAssignment: false,
    });

    // Populate each document properly
    const data = await Promise.all(
      enrolled.map((e) =>
        e.populate({
          path: "assignment_id",
          select:
            "uuid name title description assign_type contentId assign_on due_date created_by",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
            { path: "created_by", select: "name email" },
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

const getCatalog = async (req, res) => {
  try {
    let catalog = [];
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
          .select("title description duration tags thumbnail credits stars badges uuid category")
          .lean(),

        UserContentProgress.find({ user_id: req.user._id })
          .select("contentId")
          .lean(),
      ])


    // Convert user progress IDs into a Set for fast lookup
    const userProgressIds = new Set(
      userProgress.map((p) => p.contentId.toString())
    );

    // Mark inProgress where matching
    modules.forEach((m) => {
        // console.log(m._id.toString())
      if (userProgressIds.has(m._id.toString())) {
        m.type = "Module";
        m.inProgress = true;
      };
    });

    assessments.forEach((a) => {
      a.type = "Assessment";
      if (userProgressIds.has(a._id.toString())) a.inProgress = true;
    });

    surveys.forEach((s) => {
      s.type = "Survey";
      if (userProgressIds.has(s._id.toString())) s.inProgress = true;
    });

    learningPaths.forEach((lp) => {
      lp.type = "Learning Path";
      if (userProgressIds.has(lp._id.toString())) lp.inProgress = true;
    });

    catalog = [...modules, ...assessments, ...surveys, ...learningPaths];

    return res.status(200).json(catalog);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};


module.exports = {
    getModule,
    getAssessment,
    getSurvey,
    getLearningPath,
    markComplete,
    getInProgress,
    updateStatus,
    enrolledbyUser,
    getCatalog,
}

        
    