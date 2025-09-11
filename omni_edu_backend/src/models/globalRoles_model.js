const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const globalRolesSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      enum: ["User", "Admin", "Global Admin"],
      unique: true,
    },
    permissions:{
        type: [String],
        default: [],
    },
    description:{
        type: String,
        default: "",
    }
  },
  { timestamps: true }
);

// globalRolesSchema.set("toJSON", {        //if u dont want to use _id as main..
//     transform: (_, ret) => {
//       delete ret._id;
//       delete ret.__v;
//       return ret;
//     },
//   });

const GlobalRoles = mongoose.model("GlobalRoles", globalRolesSchema);

module.exports = GlobalRoles;
