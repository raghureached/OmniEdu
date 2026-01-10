const GlobalAssignment = require("../../models/globalAdmin/Assignments/global_Assignment")
const GlobalModule = require("../../models/globalAdmin/Module/globalModule_model.js")
const GlobalAssessment = require("../../models/globalAdmin/Assessments/globalAssessments_model.js")
const Surveys = require("../../models/globalAdmin/Surveys/global_surveys_model")
const Organization = require("../../models/globalAdmin/Organization/organization_model")
const { logActivity } = require("../../utils/activityLogger")
const mongoose = require("mongoose")
const { sendMail } = require("../../utils/Emailer")
const createAssignment = async (req, res) => {
    let session;
    try {
        const {
            assignDate,
            assignTime,
            dueDate,
            dueTime,
            notifyUsers,
            isRecurring,
            contentId,
            orgIds,
            contentType
        } = req.body;

        // Validate input
        if (!contentId || !orgIds?.length || !contentType) {
            return res.status(400).json({
                isSuccess: false,
                message: "Missing required fields"
            });
        }

        // Fetch organizations
        const organizations = await Organization.find({ uuid: { $in: orgIds } });
        if (!organizations.length) {
            return res.status(404).json({
                isSuccess: false,
                message: "No valid organizations found"
            });
        }

        // Fetch content based on type
        let content;
        if (contentType === "Module") {
            content = await GlobalModule.findOne({ uuid: contentId });
        } else if (contentType === "Assessment") {
            content = await GlobalAssessment.findOne({ uuid: contentId });
        } else if (contentType === "Survey") {
            content = await Surveys.findOne({ uuid: contentId });
        }

        if (!content) {
            return res.status(404).json({
                isSuccess: false,
                message: "Content not found"
            });
        }

        const contentName = content.title;

        // Start MongoDB session
        session = await mongoose.startSession();
        session.startTransaction();

        const assignments = [];

        for (const org of organizations) {
            const assignmentData = {
                assignDate,
                assignTime,
                dueDate,
                dueTime,
                notifyUsers,
                isRecurring,
                contentName,
                orgId: org._id,
                ModuleId: contentType === "Module" ? content._id : null,
                surveyId: contentType === "Survey" ? content._id : null,
                assessmentId: contentType === "Assessment" ? content._id : null,
            };

            const assignment = await GlobalAssignment.create([assignmentData], { session });
            assignments.push(assignment[0]);
        }
        if (contentType === "Module") {
            content = await GlobalModule.findOneAndUpdate({ uuid: contentId }, { status: "Published" }, { session });
        } else if (contentType === "Assessment") {
            content = await GlobalAssessment.findOneAndUpdate({ uuid: contentId }, { status: "Published" }, { session });
        } else if (contentType === "Survey") {
            content = await Surveys.findOneAndUpdate({ uuid: contentId }, { status: "Published" }, { session });
        }



        await session.commitTransaction();
        if (notifyUsers && Array.isArray(organizations) && organizations.length > 0) {

            const emailJobs = organizations
                .filter(org => org?.email)
                .map(org => {
                    const emailText = `Hello ${org.name || ''},

You have been granted access to new content.
Please log in to your dashboard to explore it.

Content: ${contentName}
Access your dashboard at: https://omniedu-fe587.web.app/

Regards,
Platform Team`;

                    return sendMail(
                        org.email,
                        'Access to New Content Granted',
                        emailText
                    );
                });
                // console.log(emailJobs)

            const results = await Promise.allSettled(emailJobs);

            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const failedCount = results.filter(r => r.status === 'rejected').length;

            // console.log(`📧 Notification emails sent: ${successCount}`);
            if (failedCount > 0) {
                console.warn(`⚠️ Failed email attempts: ${failedCount}`);
            }
        }


        await logActivity({
            userId: req.user._id,
            action: "Create",
            details: `Created global assignment`,
            userRole: req.user.role,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            status: "success",
        });

        return res.status(201).json({
            isSuccess: true,
            message: "Assignment created successfully",
            data: assignments,
        });

    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error("Error creating assignment:", error);
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to create assignment",
            error: error.message,
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};



const fetchAssignments = async (req, res) => {
    try {
        const assignments = await GlobalAssignment.find()
        return res.status(200).json({
            isSuccess: true,
            message: "Assignments fetched successfully",
            data: assignments
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch assignments",
            error: error.message
        })
    }
}

module.exports = {
    createAssignment,
    fetchAssignments
}