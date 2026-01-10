const User = require("../../models/User/users_model");
const UserProfile = require("../../models/User/userProfiles_model");

const getProfile = async (req, res) => {
  try {
    // Fetch user without password
    const user = await User.findById(req.user._id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch profile and populate relations
    const profile = await UserProfile.findOne({ user_id: user.uuid })
      .populate("department_id", "name")
      .populate("designation_id", "name")
      .populate("team_id", "name")
      .populate("sub_team_id", "name")
      .populate("organization_roles_id", "name")
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Shape response to match your frontend UI
    const result = {
      fullName: user.name,
      email: user.email,
      role: user.role || "user", // default role
      department: profile.department_id?.name || null,
      position: profile.designation_id?.name || null,
      employeeId: profile.employee_id || null,
      joinDate: profile.join_date || null,
      lastLogin: user.lastLogin || null,
      team: profile.team_id?.name || null,
      subTeam: profile.sub_team_id?.name || null,
      organizationRole: profile.organization_roles_id?.name || null,
    };

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

module.exports = { getProfile };
