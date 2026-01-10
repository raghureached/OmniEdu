const Plan = require("../../models/globalAdmin/plans_model");
const getPlans = async(req,res)=>{
    try {
        const plans = await Plan.find();
        res.status(200).json({isSuccess:true,message:"Plans fetched successfully",data:plans});
    } catch (error) {
        res.status(500).json({isSuccess:false,message:"Failed to fetch plans",error:error.message});
    }
}

module.exports={
    getPlans
}