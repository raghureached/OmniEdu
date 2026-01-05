const mongoose = require("mongoose");

const ScormCourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  version: { type: String, enum: ["1.2", "2004"], default: "1.2" },
  entryPoint: { type: String, default: "index.html" }
}, { timestamps: true });

module.exports = mongoose.model("ScormCourse", ScormCourseSchema);
