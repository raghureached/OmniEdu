const OrganizationRole = require("../../models/organizationRoles_model");
const logAdminActivity = require("./admin_activity");

const addOrgRole = async(req,res)=>{
    try {
        const {name,description,permissions} = req.body;
        const orgRole = await OrganizationRole.create({
            name,
            description,
            permissions,
            //change this when authentication is added
            organization_id:"68b5a94c5991270bf14b9d13"
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const orgRoles = await OrganizationRole.find({}).skip((page - 1) * limit).limit(limit)
        await logAdminActivity(req, "view", `Organization roles fetched successfully: ${orgRoles.length}`);
        return res.status(200).json({
            isSuccess:true,
            message:"Organization roles fetched successfully",
            data:orgRoles,
            pagination:{
                page,
                limit,
                total:await OrganizationRole.countDocuments()
            }
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch organization roles",
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