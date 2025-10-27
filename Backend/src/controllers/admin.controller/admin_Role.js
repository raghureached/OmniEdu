const OrganizationRole = require("../../models/organizationRoles_model");
const logAdminActivity = require("./admin_activity")
const Organization = require("../../models/organization_model");
const Role = require("../../models/globalRoles_model");
const addOrgRole = async(req,res)=>{
    try {
        const {name,description,permissions} = req.body;
        const orgRole = await OrganizationRole.create({
            name,
            description,
            permissions,
            //change this when authentication is added
            organization_id:req.user.organization_id
        })
        await logAdminActivity(req, "add", `Organization role added successfully: ${orgRole.name}`);
        return res.status(201).json({
            isSuccess:true,
            message:"Organization role added successfully",
            data:orgRole
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to add organization role",
            error:error.message
        })
    }
}

const editOrgRole = async(req,res)=>{
    try {
        const {name,description,permissions} = req.body;
        const orgRole = await OrganizationRole.findOneAndUpdate({uuid:req.params.id},{
            name,
            description,
            permissions
        })
        await logAdminActivity(req, "edit", `Organization role edited successfully: ${orgRole.name}`);
        return res.status(200).json({
            isSuccess:true,
            message:"Organization role updated successfully",
            data:orgRole
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to update organization role",
            error:error.message
        })
    }
}

const deleteOrgRole = async(req,res)=>{
    try {
        const deletedRole = await OrganizationRole.findOneAndDelete({uuid:req.params.id})
        await logAdminActivity(req, "delete", `Organization role deleted successfully: ${deletedRole.name}`);
        return res.status(200).json({
            isSuccess:true,
            message:"Organization role deleted successfully",
            data:deletedRole
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to delete organization role",
            error:error.message
        })
    }
}

const getOrgRoles = async(req,res)=>{
    try {
        const roleIds = await Organization.findById({_id:req.user.organization_id}).select("roles").exec()
        const roles = await Role.find({_id:{$in:roleIds.roles}})
        return res.status(200).json({   
            isSuccess:true,
            message:"Roles fetched successfully",
            data:roles
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch roles",
            error:error.message
        })
    }
}

module.exports = {
    addOrgRole,
    editOrgRole,
    deleteOrgRole,
    getOrgRoles
}
