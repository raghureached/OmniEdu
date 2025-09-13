const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Training Calendar"
  description: { type: String },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }] // permissions under this section
});

const Section = mongoose.model("Section", SectionSchema);
module.exports = Section;
