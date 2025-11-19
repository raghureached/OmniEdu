

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
      const team = await Team.findById(team_id).select('_id name');
      if (!team) {
        return res.status(404).json({ isSuccess: false, message: "Team not found" });
      }
      let subTeam = null;
      if (typeof sub_team_id !== 'undefined' && sub_team_id) {
        subTeam = await SubTeam.findById(sub_team_id).select('_id name team_id');
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


const Team = require("../../models/teams_model");
const SubTeam = require("../../models/subTeams_model");
const User = require("../../models/users_model");
const UserProfile = require("../../models/userProfiles_model");

const addGroup = async (req, res) => {
    try {
        const { teamName, subTeamName, status } = req.body;
        if (!teamName || !subTeamName || !status) {
            return res.status(400).json({
                isSuccess: false,
                message: "All fields are required"
            })
        }
        const teamNameExists = await Team.findOne({ name: teamName });
        const subTeamNameExists = await SubTeam.findOne({ name: subTeamName });
        if(teamNameExists && subTeamNameExists){
            return res.status(400).json({
                isSuccess: false,
                message: "Team name and subteam name already exists"
            })
          }
        if (teamNameExists) {
            const subTeam = await SubTeam.create({
                name: subTeamName,
                team_id: teamNameExists._id,
                ///Change when authentication is added
                organization_id: req.user.organization_id,
                created_by: req.user._id
            })
            return res.status(201).json({
                isSuccess: true,
                message: "Subteam added successfully",
                data: { subTeam }
            })
        }
          const team = await Team.create({
            name: teamName,
            status: status.toLowerCase()==="active" ? "Active" : "Inactive",
            organization_id: req.user.organization_id,
            created_by: req.user._id
        })
        const subTeam = await SubTeam.create({
            name: subTeamName,
            team_id: team._id,
            ///Change when authentication is added
            organization_id: req.user.organization_id,
            created_by: req.user._id
        })
        return res.status(201).json({
            isSuccess: true,
            message: "Group added successfully",
            data: { team, subTeam }
        })

    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to add group",
            error: error.message
        })
    }
}
  const getGroups = async (req, res) => {
  try {
    const organization_id = req.user.organization_id;
    const teams = await Team.find({ organization_id }).populate("subTeams");
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
      const { teamName, description,subTeamName, subTeamDescription } = req.body;
      const team = await Team.findByIdAndUpdate(req.params.id, { name: teamName, description });

      const subTeam = await SubTeam.findOneAndUpdate({team_id:req.params.id}, { name: subTeamName, description:subTeamDescription });
      return res.status(200).json({
        isSuccess: true,
        message: "Group updated successfully",
        data: { team, subTeam }
      });
      
    } catch (error) {
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
      const subGroup = await SubTeam.findOneAndDelete({team_id:req.params.id});
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

  const editTeam = async(req,res) =>{
    try {
      const { teamName, status } = req.body;
      const team = await Team.findOneAndUpdate({uuid:req.params.id}, { name: teamName, status:status.toLowerCase()==="active" ? "Active" : "Inactive" });
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
  const addSubTeam = async(req,res) =>{
    try {
      const { subTeamName,team_id } = req.body;
      const team = await SubTeam.create({ name: subTeamName ,team_id: team_id});
      return res.status(201).json({
        isSuccess: true,
        message: "SubTeam added successfully",
        data: { team }
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to add team",
        error: error.message
      });
    }
  }

  const editSubTeam = async(req,res) =>{
    try {
      const { subTeamName } = req.body;
      const subTeam = await SubTeam.findOneAndUpdate(
        {uuid:req.params.id}, 
        { name: subTeamName },
        { new: true }
      );
      if (!subTeam) {
        return res.status(404).json({
          isSuccess: false,
          message: "SubTeam not found"
        });
      }
      return res.status(200).json({
        isSuccess: true,
        message: "SubTeam updated successfully",
        data: { subTeam }
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to update subteam",
        error: error.message
      });
    }
  }

  const deleteSubTeam = async(req,res) =>{
    try {
      const subTeam = await SubTeam.findOneAndDelete({uuid:req.params.id});
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

  const deleteGroups = async(req,res) =>{
    try {
      const {ids } = req.body;
      const teamIds = await Team.find({uuid:{$in:ids}}).select("_id");
      const group = await Team.deleteMany({uuid:{$in:ids}});
      const subGroup = await SubTeam.deleteMany({team_id:{$in:teamIds}});
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
  const deactivateGroups= async (req, res) => {
    try {
      const {ids} = req.body;
      const group = await Team.updateMany({uuid:{$in:ids}},{ status: "Inactive" });
      // const subGroup = await SubTeam.updateMany({team_id:{$in:ids}},{ status: "Inactive" });
      return res.status(200).json({
        isSuccess: true,
        message: "Group deactivated successfully",
        data: { group }
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to deactivate group",
        error: error.message
      });
    }
  }
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