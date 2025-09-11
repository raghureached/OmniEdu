const { options } = require("../config/constants");
const GlobalRoles = require("../models/globalRoles_model");
const User = require("../models/users_model");
const jwt = require("jsonwebtoken");

const login = async (req,res) => {
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                isSuccess:false,
                message:"Email and password are required"
            })
        }
        const user = await User.findOne({email})
        const role = await GlobalRoles.findById(user.global_role_id).select("name");
        if(!user){
            return res.status(401).json({
                isSuccess:false,
                message:"Invalid email or password"
            })
        }
        const isPasswordValid = await user.comparePassword(password)
        if(!isPasswordValid){
            return res.status(401).json({
                isSuccess:false,
                message:"Invalid email or password"
            })
        }
        user.last_login = new Date();
        await user.save();
        user.password = undefined;
        const {accessToken,refreshToken} = await generateTokens(user._id,role.name) 
        res.cookie("refreshToken",refreshToken,options);
        res.cookie("accessToken",accessToken,options);
        
        return res.status(200).json({
            isSuccess:true,
            message:"Login successful",
            data:user,
            role:role
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to login",
            error:error.message
        })
    }
}


const logout = async(req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById(userId)
        user.refreshToken = undefined;
        await user.save();
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        return res.status(200).json({
            isSuccess:true,
            message:"Logout successful"
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to logout",
            error:error.message
        })
    }
}

const generateTokens = async (userId,role) => {
    const accessToken = jwt.sign({_id:userId,role:role},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m"
    })
    const refreshToken = jwt.sign({_id:userId,role:role},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d"
    })
    return {accessToken,refreshToken}
}

module.exports={
    login,
    logout
}