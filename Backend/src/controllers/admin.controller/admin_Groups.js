

const { logActivity } = require("../../utils/activityLogger");

// Add users to a team/sub-team with per-user results and no overwrite of different existing teams
const addUsersToGroup = async (req, res) => {
  try {
    const { team_id, sub_team_id, userIds } = req.body;

    if (!team_id || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "team_id and userIds (non-empty array) are required",
      });
    }

    // Verify team exists (optional but helpful)
    // const team = await Team.findById(team_id).select('_id name');
    const team = await Team.findById(team_id).select('_id name status');
    if (!team) {
      return res.status(404).json({ isSuccess: false, message: "Team not found" });
    }

    // 🚫 BLOCK adding users to inactive team
    if (team.status === "Inactive") {
      return res.status(400).json({
        isSuccess: false,
        message: `Team "${team.name}" is inactive. Cannot add users.`
      });
    }

    if (!team) {
      return res.status(404).json({ isSuccess: false, message: "Team not found" });
    }
    let subTeam = null;
    if (typeof sub_team_id !== 'undefined' && sub_team_id) {

      // subTeam = await SubTeam.findById(sub_team_id).select('_id name team_id');
      subTeam = await SubTeam.findById(sub_team_id).select('_id name team_id status');
if (!subTeam) {
  return res.status(404).json({ isSuccess: false, message: "Sub team not found" });
}

// 🚫 BLOCK inactive subteam
if (subTeam.status === "Inactive") {
  return res.status(400).json({
    isSuccess: false,
    message: `Subteam "${subTeam.name}" is inactive. Cannot add users.`
  });
}

      if (!subTeam) {
        return res.status(404).json({ isSuccess: false, message: "Sub team not found" });
      }
      if (String(subTeam.team_id) !== String(team._id)) {
        return res.status(400).json({ isSuccess: false, message: "Sub team does not belong to the specified team" });
      }
    }

    // Resolve provided ids (uuid only, as per current usage)
    const users = await User.find({ uuid: { $in: userIds } }).select('_id uuid email');
    const foundUuids = new Set(users.map(u => u.uuid));
    const notFound = userIds.filter(id => !foundUuids.has(id));

    if (users.length === 0) {
      return res.status(404).json({ isSuccess: false, message: "No matching users found", data: { notFound } });
    }

    // Fetch profiles for found users
    const profiles = await UserProfile.find({ user_id: { $in: users.map(u => u._id) } })
      .select('user_id team_id sub_team_id teams')
      .lean();
    const profileByUserId = new Map(profiles.map(p => [String(p.user_id), p]));

    const added = [];
    const alreadyPresent = [];
    const cannotAddDifferentTeam = [];
    const failed = [];

    for (const u of users) {
      const p = profileByUserId.get(String(u._id));
      if (!p) {
        // No profile to update
        failed.push({ uuid: u.uuid, reason: 'profile_not_found' });
        continue;
      }

      // Multi-team: check teams array for existing membership
      const desiredSubId = typeof sub_team_id === 'undefined' ? null : (sub_team_id || null);
      const hasMembership = Array.isArray(p.teams) && p.teams.some(t => String(t.team_id) === String(team._id) && String(t.sub_team_id || '') === String(desiredSubId || ''));

      if (hasMembership) {
        alreadyPresent.push({ uuid: u.uuid });
        continue;
      }

      try {
        // Append membership; do not touch legacy team_id/sub_team_id
        const membership = { team_id: team._id, sub_team_id: desiredSubId };
        await UserProfile.updateOne(
          { user_id: u._id },
          { $addToSet: { teams: membership } }
        );
        added.push({ uuid: u.uuid });
      } catch (e) {
        failed.push({ uuid: u.uuid, reason: 'update_failed' });
      }
    }

    return res.status(200).json({
      isSuccess: added.length > 0,
      message: `Processed ${users.length} users` + (notFound.length ? `, ${notFound.length} not found` : ''),
      data: {
        counts: {
          requested: userIds.length,
          found: users.length,
          added: added.length,
          alreadyPresent: alreadyPresent.length,
          cannotAddDifferentTeam: cannotAddDifferentTeam.length,
          notFound: notFound.length,
          failed: failed.length,
        },
        added,
        alreadyPresent,
        cannotAddDifferentTeam, // retained for backward compatibility (now always 0 in multi-team mode)
        notFound,
        failed,
      },
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to add users to group",
      error: error.message,
    });
  }
};


const Team = require("../../models/Admin/GroupsOrTeams/teams_model");
const SubTeam = require("../../models/Admin/GroupsOrTeams/subTeams_model");
const User = require("../../models/User/users_model");
const UserProfile = require("../../models/User/userProfiles_model");

