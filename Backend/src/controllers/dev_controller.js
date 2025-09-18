const GlobalAdmin = require("../models/globalAdmin_model");

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


module.exports = {
    addGlobalAdmin
}