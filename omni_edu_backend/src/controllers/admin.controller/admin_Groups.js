
const Team = require("../../models/teams_model");
const SubTeam = require("../../models/subTeams_model");

const addGroup = async (req, res) => {
    try {
        const { teamName, subTeamName, description, subTeamDescription } = req.body;
        if (!teamName || !subTeamName || !description || !subTeamDescription) {
            return res.status(400).json({
                isSuccess: false,
                message: "All fields are required"
            })
        }
        const team = await Team.create({
            name: teamName,
            description,
            ///Change when authentication is added
            organization_id: "68b5a94c5991270bf14b9d13",
            created_by: "68b84267efd625b8496763f8"
        })
        const subTeam = await SubTeam.create({
            name: subTeamName,
            description: subTeamDescription,
            team_id: team._id,
            ///Change when authentication is added
            organization_id: "68b5a94c5991270bf14b9d13",
            created_by: "68b84267efd625b8496763f8"
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
      const organization_id =  "68b5a94c5991270bf14b9d13";
      const teams = await Team.find({ organization_id });
      const subTeams = await SubTeam.find({ team_id });
      
      const groups = teams.map(team => {
        const subTeamsForTeam = subTeams.filter(
          subTeam => subTeam.team_id.toString() === team._id.toString()
        );
  
        return {
          ...team.toObject(),
          subTeams: subTeamsForTeam
        };
      });
  
      return res.status(200).json({
        isSuccess: true,
        message: "Groups fetched successfully",
        data: groups
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to fetch groups",
        error: error.message
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

module.exports = {
    addGroup,
    getGroups,
    editGroup,
    deleteGroup
}