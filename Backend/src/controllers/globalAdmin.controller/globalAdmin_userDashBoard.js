const Organization = require("../../models/globalAdmin/Organization/organization_model");
const userDashBoardConfig = require("../../models/globalAdmin/userDashBoardConfig_model");

const updateUserDashBoardConfig = async(req,res)=>{
    try {
        const permissionId = req.body.id;
        const organizationId = req.params.id;
        if(!permissionId){
            return res.status(400).json({
                isSuccess:false,
                message:"Permission Id is required"
            })
        }
        const organization = await Organization.findOne({uuid:organizationId})
        if(!organization){
            return res.status(404).json({
                isSuccess:false,
                message:"Organization not found"
            })
        }
        const permissionExists = organization.userDashboardConfig.includes(permissionId);
        if(permissionExists){
            organization.userDashboardConfig.pull(permissionId)
        }else{
            organization.userDashboardConfig.push(permissionId)
        }
        await organization.save()
        return res.status(200).json({
            isSuccess:true,
            message:`${permissionExists ? "Removed" : "Added"} permission for organization ${organization.name}`,
            data:organization.userDashboardConfig
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to update user dashboard config",
            error:error.message
        })
    }
}

const getUserDashBoardConfig = async(req,res)=>{
    try {
        const organizationId = req.params.id;
        const organization = await Organization.findOne({uuid:organizationId})
        if(!organization){
            return res.status(404).json({
                isSuccess:false,
                message:"Organization not found"
            })
        }
        return res.status(200).json({
            isSuccess:true,
            message:"User dashboard config fetched successfully",
            data:organization.userDashboardConfig
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to get user dashboard config",
            error:error.message
        })
    }
}

const getUserDashBoardPermissions = async(req,res)=>{
    try {
        const permissions = await userDashBoardConfig.find({})
        return res.status(200).json({
            isSuccess:true,
            message:"Permissions fetched successfully",
            data:permissions
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to get permissions",
            error:error.message
        })
    }
}

module.exports = {
    updateUserDashBoardConfig,
    getUserDashBoardConfig,
    getUserDashBoardPermissions
}
