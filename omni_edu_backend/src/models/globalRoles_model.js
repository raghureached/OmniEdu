const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },   // e.g., "Admin"
  description: { type: String },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }] // assign permissions directly
});

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;

