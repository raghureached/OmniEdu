const User = require("../../models/User/users_model");
const UserProfile = require("../../models/User/userProfiles_model");

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate("organization_id global_role_id")
        .lean()
        .select("name email uuid global_role_id last_login"); // exclude password from response
  
      if (!user) {
        return res.status(404).json({ isSuccess: false, message: "User not found" });
      }

  
      const { organization_id, designation_id, team_id, sub_team_id, organization_roles_id } = user;
  
      return res.status(200).json({
        isSuccess: true,
        message: "Profile fetched successfully",
        data: {
          user,
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
