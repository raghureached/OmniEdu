const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "view_home"
  label: { type: String, required: true },            // e.g., "View Home"
  section: { type: String, required: true } // belongs to a section
});

const Permission = mongoose.model("Permission", PermissionSchema);
module.exports = Permission;
