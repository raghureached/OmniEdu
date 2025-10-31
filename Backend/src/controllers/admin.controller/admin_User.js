const mongoose = require("mongoose");
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const UserProfile = require("../../models/userProfiles_model");
const OrganizationRole = require("../../models/organizationRoles_model");
const Team = require("../../models/teams_model");
const SubTeam = require("../../models/subTeams_model");
const Designation = require("../../models/desginations_model");
const User = require("../../models/users_model");
const Organization = require("../../models/organization_model");

const addUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      role,
      designation,
      team,
      subteam,
      status,
      invitation,
      department_id
    } = req.body;

    const password = "12345678";

    // Create User (single doc, not array)
    const user = await User.create([{
      name,
      email,
      password,
      global_role_id: role,
      department_id,
      organization_id: req.user.organization_id
    }], { session });

    const orgName = await Organization.findById(
      req.user.organization_id
    ).select("name").session(session);

    if (!orgName) throw new Error("Organization not found");

    const empId = `${orgName.name.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}-${user[0].uuid.substring(0, 3).toUpperCase()}`;

    // Create UserProfile
    await UserProfile.create([{
      user_id: user[0]._id,
      designation: designation,
      team_id:team,
      sub_team_id:subteam,
      organization_roles_id: role,
      department_id,
      organization_id: req.user.organization_id,
      employee_id: empId
    }], { session });
    
    // ✅ Commit both if all good
    await session.commitTransaction();
    session.endSession();
    await logAdminActivity(req, "add", `User added successfully: ${name}`);

    // Fetch created user + populated relations to match getUsers shape
    const createdUser = await User
      .findOne({ uuid: user[0].uuid })
      .populate({ path: 'global_role_id', select: 'name' })
      .lean();

    const createdProfile = await UserProfile
      .findOne({ user_id: createdUser._id })
      .populate('team_id', 'name')
      .populate('sub_team_id', 'name')
      .lean();

    return res.status(201).json({
      isSuccess: true,
      message: 'User and profile created successfully',
      data: { ...createdUser, profile: createdProfile },
    });

  } catch (error) {
    console.log(error);
    
    // ❌ Rollback everything if any step fails
    await session.abortTransaction();
    session.endSession();
    await logAdminActivity(req, "add", `User addition failed: ${error.message}`);

    res.status(500).json({
      isSuccess: false,
      message: "Failed to create user",
      error: error.message
    });
  }
};




const editUser = async (req, res) => {
  mongoose.startSession();
  const session = mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, password, role, team, subteam } = req.body;
    const user = await User.findOneAndUpdate({ uuid: req.params.id }, {
      name,
      email,
      password,
      global_role_id: role,
      organization_id: req.user.organization_id
    })
    const userProfile = await UserProfile.findOneAndUpdate({ user_id: user._id }, {
      team_id:team,
      sub_team_id:subteam,
      organization_roles_id: role,
    })
    await userProfile.save();
    await logAdminActivity(req, "edit", `User edited successfully: ${user.name}`);

    // Fetch updated user + populated relations to match getUsers shape
    const updatedUser = await User
      .findOne({ uuid: req.params.id })
      .populate({ path: 'global_role_id', select: 'name' })
      .lean();

    const updatedProfile = await UserProfile
      .findOne({ user_id: updatedUser._id })
      .populate('team_id', 'name')
      .populate('sub_team_id', 'name')
      .lean();

    return res.status(200).json({
      isSuccess: true,
      message: 'User updated successfully',
      data: { ...updatedUser, profile: updatedProfile },
    })
  } catch (error) {
    await session.abortTransaction();
    await logAdminActivity(req, "edit", `User editing failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update user",
      error: error.message
    })
  }
}
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Find and delete the user using the session
    const deletedUser = await User.findOneAndDelete({ uuid: req.params.id }, { session });

    // If user doesn't exist, return an error
    if (!deletedUser) {
      await session.abortTransaction();
      return res.status(404).json({
        isSuccess: false,
        message: "User not found",
      });
    }

    // Find and delete the user profile associated with the user
    const deletedUserProfile = await UserProfile.findOneAndDelete({ user_id: deletedUser._id }, { session });

    // If user profile doesn't exist, you may choose to handle this case or proceed
    if (!deletedUserProfile) {
      console.warn(`UserProfile not found for user: ${deletedUser._id}`);
    }

    // Commit the transaction
    await session.commitTransaction();
    await logAdminActivity(req, "delete", `User deleted successfully: ${deletedUser.name}`);
    return res.status(200).json({
      isSuccess: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await session.abortTransaction();
    await logAdminActivity(req, "delete", `User deletion failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete user",
      error: error.message,
    });
  } finally {
    // End the session after the transaction
    session.endSession();
  }
};


