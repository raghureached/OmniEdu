const mongoose = require("mongoose");
const {v4: uuidv4} = require("uuid");
const globalQuestionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
  },
  type:{
    type:String,
    enum:["Multiple Choice","Blank","Answer"],
    required:true
  },
  file_url:{
    type:String,
    default:null
  },
  uuid:{
    type:String,
    default:uuidv4,
    unique:true,
    index:true
  },
  total_points:{
    type:Number,
    default:1,
  },
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, "At least two options are required"]
  },
  correct_option: {
    type: [Number], // always store as array of indexes
    required: true,
    validate: {
      validator: function (values) {
        if (!this.options) return false;
        return values.every(v => v >= 0 && v < this.options.length);
      },
      message: "One or more correct option indexes are out of bounds",
    }
  }
  
});

const GlobalQuestion = mongoose.model("GlobalQuestion", globalQuestionSchema);
module.exports = GlobalQuestion;
