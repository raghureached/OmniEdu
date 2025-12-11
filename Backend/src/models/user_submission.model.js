const mongoose = require("mongoose")
const submissionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    moduleId:{
        type: mongoose.Schema.Types.ObjectId,
        refPath:"refPath"
    },
    refPath:{
        type: String,
        required:true,
        enum:["Module","GlobalModule"]
    },
    submissionDate:{
        type: Date,
        default: Date.now
    },
    file_url:{
        type: String,
        default: ""
    }
    
})

const submissionModel = mongoose.model("Submission", submissionSchema)

module.exports = submissionModel