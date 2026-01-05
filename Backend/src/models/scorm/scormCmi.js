const mongoose = require("mongoose");

const ScormCmiSchema = new mongoose.Schema({
  registrationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  key: { type: String, required: true },
  value: { type: String }
}, { timestamps: true });

ScormCmiSchema.index({ registrationId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("ScormCmi", ScormCmiSchema);
