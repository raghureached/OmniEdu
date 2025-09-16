const UserProgress = require("../../models/userProgress");

const updateProgress = async (req, res) => {
  try {
    const { assignment_id, status, progress_percent, score } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { user_id: req.user._id, assignment_id },
      {
        $set: {
          status,
          progress_percent,
          score,
          last_accessed: Date.now(),
          completed_at: status === "completed" ? Date.now() : null,
        },
        $inc: { attempts: status === "in_progress" ? 1 : 0 },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      isSuccess: true,
      message: "Progress updated successfully",
      data: progress,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

const getUserProgress = async (req, res) => {
    try {
      const progress = await UserProgress.find({ user_id: req.user._id })
        .populate("assignment_id", "name assign_type due_date")
        .lean();
  
      return res.status(200).json({
        isSuccess: true,
        message: "Progress fetched successfully",
        data: progress,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to fetch progress",
        error: error.message,
      });
    }
  };

  const getUserProgressById = async (req, res) => {
    try {
      const { id } = req.params;
      const progress = await UserProgress.findOne({uuid:id})
        .populate("assignment_id", "name assign_type due_date")
        .lean();
  
      return res.status(200).json({
        isSuccess: true,
        message: "Progress fetched successfully",
        data: progress,
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to fetch progress",
        error: error.message,
      });
    }
  };
  

module.exports={
    updateProgress,
    getUserProgress,
    getUserProgressById
}