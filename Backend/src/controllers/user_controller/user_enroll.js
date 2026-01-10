const UserContentProgress = require("../../models/User/userContentProgress_model");
const Enrollments = require("../../models/User/userEnrolled_model");

const enroll = async (req, res) => {
    try {
        const { id } = req.params;
        const { who, model, type, name, elementSchedules } = req.body;
        const existingProgress = await UserContentProgress.findOne({
            user_id: req.user._id,
            contentId: id,
            status: { $in: ["enrolled", "assigned", "in_progress", "completed"] },
        });

        if (existingProgress) {
            return res
                .status(400)
                .json({ message: "Already enrolled for this content" });
        }
        const elementSchedulesEffective = Array.isArray(elementSchedules)
            ? elementSchedules.map(e => ({
                elementId: e.elementId,
                assign_on: e.assign_on ? new Date(e.assign_on) : null,
                due_date: e.due_date ? new Date(e.due_date) : null,
            }))
            : [];
        const Enroll = await Enrollments.create({
            user_id: req.user._id,
            organization_id: req.user.organization_id,
            contentId: id,
            assign_type: model,
            contentType: type,
            contentName: name,
            orgAssignment: false,
            assign_on: Date.now(),
            elementSchedules: elementSchedulesEffective,
        })
        const elementsProgress = Array.isArray(elementSchedulesEffective)
            ? elementSchedulesEffective.map((el, idx) => {
                const assign = el.assign_on ? new Date(el.assign_on) : null;
                const due = el.due_date ? new Date(el.due_date) : null;
                let status = "assigned";
                if ((assign && assign > now) || (enforceOrderEffective && idx > 0)) {
                    status = "locked";
                }
                return {
                    elementId: el.elementId,
                    status,
                    assign_on: assign,
                    due_date: due,
                    started_at: null,
                    completed_at: null,
                };
            })
            : [];


        const progress = await UserContentProgress.create({
            user_id: req.user._id,
            organization_id: req.user.organization_id,
            contentId: id,
            assignment_id: Enroll._id,      // <--- important
            enrollment_id: Enroll._id,
            contentType: type,
            status: "enrolled",
            orgAssignment: false,
            elements: elementsProgress,
        });
        return res.status(201).json({ message: "User enrolled successfully", progress });
    } catch (error) {
        console.error(error);
    }
}


module.exports = { enroll };
