// models/SCORMModel.js
const mongoose = require('mongoose');

const SCORMSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sessionId: { type: String, required: true, unique: true },
  cmi: { type: mongoose.Schema.Types.Mixed, default: {} },
  launchData: { type: mongoose.Schema.Types.Mixed },
  progress: { type: Number, default: 0 },
  score: { type: Number },
  status: { type: String, enum: ['not attempted', 'incomplete', 'completed', 'passed', 'failed'], default: 'not attempted' },
  totalTime: { type: String, default: '00:00:00' },
  lastModified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for faster queries
SCORMSessionSchema.index({ userId: 1, courseId: 1 });
SCORMSessionSchema.index({ sessionId: 1 });

// Static methods
SCORMSessionSchema.statics.initializeSession = async function(userId, courseId) {
  const sessionId = `scorm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return this.create({
    userId,
    courseId,
    sessionId,
    cmi: {
      core: {
        student_id: userId.toString(),
        student_name: '', // Populate from user data
        location: '',
        credit: 'credit',
        entry: 'ab-initio',
        mode: 'normal',
      },
      suspend_data: '',
      launch_data: '',
      progress_measure: 0,
      completion_status: 'not attempted',
      success_status: 'unknown',
      total_time: '00:00:00',
      score: { scaled: 0, raw: 0, min: 0, max: 100 }
    }
  });
};

// Add other static methods (saveData, terminateSession, getStatus, etc.)

module.exports = mongoose.model('SCORMSession', SCORMSessionSchema);