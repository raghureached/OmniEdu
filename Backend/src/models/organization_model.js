const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo_url: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      required: true,
      default: "Active",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    planName: {
      type: String,
      default: null,
    },
    planId: {
      type: String,
      default: null,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    receipt_url: {
      type: String,
    },
    invoice_url: {
      type: String,
    },
    document3:{
      type: String,
    },
    document4:{
      type: String,
    },
    roles:{
      type : [mongoose.Schema.Types.ObjectId],
      ref:"GlobalRoles"
    },
    adminDashboardConfig:{
      type : [mongoose.Schema.Types.ObjectId],
      ref:"AdminDashboardConfig"
    },
    userDashboardConfig:{
      type : [mongoose.Schema.Types.ObjectId],
      ref:"UserDashboardConfig"
    }
  },
  { timestamps: true }
);
organizationSchema.virtual('displayStatus').get(function () {
  if (
    this.status === 'Active' &&
    this.end_date &&
    new Date(this.end_date) < new Date()
  ) {
    return 'Inactive';
  }
  return this.status;
});
organizationSchema.set('toJSON', { virtuals: true });
organizationSchema.set('toObject', { virtuals: true });

const Organization = mongoose.model("Organization", organizationSchema);


module.exports = Organization;
