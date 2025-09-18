
const UserDashboardSettings = require("../../models/userDashboard_model");

const userDashBoardSettings = async (req, res) => {
    try {
        const { feature_key, is_enabled } = req.body;
        const existing = await UserDashboardSettings.findOne({ feature_key, organization_id: req.params.id});
        if (existing) {
            existing.is_enabled = is_enabled;
            await existing.save();
            return res.status(200).json(existing);
        }        
        const settings = await UserDashboardSettings.create({
            feature_key,
            is_enabled,
            organization_id: req.params.id,
        });
        res.status(201).json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserDashBoardSettings = async (req, res) => {
    try {
        const settings = await UserDashboardSettings.find({ organization_id: req.params.id });
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    userDashBoardSettings,
    getUserDashBoardSettings
}