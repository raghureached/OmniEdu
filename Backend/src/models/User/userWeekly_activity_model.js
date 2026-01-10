    const mongoose = require('mongoose');
    const weeklyProgressSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        hours: {
            type: Number,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    })

    const WeeklyActivity = mongoose.model("WeeklyActivity",weeklyProgressSchema)
    module.exports = WeeklyActivity 
