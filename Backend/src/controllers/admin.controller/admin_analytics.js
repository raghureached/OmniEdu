const Module = require("../../models/moduleOrganization_model");
const UserContentProgress = require("../../models/userContentProgress_model");
const User = require("../../models/users_model");

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

const getCourseDistribution = async (req, res) => {
    try {
        const modules = await Module.find({ org_id: req.user.organization_id });

        const courseLibrary = categories.map(category => {
            const filtered = modules.filter(m => m.category === category);

            return {
                category,
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
    const usageTrend = [];
    const organizationId = req.user.organization_id;
    for (let week = 3; week >= 0; week--) {
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
                organization_id: organizationId,
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
            organization_id: organizationId,
            last_login: { $gte: mauStartDate, $lte: mauDate }
        });

        usageTrend.push({
            date: `Week ${4 - week}`,
            dau: avgDAU,
            mau: weekMAU
        });
    }

    return res.status(200).json({
        success: true,
        data: usageTrend
    });
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
        const progress = await UserContentProgress
            .find({ organization_id: req.user.organization_id })
            .populate("assignment_id");

        const grouped = {};

        progress.forEach(entry => {
            const contentId = entry.assignment_id?.contentId?.toString();
            const name = entry.assignment_id?.contentName;

            if (!contentId) return;

            if (!grouped[contentId]) {
                grouped[contentId] = {
                    name,
                    enrolled: 0,
                    completed: 0
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
                rate
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




module.exports = { getCourseDistribution, getUsersData, calculateUsageTrend,getAdoption };
