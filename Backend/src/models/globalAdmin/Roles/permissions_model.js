const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const permissionSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  name: { type: String, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true }
});

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
