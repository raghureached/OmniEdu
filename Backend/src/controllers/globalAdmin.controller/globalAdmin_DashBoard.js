const { Types } = require('mongoose');
const User = require("../../models/User/users_model");
const Organization = require("../../models/globalAdmin/Organization/organization_model");

const getUserDistribution = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        const groupedUsers = await User.aggregate([
            // Filter out users without organization_id if needed
            { $match: { organization_id: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$organization_id',
                    userCount: { $sum: 1 }
                }
            },
            { $sort: { userCount: -1 } },
            { $limit: 4 },
            {
                $lookup: {
                    from: 'organizations',  // Changed from 'Organization' to 'organizations'
                    localField: '_id',
                    foreignField: '_id',
                    as: 'organization'
                }
            },
            { $unwind: '$organization' },
            {
                $project: {
                    _id: 0,
                    organizationId: '$_id',
                    organizationName: '$organization.name',
                    userCount: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            totalUsers,
            groupedUsers
        });

    } catch (error) {
        console.error('Error in getUserDistribution:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch user distribution data',
            details: error.message
        });
    }
};

const getDailyActiveUsers = async (req, res) => {
    try {
        const { days = 7 } = req.query; // Default to 7 days if not specified
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(days));
        
        // Set time to start and end of day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Aggregate to get daily active users
        const dailyActiveUsers = await User.aggregate([
            // Match users who logged in during the date range
            {
                $match: {
                    last_login: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            // Group by day and count unique users
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$last_login" }
                    },
                    count: { $sum: 1 },
                    // Get the actual date for sorting
                    date: { $first: "$last_login" }
                }
            },
            // Sort by date
            { $sort: { date: 1 } },
            // Project to format the output
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            }
        ]);

        // Fill in missing days with 0 counts
        const dateMap = new Map();
        const currentDate = new Date(startDate);
        
        // Initialize all dates in the range with 0
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dateMap.set(dateStr, {
                date: dateStr,
                count: 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Update with actual data
        dailyActiveUsers.forEach(day => {
            dateMap.set(day.date, day);
        });

        // Convert map to array and format for the chart
        const result = Array.from(dateMap.values()).map(item => ({
            date: item.date,
            count: item.count
        }));

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in getDailyActiveUsers:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch daily active users data',
            details: error.message
        });
    }
};
const getOrganizationGrowth = async (req, res) => {
    try {
        // Calculate date range for the last 3 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 3);
        startDate.setDate(1); // Start from the first day of the month
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Get monthly organization counts
        const monthlyData = await Organization.aggregate([
            {
                $match: {
                    createdAt: { $lte: endDate } // All orgs created before or on end date
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Calculate cumulative growth and new orgs per month
        let cumulativeCount = 0;
        const result = [];
        const months = [];
        
        // Generate all months in the range
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            months.push({ year, month });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        months.forEach(({ year, month }) => {
            const monthData = monthlyData.find(
                d => d._id.year === year && d._id.month === month
            );
            const newOrgs = monthData ? monthData.count : 0;
            const previousTotal = result.length > 0 ? result[result.length - 1].total : 0;
            const total = previousTotal + newOrgs;

            result.push({
                month: new Date(year, month - 1).toLocaleString('default', { month: 'short' }) + ' ' + year,
                newOrgs,
                total
            });
        });

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in getOrganizationGrowth:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch organization growth data',
            details: error.message
        });
    }
};

// Add to exports
module.exports = {
    getUserDistribution,
    getDailyActiveUsers,
    getOrganizationGrowth
};
