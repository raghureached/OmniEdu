const Organization = require("../../models/organization_model");
const AdminDashboardConfig = require("../../models/adminDashboardConfig_model");

const updateAdminDashboardConfig = async(req,res)=>{
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
        const roleExists = organization.adminDashboardConfig.includes(permissionId);
        if(roleExists){
            organization.adminDashboardConfig.pull(permissionId)
        }else{
            organization.adminDashboardConfig.push(permissionId)
        }
        await organization.save()
        return res.status(200).json({
            isSuccess:true,
            message:`${roleExists ? "Removed" : "Added"} permission for organization ${organization.name}`,
            data:organization.adminDashboardConfig
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to update admin dashboard config",
            error:error.message
        })
    }
}

const getAdminDashboardConfig = async(req,res)=>{
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
            message:"Admin dashboard config fetched successfully",
            data:organization.adminDashboardConfig
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to get admin dashboard config",
            error:error.message
        })
    }
}

const getAdminDashboardPermissions = async(req,res)=>{
    try {
        const permissions = await AdminDashboardConfig.find({})
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
    updateAdminDashboardConfig,
    getAdminDashboardConfig,
    getAdminDashboardPermissions
}