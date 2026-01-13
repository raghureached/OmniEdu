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
  },
});

// you no longer need to coerce expiresin in pre-save;
// remove this hook entirely or leave it empty:
notificationSchema.pre("save", function (next) {
  // if you want to force expiresin to be Date, you could keep:
  // if (!(this.expiresin instanceof Date)) {
  //   this.expiresin = new Date(this.expiresin);
  // }
  next();
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;