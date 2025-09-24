const { options } = require("../config/constants");
const GlobalAdmin = require("../models/globalAdmin_model");
const GlobalRoles = require("../models/globalRoles_model");
const User = require("../models/users_model");
const jwt = require("jsonwebtoken");



////For admin and learners
const login = async (req,res) => {
    try {
        const {email,password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({
                isSuccess:false,
                message:"Email and password are required"
            })
        }
        const globalAdmin = await GlobalAdmin.findOne({email})
        if(globalAdmin){
            return handleLogin(globalAdmin,password,"GlobalAdmin",res)
        }
        const user = await User.findOne({email})
        const role = await GlobalRoles.findById(user.global_role_id).select("name");
        if(!user){
            return res.status(401).json({
                isSuccess:false,
                message:"Invalid email or password"
            })
        }
        return handleLogin(user,password,role.name,res)
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
        if(req.user.role === "GlobalAdmin"){
            const globalAdmin = await GlobalAdmin.findById(userId)
            globalAdmin.refreshToken = undefined;
            await globalAdmin.save();
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res.status(200).json({
                isSuccess:true,
                message:"Logout successful"
            })
        }
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
    const accessToken = jwt.sign({_id:userId,role:role},process.env.ACCESS_TOKEN_SECRET)
    const refreshToken = jwt.sign({_id:userId,role:role},process.env.REFRESH_TOKEN_SECRET)
    return {accessToken,refreshToken}
}


// ====== helpers ======
const handleLogin = async (entity, password, role, res) => {
  if (!entity) {
    return res.status(401).json({
      isSuccess: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await entity.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      isSuccess: false,
      message: "Invalid email or password",
    });
  }

  entity.last_login = new Date();
  await entity.save();
  entity.password = undefined;

  const { accessToken, refreshToken } = await generateTokens(entity._id, role);
  
  res.cookie("refreshToken", refreshToken, options);
  res.cookie("accessToken", accessToken, options);

  return res.status(200).json({
    isSuccess: true,
    message: "Login successful",
    data: entity,
    role,
  });
};

const checkAuth = async (req,res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        if(role === "GlobalAdmin"){
            const globalAdmin = await GlobalAdmin.findById(userId)
            return res.status(200).json({
                isSuccess:true,
                message:"User authenticated successfully",
                data:globalAdmin,
                role
            })
        }
        const user = await User.findById(userId)
        const globalRole = await GlobalRoles.findById(user.global_role_id).select("name");
        return res.status(200).json({
            isSuccess:true,
            message:"User authenticated successfully",
            data:user,
            role:globalRole.name
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to authenticate user",
            error:error.message
        })
    }
}

module.exports={
    login,
    logout,
    checkAuth
}