const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:'true'},
    noOfhoursCompleted:{type:Number,default:0}
  });
  
  const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema);
  module.exports = Leaderboard
  