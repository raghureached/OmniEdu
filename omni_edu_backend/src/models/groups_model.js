
const mongoose = require("mongoose");
const GroupSchema = new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    sub_team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubTeam', required: true },
    common_group: { type: String, required: true },
    custom_group_1: { type: String },
    custom_group_2: { type: String },
    custom_group_3: { type: String },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  });
  
  const Group = mongoose.model('Group', GroupSchema);
  module.exports = Group
  