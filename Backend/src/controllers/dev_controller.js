const AdminDashboardConfig = require("../models/globalAdmin/adminDashboardConfig_model");
const GlobalAdmin = require("../models/globalAdmin/globalAdmin_model");
const Plan = require("../models/globalAdmin/plans_model");
const userDashBoardConfig = require("../models/globalAdmin/userDashBoardConfig_model");

const addGlobalAdmin = async(req,res)=>{
    try {
        const {email,password,name} = req.body;
        if(!email || !password){
            return res.status(400).json({
                isSuccess:false,
                message:"Email and password are required"
            })
        }
        const globalAdmin = await GlobalAdmin.create({
            name,
            email,
            password
        })
        return res.status(201).json({
            isSuccess:true,
            message:"Global Admin added successfully",
            data:globalAdmin
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to add global admin",
            error:error.message
        })
    }
}

const addPlans = async(req,res)=>{
    try {
        const {name} = req.body;
        if(!name){
            return res.status(400).json({
                isSuccess:false,
                message:"Name is required"
            })
        }
        const plan = await Plan.create({
            name
        })
        return res.status(201).json({
            isSuccess:true,
            message:"Plan added successfully",
            data:plan
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to add plan",
            error:error.message
        })
    }
}

const addAdminDashboardConfig = async(req,res)=>{
    try {
        const {name} = req.body;
        if(!name){
            return res.status(400).json({
                isSuccess:false,
                message:"Name is required"
            })
        }
        const adminDashboardConfig = await AdminDashboardConfig.create({
            name
        })
        return res.status(201).json({
            isSuccess:true,
            message:"Admin Dashboard Config added successfully",
            data:adminDashboardConfig
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to add admin dashboard config",
            error:error.message
        })
    }
}

const addUserDashboardConfig = async(req,res)=>{
    try {
        const {name} = req.body;
        if(!name){
            return res.status(400).json({
                isSuccess:false,
                message:"Name is required"
            })
        }
        const userDashboardConfig = await userDashBoardConfig.create({
            name
        })
        return res.status(201).json({
            isSuccess:true,
            message:"User Dashboard Config added successfully",
            data:userDashboardConfig
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to add user dashboard config",
            error:error.message
        })
    }
}
module.exports = {
    addGlobalAdmin,
    addPlans,
    addAdminDashboardConfig,
    addUserDashboardConfig
}