const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Fetch users with all related data populated
    const users = await User.find({
      organization_id: req.user.organization_id,
      _id: { $ne: req.user._id }  // exclude current user
    })
    .populate({
      path: "global_role_id",
      select: "name",
    })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
    

    // Get all related profiles and populate them deeply
    const userIds = users.map((u) => u._id);
    const profiles = await UserProfile.find({ user_id: { $in: userIds } })
      .populate("team_id", "name")
      .populate("sub_team_id", "name")
      .lean();

    // Merge profiles into users
    const usersWithProfiles = users.map((user) => {
      const profile = profiles.find(
        (p) => p.user_id.toString() === user._id.toString()
      );
      return { ...user, profile };
    });
    const filteredUsers = usersWithProfiles.filter((user)=>user._id !== req.user._id)

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    const pagination = { page, limit, total, totalPages, hasMore };

    await logAdminActivity(
      req,
      "view",
      `Users fetched successfully: ${usersWithProfiles.length}`
    );

    return res.status(200).json({
      isSuccess: true,
      message: "Users fetched successfully",
      data: filteredUsers,
      pagination,
    });
  } catch (error) {
    await logAdminActivity(req, "view", `Users fetching failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};




const getUserbyId = async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.params.id }).lean();
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: "User not found",
      });
    }

    // Fetch all related data in parallel
    const [
      profile,
      designation,
      team,
      subTeam,
      organizationRole,
    ] = await Promise.all([
      UserProfile.findOne({ user_id: user.uuid }).lean(),
      null, // placeholder for designation
      null, // placeholder for team
      null, // placeholder for subTeam
      null, // placeholder for organizationRole
    ]);

    if (!profile) {
      return res.status(404).json({
        isSuccess: false,
        message: "User profile not found",
      });
    }

    // Now fetch the rest based on profile fields in parallel
    const [
      designationDoc,
      teamDoc,
      subTeamDoc,
      organizationRoleDoc,
    ] = await Promise.all([
      Designation.findById(profile.designation_id).lean(),
      Team.findById(profile.team_id).lean(),
      SubTeam.findById(profile.sub_team_id).lean(),
      OrganizationRole.findById(profile.organization_roles_id).lean(),
    ]);

    if (!designationDoc) {
      return res.status(404).json({
        isSuccess: false,
        message: "Designation not found",
      });
    }
    if (!teamDoc) {
      return res.status(404).json({
        isSuccess: false,
        message: "Team not found",
      });
    }
    if (!subTeamDoc) {
      return res.status(404).json({
        isSuccess: false,
        message: "Sub team not found",
      });
    }
    if (!organizationRoleDoc) {
      return res.status(404).json({
        isSuccess: false,
        message: "Organization role not found",
      });
    }

    // Compose the final user data object
    const result = {
      ...user,
      profile,
      designation: designationDoc,
      team: teamDoc,
      sub_team: subTeamDoc,
      organization_role: organizationRoleDoc,
    };
    await logAdminActivity(req, "view", `User fetched successfully: ${user.name}`);
    return res.status(200).json({
      isSuccess: true,
      message: "User fetched successfully",
      data: result,
    });
  } catch (error) {
    await logAdminActivity(req, "view", `User fetching failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};


const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "Please provide an array of user IDs to delete.",
      });
    }

    // Step 1: Fetch users to get their UUIDs
    const usersToDelete = await User.find({ _id: { $in: ids } }, { uuid: 1 });

    const uuidsToDelete = usersToDelete.map((user) => user.uuid);

    // Step 2: Delete users by _id
    const deletedUsers = await User.deleteMany({ _id: { $in: ids } });

    // Step 3: Delete associated UserProfiles by user_id (uuid)
    const deletedProfiles = await UserProfile.deleteMany({
      user_id: { $in: uuidsToDelete },
    });
    await logAdminActivity(req, "delete", `Users and their profiles deleted successfully: ${deletedUsers.deletedCount}`);
    return res.status(200).json({
      isSuccess: true,
      message: "Users and their profiles deleted successfully",
      data: {
        deletedUsersCount: deletedUsers.deletedCount,
        deletedProfilesCount: deletedProfiles.deletedCount,
      },
    });
  } catch (error) {
    await logAdminActivity(req, "delete", `Users and their profiles deletion failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete users and profiles",
      error: error.message,
    });
  }
};


const bcrypt = require("bcrypt");
const logAdminActivity = require("./admin_activity");

const bulkEditUsers = async (req, res) => {
  try {
    const { ids, name, password, role, profileUpdates } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "Please provide an array of user IDs to update.",
      });
    }

    // Step 1: Fetch users to get their UUIDs
    const users = await User.find({ _id: { $in: ids } });

    if (!users || users.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        message: "No matching users found",
      });
    }

    // Step 2: Prepare update fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (role) updateFields.global_role_id = role;


    // Step 3: Update Users
    const updatedUsers = await User.updateMany(
      { _id: { $in: ids } },
      { $set: updateFields }
    );

    // Step 4: Update related UserProfiles (if profileUpdates are provided)
    let updatedProfiles = null;
    if (profileUpdates && typeof profileUpdates === "object") {
      const uuids = users.map((u) => u.uuid);

      updatedProfiles = await UserProfile.updateMany(
        { user_id: { $in: uuids } },
        { $set: profileUpdates }
      );
    }
    await logAdminActivity(req, "edit", `Users and their profiles updated successfully: ${updatedUsers.modifiedCount}`);
    return res.status(200).json({
      isSuccess: true,
      message: "Users and their profiles updated successfully",
      data: {
        updatedUsersCount: updatedUsers.modifiedCount,
        updatedProfilesCount: updatedProfiles?.modifiedCount || 0,
      },
    });
  } catch (error) {
    await logAdminActivity(req, "edit", `Users and their profiles update failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update users and profiles",
      error: error.message,
    });
  }
};


