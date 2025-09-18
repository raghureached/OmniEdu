const jwt = require("jsonwebtoken");
const GlobalRoles = require("../models/globalRoles_model");
const User = require("../models/users_model");
const authenticate = (req,res,next)=>{
    const token = req.cookies.accessToken;
    // console.log(token)
    if(!token){
        return res.status(401).json({
            isSuccess:false,
            message:"Unauthorized"
        })
    }
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err){
            return res.status(401).json({
                isSuccess:false,
                message:"Unauthorized"
            })
        }
        req.user = user;
        next();
    })
}

const authorize = (allowedRoles)=>{
    return async(req,res,next)=>{
        const {role} = req.user;

        // console.log(role)
        // console.log(allowedRoles)
        if(!allowedRoles.includes(role)){
            return res.status(401).json({
                isSuccess:false,
                message:"Not allowed!!!"    
            })
        }
        next();
    }
}

module.exports = {authenticate,authorize}