const addGroup = async (req, res) => {
  try {
    const { teamName, subTeamName, status } = req.body;
    const orgId = req.user.organization_id;

    if (!teamName || !subTeamName || !status) {
      return res.status(400).json({
        isSuccess: false,
        message: "teamName, subTeamName and status are required"
      });
    }

    // 1️⃣ Check if team exists *within same org*
    let team = await Team.findOne({
      name: teamName,
      organization_id: orgId
    });

    // 2️⃣ If team exists → check if that subteam exists
    if (team) {
      const existingSubTeam = await SubTeam.findOne({
        name: subTeamName,
        team_id: team._id
      });

      if (existingSubTeam) {
        return res.status(400).json({
          isSuccess: false,
          message: "Subteam already exists under this team"
        });
      }

      // 3️⃣ If team exists but subteam doesn't → create subteam
      const subTeam = await SubTeam.create({
        name: subTeamName,
        team_id: team._id,
        organization_id: orgId,
        created_by: req.user._id
      });

      await logActivity({
        userId: req.user._id,
        action: "Create",
        details: `Created group: ${teamName || 'unknown'}`,
        userRole: req.user.role,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        status: "success",
      });

      return res.status(201).json({
        isSuccess: true,
        message: "Subteam added successfully",
        data: { team, subTeam }
      });
    }

    // 4️⃣ Team doesn't exist → create team + subteam
    team = await Team.create({
      name: teamName,
      status: status.toLowerCase() === "active" ? "Active" : "Inactive",
      organization_id: orgId,
      created_by: req.user._id
    });

    const subTeam = await SubTeam.create({
      name: subTeamName,
      team_id: team._id,
      organization_id: orgId,
      created_by: req.user._id
    });

    return res.status(201).json({
      isSuccess: true,
      message: "Group added successfully",
      data: { team, subTeam }
    });

  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Failed to create group`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to add group",
      error: error.message
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const organization_id = req.user.organization_id;
    const teams = await Team.find({ organization_id }).populate("subTeams").sort({ createdAt: -1 });   // NEW: newest first
    return res.status(200).json({
      isSuccess: true,
      message: "Groups fetched successfully",
      data: teams,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch groups",
      error: error.message,
    });
  }
};

const editGroup = async (req, res) => {
  try {
    const { teamName, description, subTeamName, subTeamDescription } = req.body;
    const team = await Team.findByIdAndUpdate(req.params.id, { name: teamName, description });

    const subTeam = await SubTeam.findOneAndUpdate({ team_id: req.params.id }, { name: subTeamName, description: subTeamDescription });
    
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Updated group: ${teamName || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: "Group updated successfully",
      data: { team, subTeam }
    });

  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Failed to update group`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update group",
      error: error.message
    });
  }
};
const deleteGroup = async (req, res) => {
  try {
    const group = await Team.findByIdAndDelete(req.params.id);
    const subGroup = await SubTeam.findOneAndDelete({ team_id: req.params.id });
    
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Deleted group: ${group?.name || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: "Group deleted successfully",
      data: { group, subGroup }
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to delete group`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete group",
      error: error.message
    });
  }
};
// const addTeam = async (req, res) => {
//   try {
//     const { teamName, status } = req.body;
//     const team = await Team.create({ name: teamName, status:status.toLowerCase()==="active" ? "Active" : "Inactive",organization_id: req.user.organization_id });
//     return res.status(201).json({
//       isSuccess: true,
//       message: "Team added successfully",
//       data: { team }
//     });
//   } catch (error) {
//     return res.status(500).json({
//       isSuccess: false,
//       message: "Failed to add team",
//       error: error.message
//     });
//   }
// };
const addTeam = async (req, res) => {
  try {
    const { teamName, status } = req.body;

    if (!teamName || !status) {
      return res.status(400).json({
        isSuccess: false,
        message: "teamName and status are required",

      });
    }

    // 🔍 Check if team already exists within same organization
    const existingTeam = await Team.findOne({
      name: teamName,
      organization_id: req.user.organization_id
    });

    if (existingTeam) {
      return res.status(400).json({
        isSuccess: false,
        message: "Team with this name already exists",
      });
    }

    const team = await Team.create({
      name: teamName,
      status: status.toLowerCase() === "active" ? "Active" : "Inactive",
      organization_id: req.user.organization_id,
      created_by: req.user._id,
    });

    return res.status(201).json({
      isSuccess: true,
      message: "Team added successfully",
      data: { team },
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to add team",
      error: error.message,
    });
  }
};

const editTeam = async (req, res) => {
  try {
    const { teamName, status } = req.body;
    const team = await Team.findOneAndUpdate({ uuid: req.params.id }, { name: teamName, status: status.toLowerCase() === "active" ? "Active" : "Inactive" });
    return res.status(200).json({
      isSuccess: true,
      message: "Team updated successfully",
      data: { team }
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update team",
      error: error.message
    });
  }
}
// const addSubTeam = async(req,res) =>{
//   try {
//     const { subTeamName,team_id } = req.body;
//     const team = await SubTeam.create({ name: subTeamName ,team_id: team_id});
//     return res.status(201).json({
//       isSuccess: true,
//       message: "SubTeam added successfully",
//       data: { team }
//     });
//   } catch (error) {
//     return res.status(500).json({
//       isSuccess: false,
//       message: "Failed to add team",
//       error: error.message
//     });
//   }
// }
const addSubTeam = async (req, res) => {
  try {
    const { subTeamName, team_id } = req.body;

    if (!subTeamName || !team_id) {
      return res.status(400).json({
        isSuccess: false,
        message: "subTeamName and team_id are required",
      });
    }

    // 1️⃣ Check if team exists
    const team = await Team.findById(team_id);
    if (!team) {
      return res.status(404).json({
        isSuccess: false,
        message: "Team not found"
      });
    }

    // 2️⃣ Check duplicate subteam within SAME team
    const existingSubTeam = await SubTeam.findOne({
      name: subTeamName,
      team_id: team_id
    });

    if (existingSubTeam) {
      return res.status(400).json({
        isSuccess: false,
        message: "Subteam with this name already exists under the same team"
      });
    }

    // 3️⃣ Create new subteam
    const subTeam = await SubTeam.create({
      name: subTeamName,
      team_id,
      organization_id: req.user.organization_id,
      created_by: req.user._id,
    });

    return res.status(201).json({
      isSuccess: true,
      message: "SubTeam added successfully",
      data: { subTeam },
    });

  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to add subteam",
      error: error.message,
    });
  }
};


// const editSubTeam = async(req,res) =>{
//   try {
//     const { subTeamName } = req.body;
//     const subTeam = await SubTeam.findOneAndUpdate(
//       {uuid:req.params.id}, 
//       { name: subTeamName },
//       { new: true }
//     );
//     if (!subTeam) {
//       return res.status(404).json({
//         isSuccess: false,
//         message: "SubTeam not found"
//       });
//     }
//     return res.status(200).json({
//       isSuccess: true,
//       message: "SubTeam updated successfully",
//       data: { subTeam }
//     });
//   } catch (error) {
//     return res.status(500).json({
//       isSuccess: false,
//       message: "Failed to update subteam",
//       error: error.message
//     });
//   }
// }
const editSubTeam = async (req, res) => {
  try {
    const { subTeamName } = req.body;

    const subTeam = await SubTeam.findOne({ uuid: req.params.id });

    if (!subTeam) {
      return res.status(404).json({
        isSuccess: false,
        message: "SubTeam not found",
      });
    }

    // Check duplicate under the same team
    const duplicate = await SubTeam.findOne({
      name: subTeamName,
      team_id: subTeam.team_id,
      uuid: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({
        isSuccess: false,
        message: "Another subteam with this name already exists under this team",
      });
    }

    subTeam.name = subTeamName;
    await subTeam.save();

    return res.status(200).json({
      isSuccess: true,
      message: "SubTeam updated successfully",
      data: { subTeam },
    });

  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update subteam",
      error: error.message,
    });
  }
};


const deleteSubTeam = async (req, res) => {
  try {
    const subTeam = await SubTeam.findOneAndDelete({ uuid: req.params.id });
    if (!subTeam) {
      return res.status(404).json({
        isSuccess: false,
        message: "SubTeam not found"
      });
    }
    return res.status(200).json({
      isSuccess: true,
      message: "SubTeam deleted successfully",
      data: { subTeam }
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete subteam",
      error: error.message
    });
  }
}

const deleteGroups = async (req, res) => {
  try {
    const { ids } = req.body;
    const teamIds = await Team.find({ uuid: { $in: ids } }).select("_id");
    const group = await Team.deleteMany({ uuid: { $in: ids } });
    const subGroup = await SubTeam.deleteMany({ team_id: { $in: teamIds } });
    return res.status(200).json({
      isSuccess: true,
      message: "Group deleted successfully",
      data: { group, subGroup }
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete group",
      error: error.message
    });
  }
}
const deactivateGroups = async (req, res) => {
  try {
    const { ids } = req.body;  // These are team UUIDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "No team ids provided"
      });
    }

    // 1️⃣ Find all teams by UUID → get actual Mongo _id
    const teams = await Team.find({ uuid: { $in: ids } }).select("_id name");

    if (teams.length === 0) {
      return res.status(404).json({
        isSuccess: false,
        message: "No matching teams found"
      });
    }

    const teamIds = teams.map(t => t._id);

    // 2️⃣ Set status = inactive for all teams
    await Team.updateMany(
      { _id: { $in: teamIds } },
      { status: "Inactive" }
    );

    // 3️⃣ Remove all user memberships for these teams
    await UserProfile.updateMany(
      {},
      {
        $pull: {
          teams: { team_id: { $in: teamIds } }
        }
      }
    );

    return res.status(200).json({
      isSuccess: true,
      message: "Teams deactivated and users removed successfully",
      deactivatedTeams: teamIds.length
    });

  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to deactivate groups",
      error: error.message
    });
  }
};

module.exports = {
  addGroup,
  getGroups,
  editGroup,
  deleteGroup,
  deleteGroups,
  deactivateGroups,
  addTeam,
  addSubTeam,
  editTeam,
  editSubTeam,
  deleteSubTeam,
  addUsersToGroup
} 