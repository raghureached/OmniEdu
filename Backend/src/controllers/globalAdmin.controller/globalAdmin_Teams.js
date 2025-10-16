const Team = require("../../models/teams_model");

const getGroups = async (req, res) => {
    try {
        const teams = await Team.find().populate("subTeams");
        res.status(200).json(
            {
                isSuccess: true,
                data: teams
            }
        )
    } catch (error) {
        res.status(500).json(
            {
                isSuccess: false,
                data: error.message
            }
        );
    }
}

module.exports = {
    getGroups
}
    