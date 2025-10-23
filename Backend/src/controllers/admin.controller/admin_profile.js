const User = require("../../models/users_model");
const UserProfile = require("../../models/userProfiles_model");

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .lean()
        .select("name email uuid"); // exclude password from response
  
      if (!user) {
        return res.status(404).json({ isSuccess: false, message: "User not found" });
      }
  
      const profile = await UserProfile.findOne({ user_id: user._id })
        .populate("organization_id", "name logo_url email status planId planName startDate endDate")
        .populate("designation_id", "name")
        .populate("team_id", "name")
        .populate("sub_team_id", "name")
        .populate("organization_roles_id", "name")
        .lean();
  
      if (!profile) {
        return res.status(404).json({ isSuccess: false, message: "Profile not found" });
      }
  
      const { organization_id, designation_id, team_id, sub_team_id, organization_roles_id, ...restProfile } = profile;
  
      return res.status(200).json({
        isSuccess: true,
        message: "Profile fetched successfully",
        data: {
          user,
          profile: restProfile,
          organization: organization_id,
          designation: designation_id,
          team: team_id,
          subTeam: sub_team_id,
          organizationRole: organization_roles_id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  };
  

module.exports = { getProfile };
