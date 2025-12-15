const Role = require("../models/globalRoles_model");

const getPermissions = async (req, res) => {
    try {
        // console.log(req.user)
        const roles = await Role.findOne({name:req.user.role})
            .populate("permissions.section")
            .populate("permissions.allowed");
        
        if (!roles) {
            return res.status(404).json({
                success: false,
                message: "Role not found"
            });
        }

        const allowed = roles.permissions.flatMap(p => p.allowed.map(a => a.name));

        return res.status(200).json({
            success: true,
            data: allowed
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching permissions",
            error: error.message
        });
    }
};

module.exports = {
    getPermissions
};