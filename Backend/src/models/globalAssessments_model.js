// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// const globalAssessmentsSchema = new mongoose.Schema({
//     uuid: {
//         type: String,
//         default: uuidv4,
//         unique: true,
//         index:true
//       },
//       title: {
//         type: String,
//         required: true,
//       },
//       description: String,
//       tags: {
//         type: [String],
//         required: true,
//       },duration:{
//           type:String,
//           required:true
//         },
//         team: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Team",
//           required: true,
//         },
//         subteam:{
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "SubTeam",
//           required: true,
//         },
        
//         attempts:{
//         type:Number,
//         default:1
//         }
//       ,percentage_to_pass: {
//           type: Number,
//           min: 0,
//           max: 100,
//           required: true,
//         },
//       questions: [
//         {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "GlobalQuestion",
//         },
//       ],
//       status:{
//         type:String,
//         enum:["Published","Draft","Archived"],
//         default:"Draft"
//       },   display_answers: {
//         type: Boolean,
//         default: false,
//       },
//       display_answers_when: {
//         type: String,
//         enum: ["AfterEachQuestion", "AfterAssessment", "Never"],
//         default: "Never",
//       },
     
//       created_by: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       version:{
//         type:Number,
//         default:1
//       }
//     }, { timestamps: true },{versionKey:'version'});


// const GlobalAssessments = mongoose.model("GlobalAssessments", globalAssessmentsSchema);
// module.exports = GlobalAssessments;


const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const globalAssessmentsSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: { type: String },

  // Questions
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalQuestion",
    },
  ],

  // Tagging and configuration (aligns with controllers and frontend)
  tags: { type: [String], default: [] },              // create endpoint requires tags; you can set required: true if you want DB-level enforcement
  duration: { type: String },                         // can set required: true if desired
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },         // can set required: true if desired
  subteam: { type: mongoose.Schema.Types.ObjectId, ref: "SubTeam" },   // can set required: true if desired
  attempts: { type: Number, default: 1 },
  unlimited_attempts: { type: Boolean, default: false },
  percentage_to_pass: { type: Number, min: 0, max: 100, default: 0 },
  display_answers: { type: Boolean, default: false },
  display_answers_when: {
    type: String,
    enum: ["AfterAssessment", "AfterPassing", "AfterDueDate", "Always", "Never"],
    default: "Never",
  },

  // Status and meta
  status: {
    type: String,
    enum: ["Published", "Draft", "Archived"],
    default: "Draft",
  },
  classification: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  version: { type: Number, default: 1 },
}, { timestamps: true, versionKey: "version" });

const GlobalAssessments = mongoose.model("GlobalAssessments", globalAssessmentsSchema);
module.exports = GlobalAssessments;