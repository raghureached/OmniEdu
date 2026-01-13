const mongoose = require("mongoose")
const rewardsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars:{
        type:Number,
        default:0
    },
    credits:{
        type:Number,
        default:0
    },
    badges:{
        type:Number,
        default:0
    },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

const UserRewards = mongoose.model("UserRewards", rewardsSchema)

module.exports = UserRewards