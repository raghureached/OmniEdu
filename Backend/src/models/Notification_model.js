const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  from: {
    type: String,
  },
  expiresin: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000),  // 1 hour from now
  }
},
{timestamps:true});


const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;