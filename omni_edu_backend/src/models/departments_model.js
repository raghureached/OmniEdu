const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    organization_id: {
        type: String,
        required: true,
        ref:"Organization"
    }
})

const Department = mongoose.model("Department", departmentSchema)

module.exports = Department