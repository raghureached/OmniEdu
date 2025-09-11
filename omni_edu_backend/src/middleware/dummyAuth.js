const addUserId = async(req,res,next)=>{
    req.user = {_id:"68bc1d953f117b638adf49dc"}
    next()
}
module.exports = {addUserId}