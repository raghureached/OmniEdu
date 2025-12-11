const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const adminTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => `ADM-${uuidv4().slice(0, 8)}`,
      unique: true,
    },

    organizationId: {
      type: String,
      required: true, // Each org sees only its own tickets
    },

    createdBy: {
      type: String,
      required: true, // adminId
    },

    subject: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    errorMessage: {
      type: String,
      default: "",
    },

    attachments: [
      {
        fileName: String,
        size: String,
      },
    ],

    status: {
      type: String,
      enum: ["Open", "In-Progress", "Resolved"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminTicket", adminTicketSchema);
