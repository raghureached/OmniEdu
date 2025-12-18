
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

// Helper function to get date range filter
const getDateRangeFilter = (dateRange) => {
  if (dateRange === 'all') return null;
  
  const now = new Date();
  const startDate = new Date();
  
  switch (dateRange) {
    case '7D':
      startDate.setDate(now.getDate() - 7);
      break;
    case '1M':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3M':
      startDate.setMonth(now.getMonth() - 3);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return { $gte: startDate, $lte: now };
};

const getStats = async (req, res) => {
  try {
    const { dateRange = 'all' } = req.query;
    const dateFilter = getDateRangeFilter(dateRange);

    // For avgScore - Filter assessment attempts by date
    const scoreQuery = { user_id: req.user._id };
    if (dateFilter) {
      scoreQuery.createdAt = dateFilter;
    }
    const scores = await OrganizationAssessmentsAttemps.find(scoreQuery);
    const avgScore = scores.length > 0 ?
      (scores.reduce((acc, score) => acc + score.score, 0) / scores.length).toFixed(2) : 0;

    // For timeSpent - Get from leaderboard (no date filter for leaderboard position)
    const minutes = await Leaderboard.findOne({ user_id: req.user._id }).select("noOfhoursCompleted");
    const timeSpent = (minutes?.noOfhoursCompleted / 60).toFixed(2) || 0;

    // For leaderboard - Always show current position (no date filter)
    const leaderboard = await Leaderboard.find({ organization_id: req.user.organization_id })
      .sort({ noOfhoursCompleted: -1 });
    const totalParticipants = await User.countDocuments({ organization_id: req.user.organization_id });
    const leaderboardPosition = leaderboard.findIndex((l) => l.user_id.toString() === req.user._id.toString()) + 1;

    // For course completion - Filter by date
    const courseQuery = { user_id: req.user._id };
    if (dateFilter) {
      courseQuery.updatedAt = dateFilter;
    }
    const totalAssignments = await UserContentProgress.find(courseQuery);
    const totalCourses = totalAssignments.length;
    const completedCourses = totalAssignments.filter(a => a.status === "completed").length;
    const completionRate = totalCourses > 0 ?
      ((completedCourses / totalCourses) * 100).toFixed(2) : 0;
    const newCourses = totalAssignments.filter(a => a.status === "assigned").length;

    return res.status(200).json({
      isSuccess: true,
      message: "Analytics Fetched Successfully",
      data: {
        avgScore: parseFloat(avgScore),
        timeSpent: parseFloat(timeSpent),
        completionRate: parseFloat(completionRate),
        leaderboardPosition,
        totalParticipants,
        newCourses,
      }
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to Fetch Stats",
      error: error.message
    })
  }
}

const courseAnalytics = async (req, res) => {
  try {
    const { dateRange = '7D' } = req.query;
    const dateFilter = getDateRangeFilter(dateRange);
    
    const query = { user_id: req.user._id };
    if (dateFilter) {
      query.updatedAt = dateFilter;
    }
    
    const totalAssignments = await UserContentProgress.find(query).populate([
      {
        path: "assignment_id",
        select: "uuid name title assign_type contentId assign_on due_date created_by contentType",
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
      .lean()
    const totalCourses = totalAssignments.length;
    const completedCourses = totalAssignments.filter((assignment) => assignment.status === "completed").length;
    const inProgressCourses = totalAssignments.filter((assignment) => assignment.status === "in_progress").length;
    const courseCompletion = [
      { name: 'Completed', value: completedCourses },
      { name: 'In Progress', value: inProgressCourses },
    ]
    return res.status(200).json({
      isSuccess: true,
      message: "Analytics Fetched Successfully",
      data: {
        courseCompletion,
        completedCourses,
        totalCourses,
        inProgressCourses,
        totalAssignments
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

const getDeadlinesAndOverDue = async (req, res) => {
  try {
    const totalAssignmnets = await UserContentProgress.find({ user_id: req.user._id }).populate([
      {
        path: "assignment_id",
        select: "uuid name title assign_type contentId assign_on due_date created_by contentType",
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
      .lean()


    const upcomingDeadlines = totalAssignmnets
      .filter((course) => course.assignment_id.due_date != null)
      .map((course) => {
        return {
          course: course.assignment_id.contentId.title,
          uuid: course.assignment_id.contentId.uuid,
          type: course.assignment_id.contentType.toLowerCase()?.replace(/\s+/g, ''),
          assign_id: course.assignment_id._id,
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
          uuid: course.assignment_id.contentId.uuid,
          type: course.assignment_id.contentType.toLowerCase()?.replace(/\s+/g, ''),
          assign_id: course.assignment_id._id,
          dueDate: course.assignment_id.due_date,
          daysOverdue: Math.floor((Date.now() - course.assignment_id.due_date) / (1000 * 60 * 60 * 24)),
          progress: course.progress_pct
        };
      })
      .filter((deadline) => deadline.daysOverdue >= 0) // Only include overdue assignments
      .sort((a, b) => a.daysOverdue - b.daysOverdue); // Sort by closest deadline first

    return res.status(200).json({
      isSuccess: true,
      message: "Analytics Fetched Successfully",
      data: {
        upcomingDeadlines,
        overdueAssignments,
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
        select: "uuid name title assign_type contentId assign_on due_date created_by contentType",
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
          uuid: course.assignment_id.contentId.uuid,
          type: course.assignment_id.contentType.toLowerCase()?.replace(/\s+/g, ''),
          assign_id: course.assignment_id._id,
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
          uuid: course.assignment_id.contentId.uuid,
          type: course.assignment_id.contentType.toLowerCase()?.replace(/\s+/g, ''),
          assign_id: course.assignment_id._id,
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


const getAssessmentPerformance = async (req, res) => {
  try {
    const { dateRange = 'all' } = req.query;
    const dateFilter = getDateRangeFilter(dateRange);

    // Filter user attempts by date range
    const userAttemptQuery = { user_id: req.user._id };
    if (dateFilter) {
      userAttemptQuery.createdAt = dateFilter;
    }
    const userAttempts = await OrganizationAssessmentsAttemps.find(userAttemptQuery).populate('assessment_id');
    
    // Filter all attempts by date range for class averages
    const allAttemptQuery = {};
    if (dateFilter) {
      allAttemptQuery.createdAt = dateFilter;
    }
    const allAttempts = await OrganizationAssessmentsAttemps.find(allAttemptQuery).populate('assessment_id');
    
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
    return res.status(200).json({
      isSuccess: true,
      message: "Analytics Fetched Successfully",
      data: {
        assessmentScores,
        avgScore,
        classAverage: overallClassAverage
      }
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to Fetch Analytics",
      error: error.message
    })
  }
}

const updateLearningActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, hours } = req.body;

    if (req.user.role !== "General User") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (!date || hours == null) {
      return res.status(400).json({
        success: false,
        message: "Date and hours are required"
      });
    }

    // ✅ Convert string date → Date object (normalized)
    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);

    const result = await weeklyProgress.findOneAndUpdate(
      {
        userId,
        date: activityDate
      },
      {
        $inc: { hours: Number(hours) }
      },
      {
        upsert: true,
        new: true
      }
    );

    return res.json({
      success: true,
      message: "Learning activity updated successfully",
      data: result
    });

  } catch (error) {
    console.error("Error updating learning activity:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getWeeklyActivity = async (req, res) => {
  try {
    const { dateRange = '7D' } = req.query;
    const userId = req.user._id;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startDate = new Date();
    let dataPoints = 7;
    let dayLabels = [];

    switch (dateRange) {
      case '7D':
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        dataPoints = 7;
        // Generate day labels for last 7 days
        for (let i = 0; i < 7; i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          dayLabels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
        }
        break;
      case '1M':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        dataPoints = 4; // 4 weeks
        // Generate week labels for last 4 weeks
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(startDate);
          weekStart.setDate(startDate.getDate() + (i * 7));
          dayLabels.push(`Week ${i + 1}`);
        }
        break;
      case '3M':
        startDate.setMonth(today.getMonth() - 3);
        startDate.setHours(0, 0, 0, 0);
        dataPoints = 12; // 12 weeks
        // Generate week labels for last 12 weeks
        for (let i = 0; i < 12; i++) {
          const weekStart = new Date(startDate);
          weekStart.setDate(startDate.getDate() + (i * 7));
          if (i % 3 === 0) {
            dayLabels.push(`Week ${i + 1}`);
          } else {
            dayLabels.push('');
          }
        }
        break;
      default:
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        dataPoints = 7;
        for (let i = 0; i < 7; i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          dayLabels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
        }
    }

    const logs = await WeeklyActivity.find({
      userId,
      date: { $gte: startDate, $lte: today }
    });

    const activityData = [];

    if (dateRange === '7D') {
      // Daily data for 7 days
      for (let i = 0; i < dataPoints; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        
        const record = logs.find(
          item => item.date.toDateString() === d.toDateString()
        );
        
        activityData.push({
          day: dayLabels[i],
          hours: record ? Number(record.hours.toFixed(2)) : 0
        });
      }
    } else if (dateRange === '1M' || dateRange === '3M') {
      // Weekly aggregation for 1M and 3M
      for (let i = 0; i < dataPoints; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekLogs = logs.filter(log => 
          log.date >= weekStart && log.date <= weekEnd
        );
        
        const totalHours = weekLogs.reduce((sum, log) => sum + log.hours, 0);
        
        activityData.push({
          day: dayLabels[i] || `Week ${i + 1}`,
          hours: Number(totalHours.toFixed(2))
        });
      }
    }

    return res.status(200).json({
      isSuccess: true,
      data: activityData
    });

  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: error.message
    });
  }
};


module.exports = {
  getAnalytics,
  updateLearningActivity,
  getStats,
  courseAnalytics,
  getDeadlinesAndOverDue,
  getAssessmentPerformance,
  getWeeklyActivity
}