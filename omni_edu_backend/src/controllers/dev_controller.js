const User = require("../models/users_model");

const addGlobalAdmin = async(req,res)=>{
    try {
        const {email,password,name} = req.body;
        if(!email || !password){
            return res.status(400).json({
                isSuccess:false,
                message:"Email and password are required"
            })
        }
        const user = await User.create({
            email,
            password,
            name,
            ///global admin
            global_role_id:"68b6863aad08c16efb202a5d",
        })
        return res.status(201).json({
            isSuccess:true,
            message:"Global Admin added successfully",
            data:user
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