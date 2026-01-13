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
      team:{type:mongoose.Schema.Types.ObjectId,ref:"Team"},
      subteam:{type:mongoose.Schema.Types.ObjectId,ref:"SubTeam"},
      category:{type:String},
      duration:{type:Number},
      trainingType:{type:String},
      credits:{type:String},
      badges:{type:String},
      stars:{type:String},
      thumbnail:{type:String},
      enforceOrder:{type:Boolean},
      bypassRewards:{type:Boolean},
      enableFeedback:{type:Boolean},
  
      // Ordered lessons (mixed content) with dynamic refs for populate
      lessons: [
        {
          id: { type: mongoose.Schema.Types.ObjectId, refPath: 'lessons.model', required: true },
          model: { type: String, enum: ["OrganizationModule", "OrganizationAssessments", "OrganizationSurvey"], required: true },
          type: { type: String, enum: ["module", "assessment", "survey"], required: true },
          title: { type: String },
          order: { type: Number },
          uuid: { type: String ,required:true},
        }
      ],
  
      status: { type: String, enum: ["Draft", "Published"], default: "Draft" }
    },
    { timestamps: true }
  );
  LearningPathSchema.index({ "lessons.id": 1 });
LearningPathSchema.index({ "lessons.uuid": 1 });
LearningPathSchema.index({ organization_id: 1, status: 1 });
  
  const LearningPath = mongoose.model("LearningPath", LearningPathSchema);
  module.exports = LearningPath;