
const GlobalAdmin = require("../../models/globalAdmin_model");

const getGlobalProfile = async (req, res) => {
    try {
        const globalAdmin = await GlobalAdmin.findById(req.user._id);

        if (!globalAdmin) {
            return res.status(404).json({
                success: false,
                message: "Global Admin not found"
            });
        }
        return res.status(200).json({
            success: true,
            globalAdmin
        });
    } catch (error) {
        console.error("Error fetching global admin profile:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch global admin profile",
            error: error.message
        });
    }
};

const changeGlobalPassword = async(req,res) =>{
    try {
        const globalAdmin = await GlobalAdmin.findById(req.user._id);
        if (!globalAdmin) {
            return res.status(404).json({
                success: false,
                message: "Global Admin not found"
            });
        }
        const {currentPassword,newPassword} = req.body;
        if(!globalAdmin.comparePassword(currentPassword)){
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        globalAdmin.password = newPassword;
        await globalAdmin.save();
        return res.status(200).json({
            success: true,
            message: "Global Admin password changed successfully"
        });
    } catch (error) {
        console.error("Error changing global admin password:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to change global admin password",
            error: error.message
        });
    }
}
module.exports = {
    getGlobalProfile,
    changeGlobalPassword
}