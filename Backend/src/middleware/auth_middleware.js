const jwt = require("jsonwebtoken");
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
            // console.log(err)
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
        const norm = (s)=> String(s||'').toLowerCase().replace(/[^a-z]/g,'');
        const allowed = allowedRoles.map(norm);
        if(!allowed.includes(norm(role))){
            return res.status(401).json({
                isSuccess:false,
                message:"Not allowed!!!"    
            })
        }
        next();
    }
}

module.exports = {authenticate,authorize}
