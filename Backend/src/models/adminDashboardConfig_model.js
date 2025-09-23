const mongoose = require("mongoose");
const {v4: uuidv4} = require("uuid");


const adminDashboardConfigSchema = new mongoose.Schema({
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
    
});

const AdminDashboardConfig = mongoose.model("AdminDashboardConfig", adminDashboardConfigSchema);
module.exports = AdminDashboardConfig