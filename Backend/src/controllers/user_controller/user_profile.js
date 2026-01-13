const mongoose = require("mongoose");
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

    // Fetch profile by user._id and populate nested team refs
    const profile = await UserProfile.findOne({ user_id: user._id })
      .populate('teams.team_id', 'name')
      .populate('teams.sub_team_id', 'name')
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Normalize teams array (return names and ids when present)
    const teams = Array.isArray(profile.teams)
      ? profile.teams.map(t => ({
          teamId: t.team_id?._id || t.team_id || null,
          team: typeof t.team_id === 'object' && t.team_id !== null ? t.team_id.name : null,
          subTeamId: t.sub_team_id?._id || t.sub_team_id || null,
          subTeam: typeof t.sub_team_id === 'object' && t.sub_team_id !== null ? t.sub_team_id.name : null,
        }))
      : [];

    // Shape response to match your frontend UI
    const result = {
      fullName: user.name,
      email: user.email,
      role: user.role || "user", // default role
      designation: profile.designation || null,
      employeeId: profile.employeeId || profile.employee_id || null,
      joinDate: profile.join_date || null,
      lastLogin: user.last_login || null,
      team: null,
      subTeam: null,
      organizationRole: null,
      teams,
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

const updateProfile = async(req,res)=>{
  try {
    const { name, designation, employeeId } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Update user name if provided
    let updatedUser = null;
    if (typeof name === 'string' && name.trim().length > 0) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { name: name.trim() },
        { new: true }
      ).select("-password").lean();
    } else {
      // fetch existing for response consistency
      updatedUser = await User.findById(req.user._id).select("-password").lean();
    }

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update or create UserProfile fields
    const profileUpdate = {};
    if (typeof designation === 'string') profileUpdate.designation = designation;
    if (typeof employeeId === 'string') profileUpdate.employee_id = employeeId;

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user_id: updatedUser._id },
      { $set: profileUpdate },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
        profile: updatedProfile,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
}

module.exports = { getProfile, updateProfile };

// New: user-level departments listing (no admin dependency)
const getDepartments = async (req, res) => {
  try {
    // Get distinct department ObjectIds from user profiles
    const ids = await UserProfile.distinct("department_id", { department_id: { $ne: null } });

    if (!ids || ids.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Query the departments collection directly to avoid requiring admin models
    const docs = await mongoose.connection
      .collection("departments")
      .find({ _id: { $in: ids.map((id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id)) } })
      .project({ name: 1 })
      .toArray();

    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch departments", error: error.message });
  }
};

module.exports.getDepartments = getDepartments;
