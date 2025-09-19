// models/Role.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uuid:{
    type:String,
    default:uuidv4,
    unique:true,
    index:true
  },
  description: { type: String, required: true },  
  permissions: [
    {
      section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
      allowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }]
    }
  ],
  isDefault:{
    type:Boolean,
    default:false
  }
});


const Role = mongoose.model("GlobalRoles", roleSchema);
module.exports = Role;