const importUsers = async (req, res) => {
  try {
    const users = await User.insertMany(req.body)
    await logAdminActivity(req, "import", `Users imported successfully: ${users.length}`);
    return res.status(200).json({
      isSuccess: true,
      message: "Users imported successfully",
      data: users
    })
  } catch (error) {
    await logAdminActivity(req, "import", `Users import failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to import users",
      error: error.message
    })
  }
}

const exportUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "userprofiles",
          localField: "uuid",
          foreignField: "user_id",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "designations",
          localField: "profile.designation_id",
          foreignField: "_id",
          as: "designation",
        },
      },
      { $unwind: { path: "$designation", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "teams",
          localField: "profile.team_id",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: { path: "$team", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "subteams",
          localField: "profile.sub_team_id",
          foreignField: "_id",
          as: "sub_team",
        },
      },
      { $unwind: { path: "$sub_team", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "organizationroles",
          localField: "profile.organization_roles_id",
          foreignField: "_id",
          as: "organization_role"
        }
      },
      { $unwind: { path: "$organization_role", preserveNullAndEmptyArrays: true } },
    ]);

    // Setup CSV headers
    const csvStringifier = createCsvWriter({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'designation', title: 'Designation' },
        { id: 'team', title: 'Team' },
        { id: 'subTeam', title: 'Sub Team' },
        { id: 'organization_role', title: 'Organization Role' },
      ],
    });

    // Map user data for CSV rows
    const records = users.map(user => ({
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      designation: user.designation?.name || 'N/A',
      team: user.team?.name || 'N/A',
      subTeam: user.sub_team?.name || 'N/A',
      organization_role: user.organization_role?.name || 'N/A',
    }));

    const header = csvStringifier.getHeaderString();
    const csvRecords = csvStringifier.stringifyRecords(records);

    // Set CSV headers for response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    await logAdminActivity(req, "export", `Users exported successfully: ${users.length}`);
    // Send CSV content
    return res.send(header + csvRecords);

  } catch (error) {
    await logAdminActivity(req, "export", `Users export failed: ${error.message}`);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to export users to CSV",
      error: error.message,
    });
  }
};


module.exports = {
  addUser,
  editUser,
  deleteUser,
  getUsers,
  getUserbyId,
  bulkDeleteUsers,
  bulkEditUsers,
  exportUsers
}