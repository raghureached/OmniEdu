const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const globalAssessmentsSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuidv4,
        unique: true,
        index:true
      },
      uuid:{
        type:String,
        default:uuidv4,
        unique:true,
        index:true
      },
      title: {
        type: String,
        required: true,
      },
      description: String,
      questions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "GlobalQuestion",
        },
      ],
      status:{
        type:String,
        enum:["Published","Draft","Archived"],
        default:"Draft"
      },  
      classification:{
        type:String,
      },
      created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      version:{
        type:Number,
        default:1
      }
    }, { timestamps: true },{versionKey:'version'});


const GlobalAssessments = mongoose.model("GlobalAssessments", globalAssessmentsSchema);
module.exports = GlobalAssessments;

