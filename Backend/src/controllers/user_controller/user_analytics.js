
const adminTicket = require("../../models/adminTicket");
const ForUserAssignment = require("../../models/forUserAssigments_model");
const Leaderboard = require("../../models/leaderboard.model");
const OrganizationAssessmentsAttemps = require("../../models/organizationAssessmentsAttemps_model");
const UserContentProgress = require("../../models/userContentProgress_model");
const UserProfile = require("../../models/userProfiles_model");
const User = require("../../models/users_model");
const userTickets = require("../../models/userTickets");
const WeeklyActivity = require("../../models/userWeekly_activity_model");
const weeklyProgress = require("../../models/userWeekly_activity_model");

const getAnalytics = async (req, res) => {
  try {
    const scores = await OrganizationAssessmentsAttemps.find({ user_id: req.user._id })
    const avgScore = scores.reduce((acc, score) => acc + score.score, 0) / scores.length;
    const minutes = await Leaderboard.findOne({ user_id: req.user._id }).select("noOfhoursCompleted")
    const leaderboard = await Leaderboard.find({ organization_id: req.user.organization_id }).sort({ noOfhoursCompleted: -1 });
    const totalParticipants = await User.find({ organization_id: req.user.organization_id });
    const leaderboardPosition = leaderboard.findIndex((l) => l.user_id.toString() === req.user._id.toString()) + 1;
    const timeSpent = (minutes?.noOfhoursCompleted / 60).toFixed(2) || 0;
    let completionRate = 0;
    const totalAssignmnets = await UserContentProgress.find({ user_id: req.user._id }).populate([
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
    // console.log(totalAssignmnets)
    const totalCourses = totalAssignmnets.length;
    const completedCourses = totalAssignmnets.filter((assignment) => assignment.status === "completed").length;
    completionRate = ((completedCourses / totalCourses) * 100).toFixed(2);
    const inProgressCourses = totalAssignmnets.filter((assignment) => assignment.status === "in_progress").length;
    const { credits, stars, badges } = await UserProfile.findOne({ user_id: req.user._id }).select("credits stars badges")
    const courseCompletion = [
      { name: 'Completed', value: completedCourses },
      { name: 'In Progress', value: inProgressCourses },
    ]

    const upcomingDeadlines = totalAssignmnets
      .filter((course) => course.assignment_id.due_date != null)
      .map((course) => {
        return {
          course: course.assignment_id.contentId.title,
          dueDate: course.assignment_id.due_date,
          daysLeft: Math.floor((course.assignment_id.due_date - Date.now()) / (1000 * 60 * 60 * 24)),
          progress: course.progress_pct
        };
      })
      .filter((deadline) => deadline.daysLeft >= 0) // Only include future or current deadlines
      .sort((a, b) => a.daysLeft - b.daysLeft); // Sort by closest deadline first
    const overdueAssignments = totalAssignmnets
      .filter((course) => course.assignment_id.due_date != null)
      .map((course) => {
        return {
          course: course.assignment_id.contentId.title,
          dueDate: course.assignment_id.due_date,
          daysOverdue: Math.floor((Date.now() - course.assignment_id.due_date) / (1000 * 60 * 60 * 24)),
          progress: course.progress_pct
        };
      })
      .filter((deadline) => deadline.daysOverdue >= 0) // Only include overdue assignments
      .sort((a, b) => a.daysOverdue - b.daysOverdue); // Sort by closest deadline first


      

    const assessmentScores = await getAssessmentPerformance(req)
    return res.status(200).json({
      isSuccess: true,
      message: "Analytics Fetched Successfully",
      data: {
        avgScore,
        weeklyProgress: [
          { day: "Mon", hours: 2 },
          { day: "Tue", hours: 3.4 },
          { day: "Wed", hours: 4 },
          { day: "Thu", hours: 1.2 },
          { day: "Fri", hours: 0 },
          { day: "Sat", hours: 7 },
          { day: "Sun", hours: 5 }
        ],
        timeSpent,
        completionRate,
        leaderboardPosition,
        completedCourses,
        totalCourses,
        inProgressCourses,
        leaderboardPosition,
        totalParticipants: totalParticipants.length,
        credits,
        stars,
        badges,
        courseCompletion,
        upcomingDeadlines,
        overdueAssignments,
        assessmentScores,
        
      }
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to Fetch Analytics",
      error: error.message
    })
  }
}


const getAssessmentPerformance = async (req) => {
  try {
    const userAttempts = await OrganizationAssessmentsAttemps.find({ user_id: req.user._id }).populate('assessment_id');
    const allAttempts = await OrganizationAssessmentsAttemps.find({}).populate('assessment_id');
    const assessmentGroups = {};

    userAttempts.forEach((attempt) => {
      const assessmentId = attempt.assessment_id._id.toString();
      if (!assessmentGroups[assessmentId]) {
        assessmentGroups[assessmentId] = {
          userScore: attempt.score,
          assessmentName: attempt.assessment_id.title || 'Assessment',
          allScores: []
        };
      } else {
        // Keep the best score for the user
        if (attempt.score > assessmentGroups[assessmentId].userScore) {
          assessmentGroups[assessmentId].userScore = attempt.score;
        }
      }
    });

    allAttempts.forEach((attempt) => {
      const assessmentId = attempt.assessment_id._id.toString();
      if (assessmentGroups[assessmentId]) {
        assessmentGroups[assessmentId].allScores.push(attempt.score);
      }
    });

    const assessmentScores = Object.values(assessmentGroups).map(group => {
      const classAverage = group.allScores.length > 0
        ? Math.round(group.allScores.reduce((sum, score) => sum + score, 0) / group.allScores.length)
        : 0;

      return {
        name: group.assessmentName,
        score: group.userScore,
        classAverage: classAverage
      };
    });

    const avgScore = assessmentScores.length > 0
      ? Math.round(assessmentScores.reduce((sum, item) => sum + item.score, 0) / assessmentScores.length)
      : 0;

    const overallClassAverage = assessmentScores.length > 0
      ? Math.round(assessmentScores.reduce((sum, item) => sum + item.classAverage, 0) / assessmentScores.length)
      : 0;

    return {
      assessmentScores,
      avgScore,
      classAverage: overallClassAverage
    };

  } catch (error) {
    console.log(error);
    return {
      assessmentScores: [],
      avgScore: 0,
      classAverage: 0
    };
  }
}

const updateLearningActivity = async (req, res) => {
  try {
    const userId = req.user._id; // from JWT middleware
    const { date, hours } = req.body;
    // console.log(req.data)
    if(req.user.role === "General User"){
      return;
    }
    if (!date || !hours)
      return res.status(400).json({ success: false, message: "Date and hours required" });

    const result = await weeklyProgress.findOneAndUpdate(
      { userId, date },
      { $inc: { hours: hours } },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "Learning activity updated",
      data: result
    });

  } catch (error) {
    console.error("Error updating learning activity:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getWeeklyActivity = async (req) => {
  try {
    const userId = req.user._id;

    // 1. Calculate date range (last 7 days)
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);

    const startDate = last7.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    // 2. Fetch logs from DB
    const logs = await WeeklyActivity.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // 3. Generate weekly array
    const weeklyProgress = weekDays.map((day, index) => {
      const d = new Date(last7);
      d.setDate(last7.getDate() + index);
      const dateKey = d.toISOString().split("T")[0];

      const record = logs.find((item) => item.date === dateKey);

      return {
        day,
        hours: record ? Number(record.hours.toFixed(2)) : 0
      };
    });

    return weeklyProgress

  } catch (error) {
    console.error("Error fetching weekly activity:", error);
    return error
  }
};

module.exports = {
  getAnalytics,
  updateLearningActivity
}