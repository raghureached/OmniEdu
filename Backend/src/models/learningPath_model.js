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
      prerequisite:{type:String},
      tags:{type:[String]},
      team:{type:String},
      subteam:{type:String},
      category:{type:String},
      duration:{type:String},
      trainingType:{type:String},
      credits:{type:String},
      badges:{type:String},
      stars:{type:String},
      coverImage:{type:String},
      enforceOrder:{type:Boolean},
      bypassRewards:{type:Boolean},
      enableFeedback:{type:Boolean},
  
      // Ordered lessons (mixed content) with dynamic refs for populate
      lessons: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, refPath: 'lessons.model', required: true },
          model: { type: String, enum: ["OrganizationModule", "Assessment", "OrganizationSurvey"], required: true },
          type: { type: String, enum: ["module", "assessment", "survey"], required: true },
          title: { type: String },
          order: { type: Number },
        }
      ],
  
      status: { type: String, enum: ["Draft", "Published"], default: "Draft" }
    },
    { timestamps: true }
  );
  
  const LearningPath = mongoose.model("LearningPath", LearningPathSchema);
  module.exports = LearningPath;