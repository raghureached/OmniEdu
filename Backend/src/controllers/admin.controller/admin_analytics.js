const Module = require("../../models/moduleOrganization_model");
const UserContentProgress = require("../../models/userContentProgress_model");
const User = require("../../models/users_model");
const Team = require("../../models/teams_model");
const Organization = require("../../models/organization_model");
const ForUserAssignment = require("../../models/forUserAssigments_model");
const mongoose = require("mongoose");
const OrganizationAssessmentsAttemps = require("../../models/organizationAssessmentsAttemps_model");
const OrganizationAssessments = require("../../models/organizationAssessments_model");
const OrganizationSurveys = require("../../models/organizationSurveys_model");
const OrganizationSurveyResponses = require("../../models/organizationSurveyResponses_model");
const LearningPath = require("../../models/learningPath_model");

const categories = [
    "Mandatory Training (Compliance & Regulations)",
    "Technical Skills",
    "Soft Skills",
    "Leadership & Management",
    "Product Knowledge",
    "Process & Procedures",
    "Onboarding & Orientation Training",
    "Wellness & Health",
];

// Helper function to calculate time spent
const calculateTimeSpent = (startedAt, completedAt, lastActivityAt) => {
    if (!startedAt) return 'Not Started';
    
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : (lastActivityAt ? new Date(lastActivityAt) : new Date());
    const diffMs = end - start;
    
    if (diffMs < 0) return '0 min';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
        return `${diffHours}h ${diffMins}m`;
    } else {
        return `${diffMins} min`;
    }
};

// Helper function to calculate course duration
const calculateCourseDuration = (module) => {
    if (!module) return 'N/A';
    
    // Check if module has duration field
    if (module.duration) {
        return formatDuration(module.duration);
    }
    
    // Calculate duration based on content if available
    if (module.elements && module.elements.length > 0) {
        // Sum up durations of all elements
        let totalMinutes = 0;
        module.elements.forEach(element => {
            if (element.duration) {
                totalMinutes += element.duration;
            } else if (element.estimatedTime) {
                totalMinutes += element.estimatedTime;
            }
        });
        
        if (totalMinutes > 0) {
            return formatDuration(totalMinutes);
        }
    }
    
    // Fallback: estimate based on module type or content
    if (module.contentType === 'course') {
        return '2h 30m'; // Default estimate for courses
    } else if (module.contentType === 'assessment') {
        return '45m'; // Default estimate for assessments
    }
    
    return 'N/A';
};

// Helper function to determine assigned by value
const getAssignedBy = async (assignment, user, organizationId) => {
    try {
        // If the assignment was created by the user themselves (self-enrolled)
        if (assignment?.created_by && assignment.created_by.toString() === user._id.toString()) {
            return 'Self';
        }
        
        // If the assignment was created by someone in the same organization
        if (assignment?.created_by) {
            const createdBy = await User.findById(assignment.created_by).lean();
            if (createdBy) {
                // Check if creator is global admin (no organization_id or different org)
                if (!createdBy.organization_id || createdBy.organization_id.toString() !== organizationId.toString()) {
                    return 'Omniedu';
                }
                
                // If creator is from same organization, get organization name
                const Organization = require('../../models/organization_model');
                const org = await Organization.findById(organizationId).lean();
                return org?.name || 'Organization Admin';
            }
        }
        
        // Default fallback
        return 'System';
    } catch (error) {
        console.error('Error determining assigned by:', error);
        return 'System';
    }
};

// Helper function to calculate score based on content type and progress
const calculateScore = async (progress, contentType, contentId) => {
    try {
        switch (contentType?.toLowerCase()) {
            case 'assessment':
                // For assessments, get the latest attempt score
                const assessmentAttempts = await OrganizationAssessmentsAttemps.find({
                    user_id: progress.user_id,
                    assessment_id: contentId
                }).sort({ attemptedAt: -1 }).limit(1);
                
                if (assessmentAttempts.length > 0) {
                    return Math.round(assessmentAttempts[0].score || 0);
                }
                return 0;
                
            case 'course':
            case 'module':
                // For courses/modules, calculate based on element completion
                if (progress.elements && progress.elements.length > 0) {
                    const totalElements = progress.elements.length;
                    const completedElements = progress.elements.filter(el => el.status === 'completed').length;
                    return Math.round((completedElements / totalElements) * 100);
                }
                // Fallback to progress_pct if no elements
                return Math.round(progress.progress_pct || 0);
                
            case 'video':
            case 'document':
            case 'pdf':
                // For simple content, use progress percentage
                return Math.round(progress.progress_pct || 0);
                
            default:
                // Default to progress percentage
                return Math.round(progress.progress_pct || 0);
        }
    } catch (error) {
        console.error('Error calculating score:', error);
        return 0;
    }
};

// Helper function to format duration in minutes to readable format
const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    } else {
        return `${mins} min`;
    }
};

const getCourseDistribution = async (req, res) => {
    try {
        const { category, team, timeRange } = req.query;
        let query = { 
            org_id: req.user.organization_id,
            status: 'Published' // Only include published modules
        };
        
        // Apply filters
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (team && team !== 'all') {
            query.team = team;
        }
        
        // Apply time range filter if provided
        if (timeRange) {
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            query.createdAt = { $gte: cutoffDate };
        }
        
        const modules = await Module.find(query);

        // If specific category is filtered, return only that category
        if (category && category !== 'all') {
            const filtered = modules.filter(m => m.category === category);
            const courseLibrary = [{
                category,
                courses: filtered.length,
                teams: new Set(filtered.map(m => m.team)).size
            }];
            
            return res.status(200).json({
                success: true,
                courseLibrary
            });
        }

        // Return all categories if no specific filter
        const courseLibrary = categories.map(cat => {
            const filtered = modules.filter(m => m.category === cat);

            return {
                category: cat,
                courses: filtered.length,
                teams: new Set(filtered.map(m => m.team)).size
            };
        });

        return res.status(200).json({
            success: true,
            courseLibrary
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: err.message
        });
    }
};

