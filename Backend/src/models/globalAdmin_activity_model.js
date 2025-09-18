const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const globalAdminActivitySchema = new mongoose.Schema(
    {
        uuid: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        actionOn:{
            type: String,
            required: true,
            trim: true,
        },
        details: {
            type: String,
            required: true,
            trim: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: "success",
        },
    },
    {
        timestamps: true,
    }
);

const GlobalAdminActivity = mongoose.model(
    "GlobalAdminActivity",
    globalAdminActivitySchema
);

module.exports = GlobalAdminActivity;