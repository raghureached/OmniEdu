const ForUserAssignment = require("../../models/Admin/forUserAssigments_model");
const mongoose = require('mongoose');
const Team = require("../../models/Admin/GroupsOrTeams/teams_model");
const UserProfile = require("../../models/User/userProfiles_model");
const UserContentProgress = require("../../models/User/userContentProgress_model");
const LearningPath = require("../../models/Admin/LearningPaths/learningPath_model");
const OrganizationAssessments = require("../../models/Admin/Assessments/organizationAssessments_model");
const Module = require("../../models/Admin/Module/moduleOrganization_model");
const OrganizationSurveys = require("../../models/Admin/Surveys/organizationSurveys_model");
const OrganizationDocument = require("../../models/Admin/Document/documentOrganization_model");
const ScormModule = require("../../models/scorm/scormModule");
const { sendMailtoIds } = require("../../utils/Emailer");
const Notification = require("../../models/Notification_model");
const { logActivity } = require("../../utils/activityLogger");
// If you also track user progress
// const Progress = require("../models/progress.model");

const createAssignment = async (req, res) => {
  const session = await UserContentProgress.startSession();
  session.startTransaction();

  try {
    const {
      name,
      assignDate,
      dueDate,
      notifyUsers,
      isRecurring,
      assignedUsers,
      contentId,
      contentName,
      contentType,
      groups,
      sendEmail,
      bulkEmails,
      enableReminder,
      resetProgress,
      recurringInterval,
      customIntervalValue,
      customIntervalUnit,
      enforceOrder
    } = req.body;

    if (!contentId) {
      await session.abortTransaction();
      return res.status(400).json({
        isSuccess: false,
        message: "Missing required fields",
      });
    }
    // map frontend contentType to model refPath
    const normalizedType = (contentType || "").trim();
    const content_type =
      normalizedType === "Module"
        ? "OrganizationModule"
        : normalizedType === "Assessment"
          ? "OrganizationAssessments"
          : normalizedType === "Survey"
            ? "OrganizationSurvey"
            : (normalizedType === "Learning Path" || normalizedType === "LearningPath")
              ? "LearningPath"
              : normalizedType === "Document"
                ? "OrganizationDocument"
                : normalizedType === "SCORM"
                  ? "ScormModule"
                  : null;

    let lp = null;
    if (content_type === "LearningPath" && contentId) {
      lp = await LearningPath.findById(contentId).select("enforceOrder lessons").session(session);
    }

    // Determine effective enforceOrder: rely solely on LP setting
    const enforceOrderEffective = !!(lp && lp.enforceOrder === true);
    elementSchedules = lp?.lessons.map(lesson => ({
      elementId: lesson.id.toString(),
      assign_on: lesson.assign_on || null,
      due_date: lesson.due_date || null,
    }));

    // Use element schedules exactly as provided; just coerce provided dates to Date objects
    // If no element schedules provided, fetch them from the content
    let elementSchedulesEffective = Array.isArray(elementSchedules)
      ? elementSchedules.map(e => ({
        elementId: e.elementId,
        assign_on: e.assign_on ? new Date(e.assign_on) : null,
        due_date: e.due_date ? new Date(e.due_date) : null,
      }))
      : [];

    // If elementSchedules is empty, try to fetch elements from the content
    if (elementSchedulesEffective.length === 0) {
      if (content_type === "LearningPath" && lp) {
        // Get lessons from learning path
        elementSchedulesEffective = lp.lessons.map(lesson => ({
          elementId: lesson.id.toString(),
          assign_on: lesson.assign_on || null,
          due_date: lesson.due_date || null,
        }))
      } 
    }

    let assignment;
    // Determine if assigned individually or via groups based on presence of assignedUsers/groups
    const isIndividual = Array.isArray(assignedUsers) && assignedUsers.length > 0 && (!groups || groups.length === 0);
    // Safely parse dates and derive time strings
    const assignDateObj = assignDate ? new Date(assignDate) : null;
    const dueDateObj = dueDate ? new Date(dueDate) : null;
    const assignTimeStr = (assignDateObj && !isNaN(assignDateObj)) ? assignDateObj.toISOString().split('T')[1] : null;
    const dueTimeStr = (dueDateObj && !isNaN(dueDateObj)) ? dueDateObj.toISOString().split('T')[1] : null;
    if (isIndividual) {
      assignment = await ForUserAssignment.create([{
        name:name,
        organization_id: req.user.organization_id,
        assign_type: content_type,
        assign_on: assignDateObj || Date.now(),
        due_date: dueDateObj || null,
        notify_users: typeof notifyUsers === 'boolean' ? notifyUsers : true,
        isRecurring: isRecurring ?? false,
        assigned_users: assignedUsers,
        created_by: req.user._id,
        dueTime: dueTimeStr,
        assignTime: assignTimeStr,
        contentId: contentId,
        contentType: contentType,
        contentName: contentName,
        // additional settings
        bulkEmails: Array.isArray(bulkEmails) ? bulkEmails : [],
        enableReminder: !!enableReminder,
        resetProgress: !!resetProgress,
        recurringInterval: isRecurring ? (recurringInterval || "") : "",
        customIntervalValue: isRecurring && recurringInterval === "custom" ? Number(customIntervalValue || 0) : 0,
        customIntervalUnit: isRecurring && recurringInterval === "custom" ? (customIntervalUnit || "days") : "days",
        elementSchedules: elementSchedulesEffective,
        orgAssignment: true,
      }], { session });
      assignment = assignment[0];
    } else {

      assignment = await ForUserAssignment.create([{
        name:name,
        organization_id: req.user.organization_id,
        assign_type: content_type,
        assign_on: assignDateObj || Date.now(),
        due_date: dueDateObj || null,
        notify_users: typeof notifyUsers === 'boolean' ? notifyUsers : true,
        isRecurring: isRecurring ?? false,
        assigned_users: null,
        created_by: req.user._id,
        dueTime: dueTimeStr,
        assignTime: assignTimeStr,
        contentId: contentId,
        contentType: contentType,
        contentName: contentName,
        groups: groups,
        // additional settings
        bulkEmails: Array.isArray(bulkEmails) ? bulkEmails : [],
        enableReminder: !!enableReminder,
        resetProgress: !!resetProgress,
        recurringInterval: isRecurring ? (recurringInterval || "") : "",
        customIntervalValue: isRecurring && recurringInterval === "custom" ? Number(customIntervalValue || 0) : 0,
        customIntervalUnit: isRecurring && recurringInterval === "custom" ? (customIntervalUnit || "days") : "days",
        elementSchedules: elementSchedulesEffective,
        orgAssignment: true,
      }], { session });
      assignment = assignment[0];
    }
    // Create progress records for targeted users
    let targetUserIds = [];
    let emailUserIds = [];
    if (isIndividual) {
      targetUserIds = Array.isArray(assignedUsers) ? assignedUsers : [];
    } else if (Array.isArray(groups) && groups.length > 0) {
      const profiles = await UserProfile.find({
        $or: [
          { team_id: { $in: groups } },
          { "teams.team_id": { $in: groups } }
        ],
      }).select("user_id teams team_id").session(session);
      targetUserIds = profiles.map(p => p.user_id);
    }
    if (targetUserIds.length > 0) {
      
      // 0) remove users who already have this content assigned in this org
      const existingProgress = await UserContentProgress.find({
        organization_id: req.user.organization_id,
        user_id: { $in: targetUserIds },
        contentId: contentId,
        orgAssignment: true,      // only org assignments, ignore self-enrolls
      }).select("user_id").session(session);

      const existingUserIds = new Set(
        existingProgress.map(p => p.user_id.toString())
      );

      const uniqueTargetUserIds = targetUserIds.filter(
        uid => !existingUserIds.has(uid.toString())
      );
      emailUserIds = uniqueTargetUserIds;


      // If everyone already has this content, just return without creating a new assignment
      if (uniqueTargetUserIds.length === 0) {
        await session.abortTransaction();
        return res.status(400).json({
          isSuccess: false,
          message: "This content is already assigned to the selected users.",
        });
      }
      
      const now = new Date();
      const elementsProgress = Array.isArray(elementSchedulesEffective)
        ? elementSchedulesEffective.map((el, idx) => {
          const assign = el.assign_on ? new Date(el.assign_on) : null;
          const due = el.due_date ? new Date(el.due_date) : null;
          let status = "assigned";
          if ((assign && assign > now) || (enforceOrderEffective && idx > 0)) {
            status = "locked";
          }
          const element = {
            elementId: el.elementId,
            status,
            assign_on: assign,
            due_date: due,
            started_at: null,
            completed_at: null,
          };
          return element;
        })
        : [];

      // 2) Build ops only for users who do NOT yet have this content
      const ops = uniqueTargetUserIds.map(uid => {
        const updateData = {
          organization_id: req.user.organization_id,
          assignment_id: assignment._id,
          user_id: uid,
          contentId: assignment.contentId,
          contentType: assignment.contentType,
          status: content_type === "OrganizationDocument" ? "" :"assigned",
          progress_pct: 0,
          started_at: null,
          completed_at: null,
          last_activity_at: null,
          orgAssignment: true,
        };

        // Add elements array if elementsProgress exists
        if (elementsProgress && elementsProgress.length > 0) {
          updateData.elements = elementsProgress;

        }

        return {
          updateOne: {
            filter: { assignment_id: assignment._id, user_id: uid },
            update: {
              $setOnInsert: updateData
            },
            upsert: true,
          },
        };
      });

      if (ops.length) {
        await UserContentProgress.bulkWrite(ops, { session, ordered: false });
      }

      // 3) Send notifications only to new assignees
      const notificationOps = uniqueTargetUserIds.map(uid => ({
        insertOne: {
          document: {
            title: "Assignment Created",
            description: "You have been assigned a new assignment",
            type: "Assignment",
            to: uid,
            from: "Admin",
          }
        }
      }));

      if (notificationOps.length) {
        await Notification.bulkWrite(notificationOps, { session, ordered: false });
      }
    }

    // Update content status to Published
    const updatePromises = [];
    if (content_type === "LearningPath") {
      updatePromises.push(LearningPath.updateOne({ _id: assignment.contentId }, { status: "Published" }).session(session));
    } else if (content_type === "OrganizationModule") {
      updatePromises.push(Module.updateOne({ _id: assignment.contentId }, { status: "Published" }).session(session));
    } else if (content_type === "OrganizationAssessments") {
      updatePromises.push(OrganizationAssessments.updateOne({ _id: assignment.contentId }, { status: "Published" }).session(session));
    } else if (content_type === "OrganizationSurvey") {
      updatePromises.push(OrganizationSurveys.updateOne({ _id: assignment.contentId }, { status: "Published" }).session(session));
    }

    if (content_type === "OrganizationDocument") {
      updatePromises.push(OrganizationDocument.updateOne({ _id: assignment.contentId }, { status: "Published" }).session(session));
    } else if (content_type === "ScormModule") {
      updatePromises.push(ScormModule.updateOne({ _id: assignment.contentId }, { status: "Published" }).session(session));
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // Commit the transaction
    await session.commitTransaction();

    // Send email outside of transaction (non-critical operation)
    try {
      if (sendEmail && Array.isArray(emailUserIds) && emailUserIds.length > 0) {
        await sendMailtoIds(emailUserIds, "You have been assigned a new assignment", `You have been assigned a new assignment: ${contentName}`);
      }
    } catch (error) {
      console.log("Email sending failed:", error);
    }

    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Created assignment: ${contentName || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(201).json({
      isSuccess: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Transaction error:", error);
    
    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Failed to create assignment`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

const editAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      assignDate,
      dueDate,
      notifyUsers,
      isRecurring,
      assignedUsers,
      contentId,
      contentName,
      contentType,
      groups,
      bulkEmails,
      enableReminder,
      resetProgress,
      recurringInterval,
      customIntervalValue,
      customIntervalUnit,
      // learning path advanced scheduling
      elementSchedules,
    } = req.body;

    const normalizedType = (contentType || "").trim();
    const assign_type =
      normalizedType === "Module"
        ? "OrganizationModule"
        : normalizedType === "Assessment"
          ? "OrganizationAssessments"
          : normalizedType === "Survey"
            ? "OrganizationSurvey"
            : normalizedType === "Learning Path" || normalizedType === "LearningPath"
              ? "LearningPath"
              : undefined;

    // Safely parse dates and derive time strings
    const assignDateObj = assignDate ? new Date(assignDate) : undefined;
    const dueDateObj = dueDate ? new Date(dueDate) : undefined;
    const assignTimeStr = assignDateObj && !isNaN(assignDateObj) ? assignDateObj.toISOString().split("T")[1] : undefined;
    const dueTimeStr = dueDateObj && !isNaN(dueDateObj) ? dueDateObj.toISOString().split("T")[1] : undefined;

    // Coerce element schedules if provided
    const elementSchedulesEffective = Array.isArray(elementSchedules)
      ? elementSchedules.map(e => ({
        elementId: e.elementId,
        assign_on: e.assign_on ? new Date(e.assign_on) : null,
        due_date: e.due_date ? new Date(e.due_date) : null,
      }))
      : undefined;

    const updateDoc = {
      organization_id: req.user.organization_id,
      assign_on: assignDateObj,
      due_date: dueDateObj === undefined ? undefined : (dueDateObj || null),
      assignTime: assignTimeStr,
      dueTime: dueTimeStr,
      notify_users: typeof notifyUsers === "boolean" ? notifyUsers : undefined,
      isRecurring: typeof isRecurring === "boolean" ? isRecurring : undefined,
      assigned_users: Array.isArray(assignedUsers) ? assignedUsers : undefined,
      groups: Array.isArray(groups) ? groups : undefined,
      contentId: contentId || undefined,
      contentType: contentType || undefined,
      contentName: contentName || undefined,
      bulkEmails: Array.isArray(bulkEmails) ? bulkEmails : undefined,
      enableReminder: typeof enableReminder === "boolean" ? enableReminder : undefined,
      resetProgress: typeof resetProgress === "boolean" ? resetProgress : undefined,
      recurringInterval: isRecurring ? (recurringInterval || "") : "",
      customIntervalValue: isRecurring && recurringInterval === "custom" ? Number(customIntervalValue || 0) : 0,
      customIntervalUnit: isRecurring && recurringInterval === "custom" ? (customIntervalUnit || "days") : "days",
      elementSchedules: elementSchedulesEffective,
    };
    if (assign_type) updateDoc.assign_type = assign_type;

    const assignment = await ForUserAssignment.findOneAndUpdate(
      { uuid: id },
      updateDoc,
      { new: true }
    );
    
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Updated assignment: ${contentName || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: "Assignment edited successfully",
      data: assignment,
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Failed to update assignment`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to edit assignment",
      error: error.message,
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params
    const assignment = await ForUserAssignment.findOneAndUpdate({ uuid: id },{status:"Removed"})
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Deleted assignment: ${assignment?.contentName || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });
    
    return res.status(200).json({
      isSuccess: true,
      message: "Assignment deleted successfully",
      data: assignment
    })
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to delete assignment`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete assignment",
      error: error.message
    })
  }
}

const getAssignments = async (req, res) => {
  try {
    const assignments = await ForUserAssignment.find()
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

const getAssignment = async (req, res) => {
  try {
    const { id } = req.params
    const assignment = await ForUserAssignment.findOne({ uuid: id })
    return res.status(200).json({
      isSuccess: true,
      message: "Assignment fetched successfully",
      data: assignment
    })
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch assignment",
      error: error.message
    })
  }
}

// Fetch paginated user-level progress for a given assignment (by uuid)
const getAssignmentProgress = async (req, res) => {
  try {
    const { id } = req.params; // assignment uuid
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

    let assignment = null;
    if (mongoose.isValidObjectId(id)) {
      assignment = await ForUserAssignment.findOne({ $or: [{ uuid: id }, { _id: id }] }).lean();
    } else {
      assignment = await ForUserAssignment.findOne({ uuid: id }).lean();
    }
    if (!assignment) {
      return res.status(404).json({ isSuccess: false, message: 'Assignment not found' });
    }

    const filter = { assignment_id: assignment._id };
    const total = await UserContentProgress.countDocuments(filter);
    const items = await UserContentProgress.find(filter)
      .populate('user_id', 'name first_name last_name email')
      .populate({
        path: 'assignment_id',
        select: 'contentId contentType assign_type created_by assign_on due_date',
        populate: [
          { path: 'created_by', select: 'name' },
          { path: 'contentId', select: 'title name' }, // refPath will resolve dynamically
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      isSuccess: true,
      message: 'Assignment progress fetched successfully',
      data: { items, total, page, limit },
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to fetch assignment progress',
      error: error.message,
    });
  }
};

// Delete a single user-level progress record from an assignment
const deleteAssignmentProgress = async (req, res) => {
  try {
    const { progressId } = req.params;
    const prog = await UserContentProgress.findByIdAndDelete(progressId);
    if (!prog) {
      return res.status(404).json({ isSuccess: false, message: 'Progress record not found' });
    }

    // If no more progress records remain for the assignment, mark assignment as Removed
    if (prog.assignment_id) {
      const remaining = await UserContentProgress.countDocuments({ assignment_id: prog.assignment_id });
      if (remaining === 0) {
        await ForUserAssignment.findByIdAndUpdate(prog.assignment_id, { status: 'Removed' });
      }
    }

    return res.status(200).json({
      isSuccess: true,
      message: 'Progress record deleted successfully',
      data: { _id: prog._id },
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to delete progress record',
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  editAssignment,
  deleteAssignment,
  getAssignments,
  getAssignment,
  getAssignmentProgress,
  deleteAssignmentProgress,
};
