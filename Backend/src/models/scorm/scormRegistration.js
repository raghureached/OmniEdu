const mongoose = require("mongoose");

const ScormRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "ScormCourse" },
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("ScormRegistration", ScormRegistrationSchema);