const calculateUsageTrend = async (req, res) => {
    try {
        const { timeRange, userStatus } = req.query;
        const usageTrend = [];
        const organizationId = req.user.organization_id;
        
        // Determine number of weeks based on timeRange
        let weeksToShow = 4; // default
        if (timeRange === '7d') weeksToShow = 1;
        else if (timeRange === '30d') weeksToShow = 4;
        else if (timeRange === '90d') weeksToShow = 12;
        
        // Build base query filter
        let baseFilter = { organization_id: organizationId };
        
        // Add user status filter
        if (userStatus && userStatus !== 'all') {
            const now = new Date();
            switch (userStatus) {
                case 'active':
                    baseFilter.last_login = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                    break;
                case 'inactive':
                    baseFilter.last_login = { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                    break;
                case 'new':
                    baseFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                    break;
                case 'at-risk':
                    baseFilter.last_login = { 
                        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                        $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    };
                    break;
            }
        }
        
        for (let week = weeksToShow - 1; week >= 0; week--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (week * 7 + 6)); // Go back to start of week
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // End of week
            weekEnd.setHours(23, 59, 59, 999);

            // Calculate DAU for this week (average daily active users)
            const weekDAUPromises = [];
            for (let day = 0; day < 7; day++) {
                const dayStart = new Date(weekStart);
                dayStart.setDate(dayStart.getDate() + day);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const dayDAU = User.countDocuments({
                    ...baseFilter,
                    last_login: { $gte: dayStart, $lte: dayEnd }
                });
                weekDAUPromises.push(dayDAU);
            }

            const weekDAUCounts = await Promise.all(weekDAUPromises);
            const avgDAU = Math.round(weekDAUCounts.reduce((sum, count) => sum + count, 0) / 7);

            // Calculate MAU for this week (users active in the last 30 days from week end)
            const mauDate = new Date(weekEnd);
            const mauStartDate = new Date(mauDate.getTime() - 30 * 24 * 60 * 60 * 1000);

            let mauFilter = { ...baseFilter };
            if (userStatus && userStatus !== 'all' && userStatus !== 'inactive') {
                // For active users, we need to check their login within the MAU period
                mauFilter.last_login = { $gte: mauStartDate, $lte: mauDate };
            } else if (userStatus === 'inactive') {
                // For inactive users, count those who were inactive during MAU period
                delete mauFilter.last_login;
            }

            const weekMAU = await User.countDocuments(mauFilter);

            usageTrend.push({
                date: `Week ${weeksToShow - week}`,
                dau: avgDAU,
                mau: weekMAU
            });
        }

        return res.status(200).json({
            success: true,
            data: usageTrend
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getUsersData = async (req, res) => {
    try {
        const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalUsers = await User.countDocuments({ organization_id: req.user.organization_id });
        const dau = await User.countDocuments({ organization_id: req.user.organization_id, last_login: { $gte: last24Hours } });
        const mau = await User.countDocuments({ organization_id: req.user.organization_id, last_login: { $gte: last30Days } });

        const stickinessScore = mau > 0 ? ((dau / mau) * 100).toFixed(1) : 0;

        const previous24Hours = new Date(last24Hours.getTime() - 24 * 60 * 60 * 1000);
        const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

        const previousDAU = await User.countDocuments({
            organization_id: req.user.organization_id,
            last_login: { $gte: previous24Hours, $lt: last24Hours }
        });

        const previousMAU = await User.countDocuments({
            organization_id: req.user.organization_id,
            last_login: { $gte: previous30Days, $lt: last30Days }
        });

        const dauChange = previousDAU > 0 ? (((dau - previousDAU) / previousDAU) * 100).toFixed(1) : 0;
        const mauChange = previousMAU > 0 ? (((mau - previousMAU) / previousMAU) * 100).toFixed(1) : 0;
        const totalChange = previousDAU > 0 ? (((totalUsers - previousDAU) / previousDAU) * 100).toFixed(1) : 0;



        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                dau,
                mau,
                stickinessScore,
                dauChange,
                mauChange,
                totalChange,

            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

const getAdoption = async (req, res) => {
    try {
        const { category, team, timeRange } = req.query;
        
        let progressQuery = { organization_id: req.user.organization_id };
        
        // Apply time range filter if provided
        if (timeRange) {
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            progressQuery.createdAt = { $gte: cutoffDate };
        }
        
        const progress = await UserContentProgress
            .find(progressQuery)
            .populate({
                path: "assignment_id",
                populate: { path: "contentId", model: "OrganizationModule" }
            });

        const grouped = {};

        progress.forEach(entry => {
            const contentId = entry.assignment_id?.contentId?._id?.toString();
            const name = entry.assignment_id?.contentName;
            const courseCategory = entry.assignment_id?.contentId?.category;
            const courseTeam = entry.assignment_id?.contentId?.team?.toString();

            if (!contentId) return;

            // Apply category filter if specified
            if (category && category !== 'all' && courseCategory !== category) return;
            
            // Apply team filter if specified (compare ObjectId strings)
            if (team && team !== 'all' && courseTeam !== team) return;

            if (!grouped[contentId]) {
                grouped[contentId] = {
                    name,
                    enrolled: 0,
                    completed: 0,
                    category: courseCategory,
                    team: courseTeam
                };
            }

            if (entry.status === "assigned") grouped[contentId].enrolled++;
            if (entry.status === "completed") grouped[contentId].completed++;
        });

        let courseAdoption = [];

        Object.values(grouped).forEach(item => {
            let { name, enrolled, completed } = item;

            // Skip if both zero
            if (enrolled === 0 && completed === 0) return;

            // If enrolled = 0 but completed exists → treat completed as enrolled
            if (enrolled === 0 && completed > 0) {
                enrolled = completed;
            }

            const rate = ((completed / enrolled) * 100).toFixed(1);

            courseAdoption.push({
                name,
                enrolled,
                completed,
                rate,
                category: item.category,
                team: item.team
            });
        });

        // Sort by rate descending (change to "completed" if preferred)
        courseAdoption.sort((a, b) => b.rate - a.rate);

        // Take only top 4
        courseAdoption = courseAdoption.slice(0, 4);

        return res.status(200).json({
            success: true,
            data: { courseAdoption }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getTeams = async (req, res) => {
    try {
        const teams = await Team.find({ organization_id: req.user.organization_id })
            .select('_id name')
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            teams
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getEngagementHeatmap = async (req, res) => {
    try {
        const { timeRange } = req.query;
        const organizationId = req.user.organization_id;
        
        console.log('Heatmap request - orgId:', organizationId, 'timeRange:', timeRange);
        
        // Determine date range based on timeRange
        let startDate = new Date();
        if (timeRange === '7d') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeRange === '30d') {
            startDate.setDate(startDate.getDate() - 30);
        } else {
            startDate.setDate(startDate.getDate() - 30); // default to 30 days
        }
        startDate.setHours(0, 0, 0, 0);
        
        console.log('Heatmap startDate:', startDate);
        
        // Get user activity data
        let users = await User.find({
            organization_id: organizationId,
            last_login: { $gte: startDate }
        }).select('last_login');
        
        console.log('Found users with recent logins:', users.length);
        
        // If no users with recent logins, get all users with any login data
        if (users.length === 0) {
            console.log('No recent logins found, trying all users with login data...');
            users = await User.find({
                organization_id: organizationId,
                last_login: { $exists: true, $ne: null }
            }).select('last_login createdAt');
            console.log('Found all users with any login data:', users.length);
        }
        
        // If still no data, use createdAt as fallback for demo purposes
        if (users.length === 0) {
            console.log('No login data found, using createdAt as fallback...');
            users = await User.find({
                organization_id: organizationId
            }).select('createdAt last_login');
            
            // Mock some login times for demonstration
            users = users.map(user => ({
                last_login: user.createdAt || new Date()
            }));
            console.log('Using createdAt for', users.length, 'users');
        }
        
        // Initialize heatmap data structure
        const heatmapData = {};
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize all day-hour combinations to 0
        for (let day = 0; day < 7; day++) {
            heatmapData[daysOfWeek[day]] = {};
            for (let hour = 0; hour < 24; hour++) {
                heatmapData[daysOfWeek[day]][hour] = 0;
            }
        }
        
        // Count logins by day of week and hour
        users.forEach(user => {
            if (user.last_login) {
                const loginDate = new Date(user.last_login);
                const dayOfWeek = daysOfWeek[loginDate.getDay()];
                const hour = loginDate.getHours();
                
                if (heatmapData[dayOfWeek] && heatmapData[dayOfWeek][hour] !== undefined) {
                    heatmapData[dayOfWeek][hour]++;
                }
            }
        });
        
        // Convert to array format for frontend
        const heatmapArray = [];
        for (let day = 0; day < 7; day++) {
            const dayName = daysOfWeek[day];
            for (let hour = 0; hour < 24; hour++) {
                heatmapArray.push({
                    day: dayName,
                    hour: hour,
                    count: heatmapData[dayName][hour]
                });
            }
        }
        
        console.log('Heatmap data sample:', heatmapArray.slice(0, 5));
        console.log('Total heatmap entries:', heatmapArray.length);
        
        return res.status(200).json({
            success: true,
            data: heatmapArray
        });
        
    } catch (error) {
        console.error('Heatmap error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getAtRiskLearners = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const organizationId = req.user.organization_id;
        
        // Calculate date threshold for login activity
        const loginThreshold = new Date();
        loginThreshold.setDate(loginThreshold.getDate() - parseInt(days));
        
        console.log('At-risk learners - orgId:', organizationId, 'days:', days);
        console.log('Login threshold:', loginThreshold);
        
        // Get all users in the organization
        const users = await User.find({
            organization_id: organizationId
        }).select('name email last_login createdAt');
        
        console.log('Total users found:', users.length);
        
        // Get user progress data to calculate completion rates
        const userProgress = await UserContentProgress.find({
            organization_id: organizationId
        }).populate([
            {
                path: 'assignment_id',
                populate: {
                    path: 'contentId',
                    model: 'OrganizationModule',
                    select: 'title totalScore'
                }
            },
            {
                path: 'user_id',
                select: 'name email'
            }
        ]);
        
        console.log('User progress records:', userProgress.length);
        
        // Calculate metrics for each user
        const userMetrics = {};
        
        // Initialize all users with default metrics
        users.forEach(user => {
            userMetrics[user._id] = {
                userId: user._id,
                name: user.name,
                email: user.email,
                lastLogin: user.last_login,
                createdAt: user.createdAt,
                totalAssignments: 0,
                completedAssignments: 0,
                averageScore: 0,
                totalScore: 0,
                completedCount: 0,
                riskFactors: []
            };
        });
        
        // Process progress data
        userProgress.forEach(progress => {
            if (progress.user_id && progress.user_id._id) {
                const userId = progress.user_id._id.toString();
                if (userMetrics[userId]) {
                    userMetrics[userId].totalAssignments++;
                    
                    if (progress.status === 'completed') {
                        userMetrics[userId].completedAssignments++;
                        userMetrics[userId].completedCount++;
                        
                        if (progress.score && progress.score > 0) {
                            userMetrics[userId].totalScore += progress.score;
                        }
                    }
                }
            }
        });
        
        // Calculate completion rates and average scores
        Object.values(userMetrics).forEach(metrics => {
            if (metrics.totalAssignments > 0) {
                metrics.completionRate = (metrics.completedAssignments / metrics.totalAssignments) * 100;
            } else {
                metrics.completionRate = 0;
            }
            
            if (metrics.completedCount > 0 && metrics.totalScore > 0) {
                metrics.averageScore = metrics.totalScore / metrics.completedCount;
            } else {
                metrics.averageScore = 0;
            }
            
            // Identify risk factors
            if (!metrics.lastLogin || metrics.lastLogin < loginThreshold) {
                metrics.riskFactors.push('No recent login');
            }
            
            if (metrics.completionRate < 30) {
                metrics.riskFactors.push('Low completion rate');
            }
            
            if (metrics.averageScore < 60 && metrics.completedCount > 0) {
                metrics.riskFactors.push('Low average score');
            }
            
            if (metrics.totalAssignments === 0) {
                metrics.riskFactors.push('No assignments started');
            }
        });
        
        // Filter users with risk factors
        const atRiskLearners = Object.values(userMetrics)
            .filter(user => user.riskFactors.length > 0)
            .sort((a, b) => b.riskFactors.length - a.riskFactors.length)
            .slice(0, 20); // Limit to top 20 at-risk learners
        
        console.log('At-risk learners identified:', atRiskLearners.length);
        
        return res.status(200).json({
            success: true,
            data: atRiskLearners
        });
        
    } catch (error) {
        console.error('At-risk learners error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getContentAnalytics = async (req, res) => {
    try {
        const { contentId } = req.params;
        const organizationId = req.user.organization_id;

        console.log('Fetching analytics for content UUID:', contentId, 'in organization:', organizationId);

        // First, find the module by UUID to get its ObjectId
        const module = await Module.findOne({ 
            uuid: contentId,
            org_id: organizationId 
        }).lean();

        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Content not found"
            });
        }

        console.log('Found module:', module._id, 'Title:', module.title);

        // Find all assignments for this content using the ObjectId
        const assignments = await ForUserAssignment.find({
            contentId: module._id, // Use ObjectId from the found module
            organization_id: organizationId
        }).populate('assigned_users', 'name email')
          .populate('created_by', 'name email')
          .lean();

        console.log('Found assignments:', assignments.length);

        // Get all user progress for this content using the ObjectId
        const userProgress = await UserContentProgress.find({
            contentId: module._id, // Use ObjectId from the found module
            organization_id: organizationId
        }).populate('user_id', 'name email')
          .populate('assignment_id', 'assign_on due_date created_by')
          .lean();

        console.log('Found user progress records:', userProgress.length);

        // Transform data to match AnalyticsPop expected format
        const totalAssignments = await Promise.all(userProgress.map(async (progress) => {
            const user = progress.user_id;
            const assignment = progress.assignment_id;
            
            // Handle start date edge cases
            let startedOn = null;
            if (progress.started_at) {
                startedOn = progress.started_at;
            } else if (progress.status === 'in_progress' || progress.status === 'completed') {
                startedOn = assignment?.assign_on || progress.createdAt;
            }

            // Handle completion date edge cases
            let completedOn = null;
            if (progress.completed_at) {
                completedOn = progress.completed_at;
            } else if (progress.status === 'completed') {
                completedOn = progress.updated_at || new Date();
            }

            // Determine content type and score based on content type using the new calculation
            const contentType = assignment?.contentType || 'course';
            const score = await calculateScore(progress, contentType, module._id);

            // Get assigned by value using the new logic
            const assignedBy = await getAssignedBy(assignment, user, organizationId);

            return {
                _id: progress.uuid,
                userName: user?.name || 'Unknown User',
                email: user?.email || 'unknown@example.com',
                started_at: startedOn,
                completed_at: completedOn,
                status: progress.status === 'assigned' ? 'not-started' : 
                       progress.status === 'in_progress' ? 'in-progress' : 
                       progress.status === 'completed' ? 'completed' : 'not-started',
                score: score,
                averageScore: progress.averageScore || 0,
                timeSpent: calculateTimeSpent(progress.started_at, progress.completed_at, progress.last_activity_at),
                actualDuration: calculateCourseDuration(module),
                assignment_id: {
                    assign_on: assignment?.assign_on || progress.createdAt,
                    due_date: assignment?.due_date,
                    contentType: contentType,
                    contentId: {
                        title: module.title,
                        created_at: module.createdAt,
                        updated_at: module.updatedAt
                    },
                    created_by: {
                        name: assignedBy
                    }
                },
                created_at: progress.createdAt,
                updated_at: progress.updatedAt
            };
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalAssignments
            }
        });

    } catch (error) {
        console.error('Content analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getUserAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        const organizationId = req.user.organization_id;

        console.log('Fetching analytics for user:', userId, 'in organization:', organizationId);

        // First, find the user by UUID to get their ObjectId
        const user = await User.findOne({ 
            uuid: userId,
            organization_id: organizationId 
        }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        console.log('Found user:', user._id, 'Name:', user.name);

        // Get all assignments for this user
        const assignments = await ForUserAssignment.find({
            assigned_users: user._id,
            organization_id: organizationId
        }).populate('assigned_users', 'name email')
          .populate('created_by', 'name email')
          .lean();

        console.log('Found assignments:', assignments.length);

        // Get all user progress for this user using the ObjectId
        const userProgress = await UserContentProgress.find({
            user_id: user._id, // Use ObjectId from the found user
            organization_id: organizationId
        }).populate('assignment_id', 'assign_on due_date created_by contentType')
          .lean();

        console.log('Found user progress records:', userProgress.length);

        // Manually populate content details for each progress record
        const userProgressWithContent = await Promise.all(userProgress.map(async (progress) => {
            let contentDetails = null;
            try {
                // Try to find the content based on assignment type
                const assignment = assignments.find(a => a._id.toString() === progress.assignment_id?._id?.toString());
                if (assignment) {
                    switch (assignment.assign_type) {
                        case 'OrganizationModule':
                            contentDetails = await Module.findById(progress.contentId).lean();
                            break;
                        case 'OrganizationAssessments':
                            contentDetails = await OrganizationAssessments.findById(progress.contentId).lean();
                            break;
                        case 'OrganizationSurvey':
                            contentDetails = await OrganizationSurveys.findById(progress.contentId).lean();
                            break;
                        case 'LearningPath':
                            contentDetails = await LearningPath.findById(progress.contentId).lean();
                            break;
                        default:
                            contentDetails = await Module.findById(progress.contentId).lean();
                    }
                } else {
                    // Fallback to Module if no assignment found
                    contentDetails = await Module.findById(progress.contentId).lean();
                }
            } catch (error) {
                console.log('Could not fetch content details for contentId:', progress.contentId, 'assign_type:', assignments.find(a => a._id.toString() === progress.assignment_id?._id?.toString())?.assign_type);
            }
            
            return {
                ...progress,
                contentId: contentDetails || progress.contentId
            };
        }));

        // Create a comprehensive data structure
        const totalAssignments = [];

        // Process assignments that might not have progress records
        for (const assignment of assignments) {
            // Find corresponding progress record
            const progress = userProgressWithContent.find(p => 
                p.assignment_id?._id?.toString() === assignment._id.toString()
            );

            // Handle start date edge cases
            let startedOn = null;
            if (progress?.started_at) {
                startedOn = progress.started_at;
            } else if (progress?.status === 'in_progress' || progress?.status === 'completed') {
                startedOn = assignment.assign_on || progress.createdAt;
            }

            // Handle completion date edge cases
            let completedOn = null;
            if (progress?.completed_at) {
                completedOn = progress.completed_at;
            } else if (progress?.status === 'completed') {
                completedOn = progress.updated_at || new Date();
            }

            // Determine content type and score
            const contentType = assignment.contentType || 'course';
            const score = progress ? await calculateScore(progress, contentType, progress.contentId) : 0;

            // Get assigned by value
            const assignedBy = await getAssignedBy(assignment, user, organizationId);

            // Get content details
            let contentTitle = 'Unknown Resource';
            let contentCreatedAt = null;
            let contentUpdatedAt = null;

            if (progress?.contentId && typeof progress.contentId === 'object' && progress.contentId.title) {
                contentTitle = progress.contentId.title || 'Unknown Resource';
                contentCreatedAt = progress.contentId.createdAt;
                contentUpdatedAt = progress.contentId.updatedAt;
            } else if (assignment.contentId) {
                // Try to get content details directly based on assignment type
                try {
                    let content = null;
                    switch (assignment.assign_type) {
                        case 'OrganizationModule':
                            content = await Module.findById(assignment.contentId).lean();
                            break;
                        case 'OrganizationAssessments':
                            content = await OrganizationAssessments.findById(assignment.contentId).lean();
                            break;
                        case 'OrganizationSurvey':
                            content = await OrganizationSurveys.findById(assignment.contentId).lean();
                            break;
                        case 'LearningPath':
                            content = await LearningPath.findById(assignment.contentId).lean();
                            break;
                        default:
                            content = await Module.findById(assignment.contentId).lean();
                    }
                    if (content) {
                        contentTitle = content.title || 'Unknown Resource';
                        contentCreatedAt = content.createdAt;
                        contentUpdatedAt = content.updatedAt;
                    }
                } catch (error) {
                    console.log('Could not fetch content details for assign_type:', assignment.assign_type, 'contentId:', assignment.contentId, error);
                }
            }

            totalAssignments.push({
                _id: progress?.uuid || assignment.uuid,
                userName: user?.name || 'Unknown User',
                email: user?.email || 'unknown@example.com',
                started_at: startedOn,
                completed_at: completedOn,
                status: progress?.status === 'assigned' ? 'not-started' : 
                       progress?.status === 'in_progress' ? 'in-progress' : 
                       progress?.status === 'completed' ? 'completed' : 'not-started',
                score: score,
                averageScore: progress?.averageScore || 0,
                timeSpent: progress ? calculateTimeSpent(progress.started_at, progress.completed_at, progress.last_activity_at) : 'Not Started',
                actualDuration: calculateCourseDuration(progress?.contentId),
                assignment_id: {
                    assign_on: assignment.assign_on,
                    due_date: assignment.due_date,
                    contentType: contentType,
                    contentId: {
                        title: contentTitle,
                        created_at: contentCreatedAt,
                        updated_at: contentUpdatedAt
                    },
                    created_by: {
                        name: assignedBy
                    }
                },
                created_at: progress?.createdAt || assignment.createdAt,
                updated_at: progress?.updatedAt || assignment.updatedAt
            });
        }

        // Also add any progress records that don't have assignments
        for (const progress of userProgressWithContent) {
            const hasAssignment = totalAssignments.find(a => 
                a._id === progress.uuid
            );
            
            if (!hasAssignment) {
                // Handle start date edge cases
                let startedOn = null;
                if (progress.started_at) {
                    startedOn = progress.started_at;
                } else if (progress.status === 'in_progress' || progress.status === 'completed') {
                    startedOn = progress.assignment_id?.assign_on || progress.createdAt;
                }

                // Handle completion date edge cases
                let completedOn = null;
                if (progress.completed_at) {
                    completedOn = progress.completed_at;
                } else if (progress.status === 'completed') {
                    completedOn = progress.updated_at || new Date();
                }

                // Determine content type and score
                const contentType = progress.assignment_id?.contentType || progress.contentId?.contentType || 'course';
                const score = await calculateScore(progress, contentType, progress.contentId);

                // Get assigned by value
                const assignedBy = await getAssignedBy(progress.assignment_id, user, organizationId);

                totalAssignments.push({
                    _id: progress.uuid,
                    userName: user?.name || 'Unknown User',
                    email: user?.email || 'unknown@example.com',
                    started_at: startedOn,
                    completed_at: completedOn,
                    status: progress.status === 'assigned' ? 'not-started' : 
                           progress.status === 'in_progress' ? 'in-progress' : 
                           progress.status === 'completed' ? 'completed' : 'not-started',
                    score: score,
                    averageScore: progress.averageScore || 0,
                    timeSpent: calculateTimeSpent(progress.started_at, progress.completed_at, progress.last_activity_at),
                    actualDuration: calculateCourseDuration(progress.contentId),
                    assignment_id: {
                        assign_on: progress.assignment_id?.assign_on || progress.createdAt,
                        due_date: progress.assignment_id?.due_date,
                        contentType: contentType,
                        contentId: {
                            title: progress.contentId?.title || 'Unknown Resource',
                            created_at: progress.contentId?.createdAt,
                            updated_at: progress.contentId?.updatedAt
                        },
                        created_by: {
                            name: assignedBy
                        }
                    },
                    created_at: progress.createdAt,
                    updated_at: progress.updatedAt
                });
            }
        }

        console.log('Total assignments to return:', totalAssignments.length);

        return res.status(200).json({
            success: true,
            data: {
                totalAssignments
            }
        });

    } catch (error) {
        console.error('User analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getAssessmentAnalytics = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        
        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID is required"
            });
        }

        console.log('Fetching analytics for assessment:', assessmentId);

        // Get assessment info first
        let assessment = null;
        let assessmentObjectId = null;
        
        // Handle both UUID and ObjectId cases
        if (assessmentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            assessment = await OrganizationAssessments.findOne({ uuid: assessmentId })
                .populate('organization_id', 'name');
            assessmentObjectId = assessment?._id;
        } else {
            assessmentObjectId = assessmentId;
            assessment = await OrganizationAssessments.findById(assessmentId)
                .populate('organization_id', 'name');
        }

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Get all assignments for this assessment
        const assignments = await ForUserAssignment.find({
            assign_type: "OrganizationAssessments",
            contentId: assessmentObjectId
        })
        .populate('assigned_users', 'name email')
        .populate('created_by', 'name')
        .populate('groups', 'name')
        .sort({ assign_on: -1 });

        console.log('Found assignments:', assignments.length);

        // Get assessment attempts data
        let assessmentAttempts = [];
        if (assessmentObjectId) {
            assessmentAttempts = await OrganizationAssessmentsAttemps.find({
                assessment_id: assessmentObjectId
            })
            .populate('user_id', 'name email')
            .populate('assessment_id', 'title description')
            .sort({ createdAt: -1 });
        }

        console.log('Found assessment attempts:', assessmentAttempts.length);

        // Create a map of user attempts for quick lookup
        const attemptsByUser = new Map();
        assessmentAttempts.forEach(attempt => {
            if (attempt.user_id) {
                attemptsByUser.set(attempt.user_id._id.toString(), attempt);
            }
        });

        // Get assessment info
        let assessmentInfo = {
            id: assessmentId,
            title: assessment.title || 'Unknown Assessment',
            description: assessment.description || 'No description',
            organizationName: assessment.organization_id?.name || 'Unknown Organization'
        };

        // Combine assignments and attempts to show all assigned users
        const allAssignments = [];
        
        assignments.forEach(assignment => {
            if (assignment.assigned_users && assignment.assigned_users.length > 0) {
                assignment.assigned_users.forEach(user => {
                    const userId = user._id.toString();
                    const attempt = attemptsByUser.get(userId);
                    
                    allAssignments.push({
                        userName: user.name || 'Unknown User',
                        email: user.email || 'unknown@example.com',
                        assignment_id: assignment,
                        status: attempt ? 'completed' : 'not-started',
                        started_at: attempt?.attemptedAt || null,
                        completed_at: attempt?.updatedAt || null,
                        updated_at: attempt?.updatedAt || assignment.updatedAt,
                        score: attempt?.score || 0,
                        assign_on: assignment.assign_on,
                        created_at: assignment.createdAt,
                        assigned_by: assignment.created_by,
                        timeSpent: attempt ? calculateTimeSpent(attempt.attemptedAt, attempt.updatedAt, attempt.updatedAt) : null,
                        actualDuration: attempt ? calculateTimeSpent(attempt.attemptedAt, attempt.updatedAt, attempt.updatedAt) : null
                    });
                });
            }
        });

        // Calculate analytics metrics
        const totalAssignments = allAssignments.length;
        const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
        const uniqueUsers = [...new Set(allAssignments.map(a => a.userName))];
        const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
        
        // Calculate scores
        const scores = allAssignments
            .filter(a => a.score !== undefined && a.score !== null && a.score > 0)
            .map(a => a.score);
        
        const averageScore = scores.length > 0 
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
            : 0;
        
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

        // Status distribution
        const statusDistribution = allAssignments.reduce((acc, assignment) => {
            const status = assignment.status || 'assigned';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Performance categories
        const performanceCategories = {
            excellent: scores.filter(score => score >= 90).length,
            good: scores.filter(score => score >= 70 && score < 90).length,
            average: scores.filter(score => score >= 50 && score < 70).length,
            poor: scores.filter(score => score < 50).length
        };

        // Recent assignments (last 10)
        const recentAssignments = allAssignments.slice(0, 10).map(assignment => ({
            userName: assignment.userName,
            userEmail: assignment.email,
            score: assignment.score || 0,
            status: assignment.status || 'not-started',
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            timeSpent: assignment.timeSpent,
            assignedBy: assignment.assigned_by?.name || 'System'
        }));

        const analyticsData = {
            assessmentInfo,
            overview: {
                totalAttempts: totalAssignments,
                uniqueUsers: uniqueUsers.length,
                completionRate: Math.round(completionRate * 100) / 100,
                averageScore: Math.round(averageScore * 100) / 100,
                highestScore,
                lowestScore
            },
            statusDistribution,
            performanceCategories,
            timeAnalytics: {
                attemptsLast30Days: totalAssignments,
                attemptsLast7Days: totalAssignments,
                averageTimeSpent: calculateAverageTimeSpent(assessmentAttempts)
            },
            recentAttempts: recentAssignments,
            detailedAttempts: allAssignments.map(assignment => ({
                userName: assignment.userName,
                userEmail: assignment.email,
                score: assignment.score || 0,
                status: assignment.status || 'not-started',
                startedAt: assignment.started_at,
                completedAt: assignment.completed_at,
                timeSpent: assignment.timeSpent,
                createdAt: assignment.created_at,
                assignedBy: assignment.assigned_by?.name || 'System'
            }))
        };

        console.log('Assessment analytics calculated successfully');

        return res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Assessment analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Helper function to calculate average time spent
const calculateAverageTimeSpent = (attempts) => {
    const validAttempts = attempts.filter(attempt => 
        attempt.attemptedAt && attempt.updatedAt
    );
    
    if (validAttempts.length === 0) return '0 min';
    
    const totalTimeMs = validAttempts.reduce((total, attempt) => {
        const start = new Date(attempt.attemptedAt);
        const end = new Date(attempt.updatedAt);
        return total + (end - start);
    }, 0);
    
    const avgTimeMs = totalTimeMs / validAttempts.length;
    const avgHours = Math.floor(avgTimeMs / (1000 * 60 * 60));
    const avgMins = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (avgHours > 0) {
        return `${avgHours}h ${avgMins}m`;
    } else {
        return `${avgMins} min`;
    }
};

const getSurveyAnalytics = async (req, res) => {
    try {
        const { surveyId } = req.params;
        
        if (!surveyId) {
            return res.status(400).json({
                success: false,
                message: "Survey ID is required"
            });
        }

        console.log('Fetching analytics for survey:', surveyId);

        // Get survey info first
        let survey = null;
        let surveyObjectId = null;
        
        // Handle both UUID and ObjectId cases
        if (surveyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            survey = await OrganizationSurveys.findOne({ uuid: surveyId })
                .populate('organization_id', 'name');
            surveyObjectId = survey?._id;
        } else {
            surveyObjectId = surveyId;
            survey = await OrganizationSurveys.findById(surveyId)
                .populate('organization_id', 'name');
        }

        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "Survey not found"
            });
        }

        // Get all assignments for this survey
        const assignments = await ForUserAssignment.find({
            assign_type: "OrganizationSurvey",
            contentId: surveyObjectId
        })
        .populate('assigned_users', 'name email')
        .populate('created_by', 'name')
        .populate('groups', 'name')
        .sort({ assign_on: -1 });

        console.log('Found assignments:', assignments.length);

        // Get survey responses data
        let surveyResponses = [];
        if (surveyObjectId) {
            surveyResponses = await OrganizationSurveyResponses.find({
                survey_assignment_id: surveyObjectId.toString()
            })
            .populate('user_id', 'name email')
            .sort({ submitted_at: -1 });
        }

        console.log('Found survey responses:', surveyResponses.length);

        // Create a map of user responses for quick lookup
        const responsesByUser = new Map();
        surveyResponses.forEach(response => {
            if (response.user_id) {
                responsesByUser.set(response.user_id._id.toString(), response);
            }
        });

        // Get survey info
        let surveyInfo = {
            id: surveyId,
            title: survey.title || 'Unknown Survey',
            description: survey.description || 'No description',
            organizationName: survey.organization_id?.name || 'Unknown Organization'
        };

        // Combine assignments and responses to show all assigned users
        const allAssignments = [];
        
        assignments.forEach(assignment => {
            if (assignment.assigned_users && assignment.assigned_users.length > 0) {
                assignment.assigned_users.forEach(user => {
                    const userId = user._id.toString();
                    const response = responsesByUser.get(userId);
                    
                    allAssignments.push({
                        userName: user.name || 'Unknown User',
                        email: user.email || 'unknown@example.com',
                        assignment_id: assignment,
                        status: response ? 'completed' : 'not-started',
                        started_at: response?.createdAt || null,
                        completed_at: response?.submitted_at || null,
                        updated_at: response?.updatedAt || assignment.updatedAt,
                        assign_on: assignment.assign_on,
                        created_at: assignment.createdAt,
                        assigned_by: assignment.created_by,
                        timeSpent: response ? calculateTimeSpent(response.createdAt, response.submitted_at, response.updatedAt) : null,
                        actualDuration: response ? calculateTimeSpent(response.createdAt, response.submitted_at, response.updatedAt) : null,
                        responses: response?.responses || null
                    });
                });
            }
        });

        // Calculate analytics metrics
        const totalAssignments = allAssignments.length;
        const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
        const uniqueUsers = [...new Set(allAssignments.map(a => a.userName))];
        const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

        // Status distribution (for surveys, all are completed since they're responses)
        const statusDistribution = allAssignments.reduce((acc, assignment) => {
            const status = assignment.status || 'assigned';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Recent assignments (last 10)
        const recentAssignments = allAssignments.slice(0, 10).map(assignment => ({
            userName: assignment.userName,
            userEmail: assignment.email,
            status: assignment.status || 'not-started',
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            timeSpent: assignment.timeSpent,
            assignedBy: assignment.assigned_by?.name || 'System'
        }));

        // Detailed assignments
        const detailedAssignments = allAssignments.map(assignment => ({
            userName: assignment.userName,
            userEmail: assignment.email,
            status: assignment.status || 'not-started',
            startedAt: assignment.started_at,
            completedAt: assignment.completed_at,
            timeSpent: assignment.timeSpent,
            createdAt: assignment.created_at,
            assignedBy: assignment.assigned_by?.name || 'System',
            responses: assignment.responses
        }));

        const analyticsData = {
            surveyInfo,
            overview: {
                totalResponses: totalAssignments,
                uniqueUsers: uniqueUsers.length,
                completionRate: Math.round(completionRate * 100) / 100,
                averageScore: 0, // Surveys don't typically have scores
                highestScore: 0,
                lowestScore: 0
            },
            statusDistribution,
            performanceCategories: {
                excellent: 0,
                good: 0,
                average: 0,
                poor: 0
            },
            timeAnalytics: {
                responsesLast30Days: totalAssignments,
                responsesLast7Days: totalAssignments,
                averageTimeSpent: calculateAverageTimeSpent(surveyResponses.map(r => ({
                    attemptedAt: r.createdAt,
                    updatedAt: r.submitted_at
                })))
            },
            recentResponses: recentAssignments,
            detailedResponses: detailedAssignments
        };

        console.log('Survey analytics calculated successfully');

        return res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Survey analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getLearningPathAnalytics = async (req, res) => {
    try {
        const { learningPathId } = req.params;
        
        if (!learningPathId) {
            return res.status(400).json({
                success: false,
                message: "Learning Path ID is required"
            });
        }

        console.log('Fetching analytics for learning path:', learningPathId);

        // Get learning path info first
        let learningPath = null;
        let learningPathObjectId = null;
        
        // Handle both UUID and ObjectId cases
        if (learningPathId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            learningPath = await LearningPath.findOne({ uuid: learningPathId })
                .populate('organization_id', 'name')
                .populate('created_by', 'name');
            learningPathObjectId = learningPath?._id;
        } else {
            learningPathObjectId = learningPathId;
            learningPath = await LearningPath.findById(learningPathId)
                .populate('organization_id', 'name')
                .populate('created_by', 'name');
        }

        if (!learningPath) {
            return res.status(404).json({
                success: false,
                message: "Learning Path not found"
            });
        }

        // Get all assignments for this learning path
        const assignments = await ForUserAssignment.find({
            assign_type: "LearningPath",
            contentId: learningPathObjectId
        })
        .populate('assigned_users', 'name email')
        .populate('created_by', 'name')
        .populate('groups', 'name')
        .sort({ assign_on: -1 });

        console.log('Found assignments:', assignments.length);

        // Get user progress data for learning path
        const userProgressData = [];
        
        assignments.forEach(assignment => {
            if (assignment.assigned_users && assignment.assigned_users.length > 0) {
                assignment.assigned_users.forEach(user => {
                    const userId = user._id.toString();
                    
                    // Get progress for each lesson in the learning path
                    const lessonProgress = [];
                    if (learningPath.lessons && learningPath.lessons.length > 0) {
                        learningPath.lessons.forEach(lesson => {
                            // For each lesson, check if user has progress
                            lessonProgress.push({
                                lessonId: lesson.id,
                                lessonTitle: lesson.title || 'Untitled Lesson',
                                lessonType: lesson.type,
                                lessonUuid: lesson.uuid,
                                status: 'not-started', // This would need to be determined from actual progress tracking
                                startedAt: null,
                                completedAt: null,
                                score: 0
                            });
                        });
                    }
                    
                    userProgressData.push({
                        userName: user.name || 'Unknown User',
                        email: user.email || 'unknown@example.com',
                        assignment_id: assignment,
                        status: 'not-started', // Default status - would be calculated based on lesson progress
                        started_at: null,
                        completed_at: null,
                        updated_at: assignment.updatedAt,
                        score: 0,
                        assign_on: assignment.assign_on,
                        created_at: assignment.createdAt,
                        assigned_by: assignment.created_by,
                        timeSpent: null,
                        actualDuration: null,
                        lessonProgress: lessonProgress
                    });
                });
            }
        });

        // Calculate analytics metrics
        const totalAssignments = userProgressData.length;
        const completedAssignments = userProgressData.filter(u => u.status === 'completed').length;
        const uniqueUsers = [...new Set(userProgressData.map(u => u.userName))];
        const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

        // Status distribution
        const statusDistribution = userProgressData.reduce((acc, user) => {
            const status = user.status || 'not-started';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Recent assignments (last 10)
        const recentAssignments = userProgressData.slice(0, 10).map(user => ({
            userName: user.userName,
            userEmail: user.email,
            status: user.status || 'not-started',
            startedAt: user.started_at,
            completedAt: user.completed_at,
            timeSpent: user.timeSpent,
            assignedBy: user.assigned_by?.name || 'System'
        }));

        // Detailed assignments
        const detailedAssignments = userProgressData.map(user => ({
            userName: user.userName,
            userEmail: user.email,
            status: user.status || 'not-started',
            startedAt: user.started_at,
            completedAt: user.completed_at,
            timeSpent: user.timeSpent,
            createdAt: user.created_at,
            assignedBy: user.assigned_by?.name || 'System',
            lessonProgress: user.lessonProgress
        }));

        const analyticsData = {
            learningPathInfo: {
                id: learningPathId,
                title: learningPath.title || 'Unknown Learning Path',
                description: learningPath.description || 'No description',
                organizationName: learningPath.organization_id?.name || 'Unknown Organization',
                totalLessons: learningPath.lessons?.length || 0,
                duration: learningPath.duration || 0,
                category: learningPath.category || 'Uncategorized'
            },
            overview: {
                totalAssignments,
                uniqueUsers: uniqueUsers.length,
                completionRate: Math.round(completionRate * 100) / 100,
                averageScore: 0, // Learning paths don't typically have overall scores
                highestScore: 0,
                lowestScore: 0
            },
            statusDistribution,
            performanceCategories: {
                excellent: 0,
                good: 0,
                average: 0,
                poor: 0
            },
            timeAnalytics: {
                assignmentsLast30Days: totalAssignments,
                assignmentsLast7Days: totalAssignments,
                averageTimeSpent: '0 min'
            },
            recentAssignments,
            detailedAssignments
        };

        console.log('Learning path analytics calculated successfully');

        return res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Learning path analytics error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = { getCourseDistribution, getUsersData, calculateUsageTrend, getAdoption, getTeams, getEngagementHeatmap, getAtRiskLearners, getContentAnalytics, getUserAnalytics, getAssessmentAnalytics, getSurveyAnalytics, getLearningPathAnalytics };
