const Organization = require("../../models/globalAdmin/Organization/organization_model")
const Role = require("../../models/globalAdmin/Roles/globalRoles_model")


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

module.exports={
    getOrgRoles
}