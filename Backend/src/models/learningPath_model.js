const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const LearningPathSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String },
        organization_id:{type:mongoose.Schema.Types.ObjectId,ref:"Organization"},
      // Who created it
      created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      uuid:{
        type:String,
        default:uuidv4,
        unique:true,
        index:true
      },
  
      // Array of days
      schedule: [
        {

          
          day: { type: Number, required: true }, // e.g., 1, 2, 3
  
          // Modules for this day
          modules: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Module" }
          ],
  
          // Assessments for this day
          assessments: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" }
          ],
          survey:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"OrganizationSurvey"
          }
        }
      ],
  
      status: { type: String, enum: ["Draft", "Published"], default: "Draft" }
    },
    { timestamps: true }
  );
  
  const LearningPath = mongoose.model("LearningPath", LearningPathSchema);
  module.exports = LearningPath;