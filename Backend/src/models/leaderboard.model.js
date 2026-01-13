const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:'true'},
    noOfhoursCompleted:{type:Number,default:0}
  });
  LeaderboardSchema.index({ organization_id: 1, noOfhoursCompleted: -1 });
LeaderboardSchema.index({ team_id: 1, noOfhoursCompleted: -1 });
LeaderboardSchema.index({ user_id: 1 });

  const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
  module.exports = Leaderboard
  