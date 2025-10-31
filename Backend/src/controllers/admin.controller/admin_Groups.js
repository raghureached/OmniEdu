
// const Team = require("../../models/teams_model");
// const SubTeam = require("../../models/subTeams_model");

// const addGroup = async (req, res) => {
//     try {
//         const { teamName, subTeamName, description, subTeamDescription } = req.body;
//         if (!teamName || !subTeamName || !description || !subTeamDescription) {
//             return res.status(400).json({
//                 isSuccess: false,
//                 message: "All fields are required"
//             })
//         }
//         const team = await Team.create({
//             name: teamName,
//             description,
//             ///Change when authentication is added
//             organization_id: "68b5a94c5991270bf14b9d13",
//             created_by: "68b84267efd625b8496763f8"
//         })
//         const subTeam = await SubTeam.create({
//             name: subTeamName,
//             description: subTeamDescription,
//             team_id: team._id,
//             ///Change when authentication is added
//             organization_id: "68b5a94c5991270bf14b9d13",
//             created_by: "68b84267efd625b8496763f8"
//         })
//         return res.status(201).json({
//             isSuccess: true,
//             message: "Group added successfully",
//             data: { team, subTeam }
//         })

//     } catch (error) {
//         return res.status(500).json({
//             isSuccess: false,
//             message: "Failed to add group",
//             error: error.message
//         })
//     }
// }
// const getGroups = async (req, res) => {
//     try {
//       const organization_id =  "68b5a94c5991270bf14b9d13";
//       const teams = await Team.find({ organization_id });
//       const subTeams = await SubTeam.find({ team_id });
      
//       const groups = teams.map(team => {
//         const subTeamsForTeam = subTeams.filter(
//           subTeam => subTeam.team_id.toString() === team._id.toString()
//         );
  
//         return {
//           ...team.toObject(),
//           subTeams: subTeamsForTeam
//         };
//       });
  
//       return res.status(200).json({
//         isSuccess: true,
//         message: "Groups fetched successfully",
//         data: groups
//       });
//     } catch (error) {
//       return res.status(500).json({
//         isSuccess: false,
//         message: "Failed to fetch groups",
//         error: error.message
//       });
//     }
//   };
  
//   const editGroup = async (req, res) => {
//     try {
//       const { teamName, description,subTeamName, subTeamDescription } = req.body;
//       const team = await Team.findByIdAndUpdate(req.params.id, { name: teamName, description });

//       const subTeam = await SubTeam.findOneAndUpdate({team_id:req.params.id}, { name: subTeamName, description:subTeamDescription });
//       return res.status(200).json({
//         isSuccess: true,
//         message: "Group updated successfully",
//         data: { team, subTeam }
//       });
//     } catch (error) {
//       return res.status(500).json({
//         isSuccess: false,
//         message: "Failed to update group",
//         error: error.message
//       });
//     }
//   };
//   const deleteGroup = async (req, res) => {
//     try {
//       const group = await Team.findByIdAndDelete(req.params.id);
//       const subGroup = await SubTeam.findOneAndDelete({team_id:req.params.id});
//       return res.status(200).json({
//         isSuccess: true,
//         message: "Group deleted successfully",
//         data: { group, subGroup }
//       });
//     } catch (error) {
//       return res.status(500).json({
//         isSuccess: false,
//         message: "Failed to delete group",
//         error: error.message
//       });
//     }
//   };

// module.exports = {
//     addGroup,
//     getGroups,
//     editGroup,
//     deleteGroup
// }



//new code




const Team = require("../../models/teams_model");
const SubTeam = require("../../models/subTeams_model");

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
// const getGroups = async (req, res) => {
//     try {
//       const organization_id =  "68b5a94c5991270bf14b9d13";
//       const teams = await Team.find({ organization_id });
//       const subTeams = await SubTeam.find({ team_id });
      
//       const groups = teams.map(team => {
//         const subTeamsForTeam = subTeams.filter(
//           subTeam => subTeam.team_id.toString() === team._id.toString()
//         );
  
//         return {
//           ...team.toObject(),
//           subTeams: subTeamsForTeam
//         };
//       });
  
//       return res.status(200).json({
//         isSuccess: true,
//         message: "Groups fetched successfully",
//         data: groups
//       });
//     } catch (error) {
//       return res.status(500).json({
//         isSuccess: false,
//         message: "Failed to fetch groups",
//         error: error.message
//       });
//     }
//   };
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
  const addTeam = async (req, res) => {
    try {
      const { teamName, status } = req.body;
      const team = await Team.create({ name: teamName, status });
      return res.status(201).json({
        isSuccess: true,
        message: "Team added successfully",
        data: { team }
      });
    } catch (error) {
      return res.status(500).json({
        isSuccess: false,
        message: "Failed to add team",
        error: error.message
      });
    }
  };
  const addSubTeam = async(req,res) =>{
    try {
      const { subTeamName } = req.body;
      const team = await SubTeam.create({ name: subTeamName ,team_id: req.params.id});
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
    addSubTeam
} 