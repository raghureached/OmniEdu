const Module = require("../../models/Admin/Module/moduleOrganization_model");
const UserContentProgress = require("../../models/User/userContentProgress_model");
const User = require("../../models/User/users_model");
const Team = require("../../models/Admin/GroupsOrTeams/teams_model");
const SubTeam = require("../../models/Admin/GroupsOrTeams/subTeams_model");
const Organization = require("../../models/globalAdmin/Organization/organization_model");
const ForUserAssignment = require("../../models/Admin/forUserAssigments_model");
const mongoose = require("mongoose");

// Get organization creation date
const getOrganizationCreationDate = async (req, res) => {
    try {
        const organizationId = req.user?.organization_id;
        
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID not found"
            });
        }

        const organization = await Organization.findById(organizationId).select('createdAt');
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: "Organization not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                createdAt: organization.createdAt
            }
        });
    } catch (error) {
        console.error("Error fetching organization creation date:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const OrganizationAssessmentsAttemps = require("../../models/Admin/Assessments/organizationAssessmentsAttemps_model");
const OrganizationAssessments = require("../../models/Admin/Assessments/organizationAssessments_model");
const OrganizationSurveys = require("../../models/Admin/Surveys/organizationSurveys_model");
const OrganizationSurveyResponses = require("../../models/Admin/Surveys/organizationSurveyResponses_model");
const LearningPath = require("../../models/Admin/LearningPaths/learningPath_model");

// Get content counts for dashboard (no time filtering)
const getContentCountsAll = async (req, res) => {
    try {
        const organizationId = req.user?.organization_id;
        
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID not found"
            });
        }

        // Get counts for all content types without any date filtering
        const [modulesCount, assessmentsCount, surveysCount, learningPathsCount] = await Promise.all([
            Module.countDocuments({ org_id: organizationId }),
            OrganizationAssessments.countDocuments({ organization_id: organizationId }),
            OrganizationSurveys.countDocuments({ organization_id: organizationId }),
            LearningPath.countDocuments({ organization_id: organizationId })
        ]);

        // Get published counts without any date filtering
        const [publishedModulesCount, publishedAssessmentsCount, publishedSurveysCount] = await Promise.all([
            Module.countDocuments({ org_id: organizationId, status: 'Published' }),
            OrganizationAssessments.countDocuments({ organization_id: organizationId, status: 'Published' }),
            OrganizationSurveys.countDocuments({ organization_id: organizationId, status: 'Published' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                modules: {
                    total: modulesCount,
                    published: publishedModulesCount
                },
                assessments: {
                    total: assessmentsCount,
                    published: publishedAssessmentsCount
                },
                surveys: {
                    total: surveysCount,
                    published: publishedSurveysCount
                },
                learningPaths: {
                    total: learningPathsCount
                }
            }
        });
    } catch (error) {
        console.error("Error fetching content counts:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// Get content counts for dashboard
const getContentCounts = async (req, res) => {
    try {
        const organizationId = req.user?.organization_id;
        const { timeRange = '7d' } = req.query; // Default to 7 days
        
        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: "Organization ID not found"
            });
        }

        // Calculate date filter based on time range
        let dateFilter = {};
        if (timeRange !== 'all') {
            const cutoffDate = new Date();
            
            switch (timeRange) {
                case '7d':
                    cutoffDate.setDate(cutoffDate.getDate() - 7);
                    break;
                case '30d':
                    cutoffDate.setDate(cutoffDate.getDate() - 30);
                    break;
                case '90d':
                    cutoffDate.setDate(cutoffDate.getDate() - 90);
                    break;
                case 'mtd':
                    cutoffDate.setDate(cutoffDate.getDate() - (cutoffDate.getDate() - 1));
                    break;
                default:
                    cutoffDate.setDate(cutoffDate.getDate() - 7);
            }
            
            dateFilter = { createdAt: { $gte: cutoffDate } };
        }

        // Get counts for all content types with date filter
        const [modulesCount, assessmentsCount, surveysCount, learningPathsCount] = await Promise.all([
            Module.countDocuments({ org_id: organizationId, ...dateFilter }),
            OrganizationAssessments.countDocuments({ organization_id: organizationId, ...dateFilter }),
            OrganizationSurveys.countDocuments({ organization_id: organizationId, ...dateFilter }),
            LearningPath.countDocuments({ organization_id: organizationId, ...dateFilter })
        ]);

        // Get published counts with date filter
        const [publishedModulesCount, publishedAssessmentsCount, publishedSurveysCount] = await Promise.all([
            Module.countDocuments({ org_id: organizationId, status: 'Published', ...dateFilter }),
            OrganizationAssessments.countDocuments({ organization_id: organizationId, status: 'Published', ...dateFilter }),
            OrganizationSurveys.countDocuments({ organization_id: organizationId, status: 'Published', ...dateFilter })
        ]);

        res.status(200).json({
            success: true,
            data: {
                modules: {
                    total: modulesCount,
                    published: publishedModulesCount
                },
                assessments: {
                    total: assessmentsCount,
                    published: publishedAssessmentsCount
                },
                surveys: {
                    total: surveysCount,
                    published: publishedSurveysCount
                },
                learningPaths: {
                    total: learningPathsCount
                }
            }
        });
    } catch (error) {
        console.error("Error fetching content counts:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

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
        const { category, team, subteam, timeRange } = req.query;
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
        
        if (subteam && subteam !== 'all') {
            query.subteam = subteam;
        }
        
        // Apply time range filter if provided
        if (timeRange) {
            let cutoffDate = new Date();
            
            if (timeRange === '7d') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (timeRange === '30d') {
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            } else if (timeRange === '90d') {
                cutoffDate.setDate(cutoffDate.getDate() - 90);
            } else if (timeRange === 'mtd') {
                // Month to date - from first day of current month
                cutoffDate = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), 1);
            } else if (timeRange === 'custom') {
                // Custom date range - use provided start and end dates
                if (req.query.startDate) {
                    cutoffDate = new Date(req.query.startDate);
                } else {
                    // Fallback to 30 days if no start date provided
                    cutoffDate.setDate(cutoffDate.getDate() - 30);
                }
            } else {
                // Default to 30 days
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            }
            
            query.createdAt = { $gte: cutoffDate };
        }
        
        const modules = await Module.find(query);

        // If specific category is filtered, return only that category
        if (category && category !== 'all') {
            const filtered = modules.filter(m => m.category === category);
            
            // Get course names and team names for this category
            const courseNames = filtered.map(m => m.title || 'Unnamed Course');
            const teamIds = [...new Set(filtered.map(m => m.team).filter(Boolean))];
            
            // Fetch team names
            const Team = require('../../models/Admin/GroupsOrTeams/teams_model');
            const teams = await Team.find({ _id: { $in: teamIds } }).select('name');
            const teamNames = teams.map(t => t.name);
            
            const courseLibrary = [{
                category,
                courses: filtered.length,
                teams: new Set(filtered.map(m => m.team)).size,
                courseNames: courseNames.join('; '),
                teamNames: teamNames.join('; ')
            }];
            
            return res.status(200).json({
                success: true,
                courseLibrary
            });
        }

        // Return all categories if no specific filter
        const courseLibrary = await Promise.all(categories.map(async cat => {
            const filtered = modules.filter(m => m.category === cat);
            
            // Get course names and team names for this category
            const courseNames = filtered.map(m => m.title || 'Unnamed Course');
            const teamIds = [...new Set(filtered.map(m => m.team).filter(Boolean))];
            
            // Fetch team names
            const Team = require('../../models/Admin/GroupsOrTeams/teams_model');
            const teams = await Team.find({ _id: { $in: teamIds } }).select('name');
            const teamNames = teams.map(t => t.name);

            return {
                category: cat,
                courses: filtered.length,
                teams: new Set(filtered.map(m => m.team)).size,
                courseNames: courseNames.join('; '),
                teamNames: teamNames.join('; ')
            };
        }));

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
        const { timeRange, team, subteam } = req.query;
        const usageTrend = [];
        const organizationId = req.user.organization_id;
        
        // For 7-day filter, return daily data
        if (timeRange === '7d') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const UserProfile = require('../../models/userProfiles_model');
            
            // Get filtered user IDs once if team/subteam filters are applied
            let filteredUserIds = null;
            if (team && team !== 'all') {
                const userProfileQuery = UserProfile.find({
                    'teams.team_id': team,
                    ...(subteam && subteam !== 'all' ? { 'teams.sub_team_id': subteam } : {})
                }).distinct('user_id');
                filteredUserIds = await userProfileQuery;
            }
            
            for (let day = 6; day >= 0; day--) {
                const dayStart = new Date();
                dayStart.setDate(dayStart.getDate() - day);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                // Format date as month abbreviation + day (e.g., jan9)
                const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                const formattedDate = `${monthNames[dayStart.getMonth()]}${dayStart.getDate()}`;

                // Build base query filter
                let baseFilter = { organization_id: organizationId };
                
                // Add team/subteam filters by using filtered user IDs
                if (filteredUserIds) {
                    baseFilter._id = { $in: filteredUserIds };
                }

                // Calculate DAU for this day
                const dau = await User.countDocuments({
                    ...baseFilter,
                    last_login: { $gte: dayStart, $lte: dayEnd }
                });

                // Calculate MAU for this day (users active in last 30 days)
                const mauStartDate = new Date(dayEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
                const mau = await User.countDocuments({
                    ...baseFilter,
                    last_login: { $gte: mauStartDate, $lte: dayEnd }
                });

                usageTrend.push({
                    date: dayNames[dayStart.getDay()],
                    formattedDate: formattedDate,
                    dau: dau,
                    mau: mau
                });
            }

            return res.status(200).json({
                success: true,
                data: usageTrend
            });
        }
        
        // For other time ranges, keep the existing weekly logic
        let weeksToShow = 4; // default
        if (timeRange === '30d') weeksToShow = 4;
        else if (timeRange === '90d') weeksToShow = 12;
        else if (timeRange === 'mtd') {
            // For month to date, calculate weeks from first day of month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const daysSinceMonthStart = Math.ceil((now - firstDayOfMonth) / (1000 * 60 * 60 * 24));
            weeksToShow = Math.max(1, Math.ceil(daysSinceMonthStart / 7));
        }
        else if (timeRange === 'custom' && req.query.startDate && req.query.endDate) {
            // For custom date range, calculate weeks based on the date range
            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            weeksToShow = Math.max(1, Math.ceil(daysDiff / 7));
        }
        
        // Build base query filter
        let baseFilter = { organization_id: organizationId };
        const UserProfile = require('../../models/userProfiles_model');
        
        // Get filtered user IDs once if team/subteam filters are applied
        let filteredUserIds = null;
        if (team && team !== 'all') {
            const userProfileQuery = UserProfile.find({
                'teams.team_id': team,
                ...(subteam && subteam !== 'all' ? { 'teams.sub_team_id': subteam } : {})
            }).distinct('user_id');
            filteredUserIds = await userProfileQuery;
        }
        
        for (let week = weeksToShow - 1; week >= 0; week--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (week * 7 + 6)); // Go back to start of week
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // End of week
            weekEnd.setHours(23, 59, 59, 999);

            // Build filter for this week
            let weekFilter = { ...baseFilter };
            if (filteredUserIds) {
                weekFilter._id = { $in: filteredUserIds };
            }

            // Calculate DAU for this week (average daily active users)
            const weekDAUPromises = [];
            for (let day = 0; day < 7; day++) {
                const dayStart = new Date(weekStart);
                dayStart.setDate(dayStart.getDate() + day);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const dayDAU = User.countDocuments({
                    ...weekFilter,
                    last_login: { $gte: dayStart, $lte: dayEnd }
                });
                weekDAUPromises.push(dayDAU);
            }

            const weekDAUCounts = await Promise.all(weekDAUPromises);
            const avgDAU = Math.round(weekDAUCounts.reduce((sum, count) => sum + count, 0) / 7);

            // Calculate MAU for this week (users active in the last 30 days from week end)
            const mauDate = new Date(weekEnd);
            const mauStartDate = new Date(mauDate.getTime() - 30 * 24 * 60 * 60 * 1000);

            const weekMAU = await User.countDocuments({
                ...weekFilter,
                last_login: { $gte: mauStartDate, $lte: mauDate }
            });

            // Format date range for the week
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const weekStartFormatted = `${monthNames[weekStart.getMonth()]}${weekStart.getDate()}`;
            const weekEndFormatted = `${monthNames[weekEnd.getMonth()]}${weekEnd.getDate()}`;

            usageTrend.push({
                date: `Week ${weeksToShow - week}`,
                formattedDate: `${weekStartFormatted} - ${weekEndFormatted}`,
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
        const { timeRange = '7d', startDate, endDate } = req.query;
        const organizationId = req.user.organization_id;

        // Calculate date ranges based on timeRange
        const now = new Date();
        let dateRangeStart, dateRangeEnd, mauDateRangeStart, mauDateRangeEnd;
        let daysInPeriod = 7;

        switch (timeRange) {
            case '7d':
                dateRangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateRangeEnd = now;
                mauDateRangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                mauDateRangeEnd = now;
                daysInPeriod = 7;
                break;
            case 'mtd':
                dateRangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
                dateRangeEnd = now;
                mauDateRangeStart = dateRangeStart;
                mauDateRangeEnd = now;
                daysInPeriod = Math.ceil((now - dateRangeStart) / (24 * 60 * 60 * 1000));
                break;
            case '30d':
                dateRangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                dateRangeEnd = now;
                mauDateRangeStart = dateRangeStart;
                mauDateRangeEnd = now;
                daysInPeriod = 30;
                break;
            case '90d':
                dateRangeStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                dateRangeEnd = now;
                mauDateRangeStart = dateRangeStart;
                mauDateRangeEnd = now;
                daysInPeriod = 90;
                break;
            case 'custom':
                if (startDate && endDate) {
                    dateRangeStart = new Date(startDate);
                    dateRangeEnd = new Date(endDate);
                    mauDateRangeStart = dateRangeStart;
                    mauDateRangeEnd = dateRangeEnd;
                    daysInPeriod = Math.ceil((dateRangeEnd - dateRangeStart) / (24 * 60 * 60 * 1000));
                } else {
                    // Fallback to 7 days if custom dates not provided
                    dateRangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    dateRangeEnd = now;
                    mauDateRangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    mauDateRangeEnd = now;
                    daysInPeriod = 7;
                }
                break;
            default:
                dateRangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateRangeEnd = now;
                mauDateRangeStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                mauDateRangeEnd = now;
                daysInPeriod = 7;
        }

        // Total Users (doesn't change with time range)
        const totalUsers = await User.countDocuments({ organization_id: organizationId });

        // Calculate DAU (average daily active users over the period)
        const dauPromises = [];
        for (let day = 0; day < daysInPeriod; day++) {
            const dayStart = new Date(dateRangeStart);
            dayStart.setDate(dayStart.getDate() + day);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const dayDAU = User.countDocuments({
                organization_id: organizationId,
                last_login: { $gte: dayStart, $lte: dayEnd }
            });
            dauPromises.push(dayDAU);
        }

        const dauCounts = await Promise.all(dauPromises);
        const avgDAU = Math.round(dauCounts.reduce((sum, count) => sum + count, 0) / daysInPeriod);

        // Calculate MAU (users active in the MAU period)
        const mau = await User.countDocuments({
            organization_id: organizationId,
            last_login: { $gte: mauDateRangeStart, $lte: mauDateRangeEnd }
        });

        // Calculate Platform Stickiness
        const stickinessScore = mau > 0 ? ((avgDAU / mau) * 100).toFixed(1) : 0;

        // Calculate Avg Time on Platform (mock implementation - you may need to adjust based on your actual data structure)
        // This would typically require session data or time tracking data
        const avgTimeOnPlatform = "2h 45m"; // Placeholder - implement based on your actual time tracking

        // Calculate previous period for change percentages
        const previousPeriodStart = new Date(dateRangeStart.getTime() - (dateRangeEnd - dateRangeStart));
        const previousPeriodEnd = dateRangeStart;

        const previousDAUPromises = [];
        for (let day = 0; day < daysInPeriod; day++) {
            const dayStart = new Date(previousPeriodStart);
            dayStart.setDate(dayStart.getDate() + day);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const dayDAU = User.countDocuments({
                organization_id: organizationId,
                last_login: { $gte: dayStart, $lte: dayEnd }
            });
            previousDAUPromises.push(dayDAU);
        }

        const previousDAUCounts = await Promise.all(previousDAUPromises);
        const previousAvgDAU = Math.round(previousDAUCounts.reduce((sum, count) => sum + count, 0) / daysInPeriod);

        const previousMAU = await User.countDocuments({
            organization_id: organizationId,
            last_login: { $gte: new Date(mauDateRangeStart.getTime() - (mauDateRangeEnd - mauDateRangeStart)), $lt: mauDateRangeStart }
        });

        const dauChange = previousAvgDAU > 0 ? (((avgDAU - previousAvgDAU) / previousAvgDAU) * 100).toFixed(1) : 0;
        const mauChange = previousMAU > 0 ? (((mau - previousMAU) / previousMAU) * 100).toFixed(1) : 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                dau: avgDAU,
                mau,
                stickinessScore,
                avgTimeOnPlatform,
                dauChange,
                mauChange,
                timeRange,
                period: {
                    start: dateRangeStart,
                    end: dateRangeEnd,
                    days: daysInPeriod
                }
            }
        });
    } catch (error) {
        console.error("Error fetching users data:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

const getAdoption = async (req, res) => {
    try {
        const { category, team, subteam, timeRange } = req.query;
        console.log('getAdoption called with params:', { category, team, subteam, timeRange });
        console.log('Organization ID:', req.user.organization_id);
       
        let progressQuery = { organization_id: req.user.organization_id };
        
        // Apply time range filter if provided
        if (timeRange) {
            let cutoffDate = new Date();
            
            if (timeRange === '7d') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (timeRange === '30d') {
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            } else if (timeRange === '90d') {
                cutoffDate.setDate(cutoffDate.getDate() - 90);
            } else if (timeRange === 'mtd') {
                // Month to date - from first day of current month
                cutoffDate = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), 1);
            } else if (timeRange === 'custom' && req.query.startDate) {
                // Custom date range - use provided start date
                cutoffDate = new Date(req.query.startDate);
            } else {
                // Default to 30 days
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            }
            
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
            const courseSubteam = entry.assignment_id?.contentId?.subteam?.toString();

            if (!contentId) return;

            // Apply category filter if specified
            if (category && category !== 'all' && courseCategory !== category) return;
            
            // Apply team filter if specified (compare ObjectId strings)
            if (team && team !== 'all' && courseTeam !== team) return;
            
            // Apply subteam filter if specified (compare ObjectId strings)
            if (subteam && subteam !== 'all' && courseSubteam !== subteam) return;

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
            .populate('subTeams')
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

const getSubteams = async (req, res) => {
    try {
        const subteams = await SubTeam.find()
            .populate({
                path: 'team_id',
                match: { organization_id: req.user.organization_id },
                select: '_id name'
            })
            .select('_id name team_id')
            .sort({ name: 1 });

        // Filter out subteams whose parent team doesn't belong to this organization
        const filteredSubteams = subteams.filter(subteam => subteam.team_id);

        return res.status(200).json({
            success: true,
            subteams: filteredSubteams
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
        } else if (timeRange === '90d') {
            startDate.setDate(startDate.getDate() - 90);
        } else if (timeRange === 'mtd') {
            // Month to date - from first day of current month
            startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        } else if (timeRange === 'custom' && req.query.startDate) {
            // Custom date range - use provided start date
            startDate = new Date(req.query.startDate);
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
        const { timeRange, days, riskLevel } = req.query;
        const organizationId = req.user.organization_id;
        
        // Calculate date threshold for login activity based on timeRange
        const loginThreshold = new Date();
        let daysToUse = 30; // default
        
        if (timeRange === '7d') {
            daysToUse = 7;
        } else if (timeRange === '30d') {
            daysToUse = 30;
        } else if (timeRange === '90d') {
            daysToUse = 90;
        } else if (timeRange === 'mtd') {
            // For month to date, use days from first day of month
            const firstDayOfMonth = new Date(loginThreshold.getFullYear(), loginThreshold.getMonth(), 1);
            daysToUse = Math.ceil((loginThreshold - firstDayOfMonth) / (1000 * 60 * 60 * 24));
        } else if (timeRange === 'custom' && req.query.startDate) {
            // For custom date range, calculate days from start date
            const startDate = new Date(req.query.startDate);
            daysToUse = Math.ceil((loginThreshold - startDate) / (1000 * 60 * 60 * 24));
        } else if (days) {
            // Fallback to explicit days parameter if provided
            daysToUse = parseInt(days);
        }
        
        loginThreshold.setDate(loginThreshold.getDate() - daysToUse);
        
        console.log('At-risk learners - orgId:', organizationId, 'days:', days);
        console.log('Login threshold:', loginThreshold);
        
        // Get all users in the organization
        const users = await User.find({
            organization_id: organizationId
        }).select('name email last_login createdAt uuid');
        
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
                uuid: user.uuid,
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
        let atRiskLearners = Object.values(userMetrics)
            .filter(user => user.riskFactors.length > 0);
        
        // Apply risk level filtering if specified
        if (riskLevel && riskLevel !== 'all') {
            atRiskLearners = atRiskLearners.filter(user => {
                const userRiskLevel = user.riskFactors.length >= 3 ? 'high' : 
                                   user.riskFactors.length >= 2 ? 'medium' : 'low';
                return userRiskLevel === riskLevel;
            });
        }
        
        // Sort by last login (least recent first), then by risk factors (most at-risk first), and limit to top 20
        atRiskLearners = atRiskLearners
            .sort((a, b) => {
                // First sort by last login (least recent first)
                const aLastLogin = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
                const bLastLogin = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
                
                if (aLastLogin.getTime() !== bLastLogin.getTime()) {
                    return aLastLogin.getTime() - bLastLogin.getTime();
                }
                
                // If last login dates are the same, sort by risk factors (most at-risk first)
                return b.riskFactors.length - a.riskFactors.length;
            })
            .slice(0, 20);
        
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

const getCoursePerformanceInsights = async (req, res) => {
    try {
        const { content, timeRange, team, subteam } = req.query;
        console.log('Course Performance Insights called with:', { content, timeRange, team, subteam, orgId: req.user.organization_id });
        
        let progressQuery = { organization_id: req.user.organization_id };
        
        // Apply time range filter if provided
        if (timeRange) {
            let cutoffDate = new Date();
            
            if (timeRange === '7d') {
                cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (timeRange === '30d') {
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            } else if (timeRange === '90d') {
                cutoffDate.setDate(cutoffDate.getDate() - 90);
            } else if (timeRange === 'mtd') {
                // Month to date - from first day of current month
                cutoffDate = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), 1);
            } else if (timeRange === 'custom' && req.query.startDate) {
                // Custom date range - use provided start date
                cutoffDate = new Date(req.query.startDate);
            } else {
                // Default to 30 days
                cutoffDate.setDate(cutoffDate.getDate() - 30);
            }
            
            progressQuery.createdAt = { $gte: cutoffDate };
        }
        
        let progress = [];
        let contentTypeModel = "OrganizationModule";
        let contentTypeField = "contentId";
        
        // Determine which content type to fetch based on filter
        switch (content) {
            case "assessments":
                contentTypeModel = "OrganizationAssessments";
                break;
            case "surveys":
                contentTypeModel = "OrganizationSurveys";
                break;
            case "learningpaths":
                contentTypeModel = "LearningPath";
                break;
            case "modules":
            default:
                contentTypeModel = "OrganizationModule";
                break;
        }
        
        // Fetch progress data based on content type
        if (content === "assessments") {
            // Get users from organization first, then get their assessment attempts
            const orgUsers = await User.find({ organization_id: req.user.organization_id }).select('_id');
            const userIds = orgUsers.map(u => u._id);
            
            progress = await OrganizationAssessmentsAttemps
                .find({
                    user_id: { $in: userIds },
                    ...(timeRange && { createdAt: progressQuery.createdAt })
                })
                .populate({
                    path: "assessment_id"
                })
                .populate({
                    path: "user_id",
                    select: "name email"
                });
        } else if (content === "surveys") {
            // Get users from organization first, then get their survey responses
            const orgUsers = await User.find({ organization_id: req.user.organization_id }).select('_id');
            const userIds = orgUsers.map(u => u._id);
            
            // Get all surveys for this organization
            const allSurveys = await OrganizationSurveys.find({
                organization_id: req.user.organization_id
            });
            
            // Get survey responses
            const responses = await OrganizationSurveyResponses
                .find({
                    user_id: { $in: userIds },
                    ...(timeRange && { createdAt: progressQuery.createdAt })
                })
                .populate({
                    path: "user_id",
                    select: "name email"
                });
            
            // Create progress entries for all surveys, even if no responses
            progress = allSurveys.map(survey => {
                const surveyResponses = responses.filter(r => 
                    r.survey_assignment_id && r.survey_assignment_id.toString() === survey._id.toString()
                );
                
                return {
                    survey_assignment_id: survey._id,
                    surveyId: survey,
                    responses: surveyResponses,
                    submitted_at: surveyResponses.length > 0 ? surveyResponses[0].submitted_at : null,
                    user_id: surveyResponses.length > 0 ? surveyResponses[0].user_id : null
                };
            });
        } else if (content === "learningpaths") {
            // Get all learning paths for this organization
            const allLearningPaths = await LearningPath.find({
                organization_id: req.user.organization_id
            });
            
            // Get user progress for learning paths
            const userProgress = await UserContentProgress
                .find({
                    organization_id: req.user.organization_id,
                    contentType: "learningpath",
                    ...(timeRange && { createdAt: progressQuery.createdAt })
                })
                .populate({
                    path: "assignment_id",
                    populate: { 
                        path: "contentId", 
                        model: "LearningPath"
                    }
                });
            
            // Create progress entries for all learning paths, even if no progress
            progress = allLearningPaths.map(learningPath => {
                const pathProgress = userProgress.filter(p => 
                    p.assignment_id?.contentId && p.assignment_id.contentId.toString() === learningPath._id.toString()
                );
                
                return {
                    assignment_id: pathProgress.length > 0 ? pathProgress[0].assignment_id : null,
                    contentId: learningPath,
                    status: pathProgress.length > 0 ? pathProgress[0].status : "assigned",
                    score: pathProgress.length > 0 ? pathProgress[0].score || 0 : 0,
                    enrolled: pathProgress.length,
                    completed: pathProgress.filter(p => p.status === "completed").length,
                    inProgress: pathProgress.filter(p => p.status === "in_progress").length
                };
            });
        } else {
            // modules (default)
            progress = await UserContentProgress
                .find(progressQuery)
                .populate({
                    path: "assignment_id",
                    populate: { path: "contentId", model: contentTypeModel }
                });
        }

        const grouped = {};

        console.log(`Found ${progress.length} progress entries for content type: ${content}`);
        
        if (content === "surveys") {
            console.log('Sample survey entry:', progress[0]);
        } else if (content === "learningpaths") {
            console.log('Sample learning path entry:', progress[0]);
        } else if (content === "modules" || !content) {
            console.log('Sample module entry:', progress[0]);
        }

        progress.forEach(entry => {
            let contentId, name, status, score = 0;
            let entryTeam = null;
            let entrySubteam = null;
            
            if (content === "assessments") {
                contentId = entry.assessment_id?._id?.toString();
                name = entry.assessment_id?.title;
                status = entry.result ? "completed" : "in-progress";
                score = entry.score || 0;
                entryTeam = entry.assessment_id?.team?.toString?.() || null;
                entrySubteam = entry.assessment_id?.subteam?.toString?.() || null;
            } else if (content === "surveys") {
                // For surveys, use the survey data directly
                contentId = entry.surveyId?._id?.toString() || entry.survey_assignment_id?.toString();
                name = entry.surveyId?.title || `Survey ${contentId?.slice(-8) || 'Unknown'}`;
                status = entry.submitted_at ? "completed" : "assigned";
                score = 0; // Surveys don't have scores
                entryTeam = entry.surveyId?.team?.toString?.() || null;
                entrySubteam = entry.surveyId?.subteam?.toString?.() || null;
            } else {
                // modules and learningpaths
                if (content === "learningpaths") {
                    contentId = entry.contentId?._id?.toString();
                    name = entry.contentId?.title || 'Unknown Learning Path';
                    status = entry.status || "assigned";
                    score = entry.score || 0;
                    entryTeam = entry.contentId?.team?.toString?.() || null;
                    entrySubteam = entry.contentId?.subteam?.toString?.() || null;
                } else {
                    // modules
                    contentId = entry.assignment_id?.contentId?._id?.toString();
                    name = entry.assignment_id?.contentName;
                    status = entry.status;
                    score = entry.score || 0;
                    entryTeam = entry.assignment_id?.contentId?.team?.toString?.() || null;
                    entrySubteam = entry.assignment_id?.contentId?.subteam?.toString?.() || null;
                }
            }

            if (!contentId) return;

            // Apply team/subteam filters if provided (and not 'all')
            if (team && team !== 'all' && entryTeam && entryTeam !== String(team)) return;
            if (subteam && subteam !== 'all' && entrySubteam && entrySubteam !== String(subteam)) return;

            if (!grouped[contentId]) {
                grouped[contentId] = {
                    name,
                    enrolled: 0,
                    completed: 0,
                    inProgress: 0,
                    totalScore: 0,
                    scores: []
                };
            }

            if (status === "assigned") grouped[contentId].enrolled++;
            if (status === "in-progress") grouped[contentId].inProgress++;
            if (status === "completed") {
                grouped[contentId].completed++;
                grouped[contentId].totalScore += score;
                grouped[contentId].scores.push(score);
            }
        });

        let coursePerformance = [];

        Object.values(grouped).forEach(item => {
            let { name, enrolled, completed, inProgress, totalScore, scores } = item;

            // Skip if no activity
            if (enrolled === 0 && completed === 0 && inProgress === 0) return;

            // If enrolled = 0 but there's activity, count total activity as enrolled
            if (enrolled === 0 && (completed > 0 || inProgress > 0)) {
                enrolled = completed + inProgress;
            }

            const completionRate = ((completed / enrolled) * 100).toFixed(1);
            const avgScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : 0;
            
            // Determine performance level based on completion rate, average score, and enrollment
            let performanceLevel = "Needs Attention";
            
            // Top Performing: completionRate ≥ 80% AND avgScore ≥ 70 AND enrolled ≥ 5
            if (completionRate >= 80 && enrolled >= 2) {
                performanceLevel = "Top Performing";
            } 
            // Good Performance: completionRate ≥ 60% AND avgScore ≥ 50 AND enrolled ≥ 3
            else if (completionRate >= 60  && enrolled >= 1) {
                performanceLevel = "Good Performance";
            }
            // Needs Attention: completionRate < 60% OR avgScore < 50 OR completed = 0
            else if (completionRate < 60 || completed === 0) {
                performanceLevel = "Needs Attention";
            }
            // Default for other cases
            else {
                performanceLevel = "Good Performance";
            }

            coursePerformance.push({
                name,
                enrolled,
                completed,
                inProgress,
                completionRate,
                avgScore,
                performanceLevel
            });
        });

        // Sort by completion rate and average score
        coursePerformance.sort((a, b) => {
            if (b.completionRate !== a.completionRate) {
                return b.completionRate - a.completionRate;
            }
            return b.avgScore - a.avgScore;
        });

        // Separate top performing and courses needing attention
        const topPerforming = coursePerformance
            .filter(course => course.performanceLevel === "Top Performing")
            .slice(0, 5);

        const needingAttention = coursePerformance
            .filter(course => course.performanceLevel === "Needs Attention")
            .slice(0, 5);

        return res.status(200).json({
            success: true,
            data: {
                topPerforming,
                needingAttention,
                allCourses: coursePerformance.slice(0, 10) // Top 10 overall
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = { getOrganizationCreationDate, getCourseDistribution, getUsersData, calculateUsageTrend, getAdoption, getTeams, getSubteams, getEngagementHeatmap, getAtRiskLearners, getContentAnalytics, getUserAnalytics, getAssessmentAnalytics, getSurveyAnalytics, getLearningPathAnalytics, getCoursePerformanceInsights, getContentCounts, getContentCountsAll };
