const mongoose = require("mongoose")
const {v4:uuidv4} = require("uuid")

const userDashBoardSchema = new mongoose.Schema({
    uuid:{
        default:uuidv4,
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    }
})

const userDashBoardConfig = new mongoose.model("userDashBoardConfig",userDashBoardSchema)
module.exports = userDashBoardConfig
