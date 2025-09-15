const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const sectionSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  name: { type: String, required: true }
});

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
