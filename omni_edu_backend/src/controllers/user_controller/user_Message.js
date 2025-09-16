const ForUserMessage = require("../../models/messageForUser");
const UserProfile = require("../../models/userProfiles_model");
const User = require("../../models/users_model");
const logUserActivity = require("./user_activity");

const getMessage = async (req, res) => {
  try {
    // Fetch only the required field (uuid)
    const user = await User.findById(req.user._id).select("uuid").lean();
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: "User not found."
      });
    }

    // Get organization_id from UserProfile directly
    const userProfile = await UserProfile.findOne({ user_id: user.uuid })
      .select("organization_id")
      .lean();

    if (!userProfile) {
      return res.status(404).json({
        isSuccess: false,
        message: "User profile not found."
      });
    }

    // Fetch message for organization
    const message = await ForUserMessage.findOne({
      organization_id: userProfile.organization_id
    }).lean();

    if (!message) {
      return res.status(404).json({
        isSuccess: false,
        message: "No message found for this organization."
      });
    }

    // Log activity
    await logUserActivity(req, "view", `Message fetched successfully`);

    return res.status(200).json({
      isSuccess: true,
      message: "Message fetched successfully.",
      data: message
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch message.",
      error: error.message
    });
  }
};

module.exports = {
  getMessage
};
