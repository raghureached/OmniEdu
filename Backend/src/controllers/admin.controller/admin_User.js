const mongoose = require("mongoose");
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;
const UserProfile = require("../../models/userProfiles_model");
const OrganizationRole = require("../../models/organizationRoles_model");
const Team = require("../../models/teams_model");
const SubTeam = require("../../models/subTeams_model");
const Designation = require("../../models/desginations_model");
const User = require("../../models/users_model");
const Organization = require("../../models/organization_model");
const { logActivity } = require("../../utils/activityLogger");
// --- Validation helpers ---
async function ensureActiveTeam(teamId) {
  if (!teamId) return;

  const t = await Team.findById(teamId);
  if (!t) throw new Error("Team not found");

  if (String(t.status || "").toLowerCase() !== "active") {
    throw new Error(`Team "${t.name}" is inactive. Cannot assign users to inactive teams.`);
  }

  return t;
}

async function ensureActiveSubteam(subteamId) {
  if (!subteamId) return;

  const st = await SubTeam.findById(subteamId);
  if (!st) throw new Error("Subteam not found");

  const parentTeam = await Team.findById(st.team_id);
  if (!parentTeam) throw new Error("Parent team not found");

  if (String(parentTeam.status || "").toLowerCase() !== "active") {
    throw new Error(`Subteam "${st.name}" belongs to inactive team "${parentTeam.name}".`);
  }

  return st;
}

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
      custom1,
      status,
      invite,
      department_id
    } = req.body;
    // ❗ BLOCK assigning users to inactive team/subteam
    try {
      await ensureActiveTeam(team);
      await ensureActiveSubteam(subteam);
    } catch (err) {
      return res.status(400).json({
        isSuccess: false,
        message: err.message
      });
    }

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
    const teamArr = [];
    if (team) {
      teamArr.push({
        team_id: team,
        sub_team_id: subteam
      })
    }
    // Create UserProfile
    await UserProfile.create([{
      user_id: user[0]._id,
      designation: designation,
      organization_roles_id: role,
      department_id,
      organization_id: req.user.organization_id,
      employee_id: empId,
      teams: teamArr,
      custom1,
    }], { session });

    // ✅ Commit both if all good
    await session.commitTransaction();
    session.endSession();


    // Fetch created user + populated relations to match getUsers shape
    const createdUser = await User
      .findOne({ uuid: user[0].uuid })
      .populate({ path: 'global_role_id', select: 'name' })
      .lean();

    const createdProfile = await UserProfile
      .findOne({ user_id: createdUser._id })
      .populate('teams.team_id', 'name')
      .populate('teams.sub_team_id', 'name')
      .lean();
    if (invite) {
      await sendMail(
        user[0].email,
        "Welcome to OmniEdu – Your Account is Now Active!",
        `Hello ${name},

Great news! You’ve been officially added to the OmniEdu platform.

Your login details are provided below:
Email: ${email}
Password: ${password}

You can use these credentials to access your personalized learning dashboard, course modules, assessments, and more.

🔐 Security Tip:  
Please change your password after logging in for the first time.

If you need any assistance, our support team is always here to help.

We’re excited to have you with us.  
Welcome aboard!`
      );
    }

    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Created user: ${name || email || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(201).json({
      isSuccess: true,
      message: 'User and profile created successfully',
      data: { ...createdUser, profile: createdProfile },
    });

  } catch (error) {
    console.log(error);

    await session.abortTransaction();
    session.endSession();

    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Failed to create user`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

    res.status(400).json({
      isSuccess: false,
      message: "Failed to create user",
      error: error.message
    });
  }
};




const editUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      team,
      subteam,
      removedAssignments,
      status,
      designation,
      custom1,
    } = req.body;

    // ❗ Prevent editing user into inactive teams/subteams
    try {
      await ensureActiveTeam(team);
      await ensureActiveSubteam(subteam);
    } catch (err) {
      return res.status(400).json({
        isSuccess: false,
        message: err.message
      });
    }

    const updatePayload = {
      name,
      email,
      password,
      global_role_id: role,
      organization_id: req.user.organization_id,
    };

    if (typeof status !== 'undefined') {
      updatePayload.status = status;
    }

    // Update user core fields
    const user = await User.findOneAndUpdate(
      { uuid: req.params.id },
      updatePayload,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ isSuccess: false, message: 'User not found' });
    }

    // Update profile org role; handle team membership append if provided
    const membership = team ? { team_id: team, sub_team_id: subteam || null } : null;
    const cleanedRemoved = Array.isArray(removedAssignments) ? removedAssignments : [];
    const pullConditions = cleanedRemoved
      .filter((assignment) => assignment?.teamId)
      .map((assignment) => {
        const condition = { team_id: assignment.teamId };
        if (assignment.subTeamId) {
          condition.sub_team_id = assignment.subTeamId;
        }
        return condition;
      });

    const profileUpdate = {
      $set: {
        organization_roles_id: role,
      },
    };

    if (typeof designation !== 'undefined') {
      profileUpdate.$set.designation = designation;
    }

    if (typeof custom1 !== 'undefined') {
      profileUpdate.$set.custom1 = custom1;
    }

    if (membership) {
      profileUpdate.$addToSet = { teams: membership };
    }

    if (pullConditions.length > 0) {
      profileUpdate.$pull = {
        teams: pullConditions.length === 1
          ? pullConditions[0]
          : { $or: pullConditions },
      };
    }

    await UserProfile.updateOne({ user_id: user._id }, profileUpdate);


    // Fetch updated user + populated relations
    const updatedUser = await User
      .findOne({ uuid: req.params.id })
      .populate({ path: 'global_role_id', select: 'name' })
      .lean();

    const updatedProfile = await UserProfile
      .findOne({ user_id: updatedUser._id })
      .populate('teams.team_id', 'name')
      .populate('teams.sub_team_id', 'name')
      .lean();

    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Updated user: ${name || email || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      isSuccess: true,
      message: 'User updated successfully',
      data: { ...updatedUser, profile: updatedProfile },
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Failed to update user`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to update user',
      error: error.message,
    });
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

    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Deleted user: ${deletedUser?.name || deletedUser?.email || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      isSuccess: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    // Rollback transaction in case of error
    await session.abortTransaction();

    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to delete user`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

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

    const { status, role, search } = req.query;

    const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const baseQuery = {
      organization_id: req.user.organization_id,
      _id: { $ne: req.user._id },
    };

    const andConditions = [];

    if (typeof status === "string" && status.trim()) {
      const normalizedStatus = status.trim().toLowerCase();

      if (normalizedStatus === "active") {
        andConditions.push({
          $or: [
            { status: { $regex: /^\s*active\s*$/i } },
            { status: { $exists: false } },
            { status: null },
            { status: "" },
          ],
        });
      } else {
        andConditions.push({
          status: {
            $regex: new RegExp(`^${escapeRegex(status.trim())}$`, "i"),
          },
        });
      }
    }

    if (role) {
      andConditions.push({ global_role_id: role });
    }

    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      andConditions.push({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
        ],
      });
    }

    const query = andConditions.length
      ? { ...baseQuery, $and: andConditions }
      : baseQuery;

    // Fetch users with all related data populated
    const users = await User.find(query)
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
      .populate("teams.team_id", "name")
      .populate("teams.sub_team_id", "name")
      .lean();

    // Merge profiles into users
    const usersWithProfiles = users.map((user) => {
      const profile = profiles.find(
        (p) => p.user_id.toString() === user._id.toString()
      );
      return { ...user, profile };
    });

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    const pagination = { page, limit, total, totalPages, hasMore };


    return res.status(200).json({
      isSuccess: true,
      message: "Users fetched successfully",
      data: usersWithProfiles,
      pagination,
    });
  } catch (error) {
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
    return res.status(200).json({
      isSuccess: true,
      message: "User fetched successfully",
      data: result,
    });
  } catch (error) {
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

    // Step 1: Fetch users to ensure they exist and get their ObjectIds
    const usersToDelete = await User.find({ _id: { $in: ids } }, { _id: 1 });

    const objectIdsToDelete = usersToDelete.map((user) => user._id);

    // Step 2: Delete users by _id
    const deletedUsers = await User.deleteMany({ _id: { $in: objectIdsToDelete } });

    // Step 3: Delete associated UserProfiles by user_id (ObjectId)
    const deletedProfiles = await UserProfile.deleteMany({
      user_id: { $in: objectIdsToDelete },
    });
    return res.status(200).json({
      isSuccess: true,
      message: "Users and their profiles deleted successfully",
      data: {
        deletedUsersCount: deletedUsers.deletedCount,
        deletedProfilesCount: deletedProfiles.deletedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete users and profiles",
      error: error.message,
    });
  }
};


const bcrypt = require("bcrypt");
const { sendMail } = require("../../utils/Emailer");

const bulkEditUsers = async (req, res) => {
  try {
    const { ids, name, password, role, profileUpdates } = req.body;
    // ❗ Prevent assigning users to inactive team/subteam
    try {
      if (team) await ensureActiveTeam(team);
      if (subteam) await ensureActiveSubteam(subteam);
    } catch (err) {
      return res.status(400).json({
        isSuccess: false,
        message: err.message
      });
    }

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
    return res.status(200).json({
      isSuccess: true,
      message: "Users and their profiles updated successfully",
      data: {
        updatedUsersCount: updatedUsers.modifiedCount,
        updatedProfilesCount: updatedProfiles?.modifiedCount || 0,
      },
    });
  } catch (error) {
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

    return res.status(200).json({
      isSuccess: true,
      message: "Users imported successfully",
      data: users
    })
  } catch (error) {
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
    // Send CSV content
    return res.send(header + csvRecords);

  } catch (error) {
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