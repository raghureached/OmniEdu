const ForUserMessage = require("../../models/messageForUser");
const UserProfile = require("../../models/userProfiles_model");
const User = require("../../models/users_model");
const logUserActivity = require("./user_activity");

const getMessage = async (req, res) => {
  try {
    const messages = await ForUserMessage.find({organization_id:req.user.organization_id})
    return res.status(200).json({
      isSuccess: true,
      message: "Message fetched successfully.",
      data: messages
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
