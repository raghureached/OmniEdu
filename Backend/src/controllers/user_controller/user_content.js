const LearningPath = require("../../models/learningPath_model");
const Module = require("../../models/moduleOrganization_model");
const OrganizationAssessments = require("../../models/organizationAssessments_model");
const OrganizationSurveys = require("../../models/organizationSurveys_model");

const getModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        // console.log(moduleId)
        const module = await Module.findOne({uuid:moduleId}).populate("team").populate("subteam");
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        return res.status(200).json(module);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getAssessment = async(req,res) =>{
    try {
        const { assessmentId } = req.params;
        const assessment = await OrganizationAssessments.findOne({uuid:assessmentId}).populate("questions").populate("team").populate("subteam");
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }
        return res.status(200).json(assessment);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getSurvey = async(req,res) =>{
    try {
        const { surveyId } = req.params;
        const survey = await OrganizationSurveys.findOne({uuid:surveyId}).populate({
            path: "sections",
            populate: {
                path: "questions",
                model: "OrganizationSurveyQuestion"
            }
        }).populate("team").populate("subteam");
        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }
        return res.status(200).json(survey);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}

const getLearningPath = async(req,res)=>{
    try {
        const { learningPathId } = req.params;
        const learningPath = await LearningPath.findOne({uuid:learningPathId}).populate("lessons.id").populate("team").populate("subteam");
        if (!learningPath) {
            return res.status(404).json({ message: 'Learning Path not found' });
        }
        return res.status(200).json(learningPath);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
}
module.exports = {
    getModule,
    getAssessment,
    getSurvey,
    getLearningPath
}

        
    