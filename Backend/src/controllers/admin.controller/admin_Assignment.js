const ForUserAssignment = require("../../models/forUserAssigments_model");
const Team = require("../../models/teams_model");
const UserProfile = require("../../models/userProfiles_model");
const UserContentProgress = require("../../models/userContentProgress_model");
const LearningPath = require("../../models/learningPath_model");
const OrganizationAssessments = require("../../models/organizationAssessments_model");
const Module = require("../../models/moduleOrganization_model");
const OrganizationSurveys = require("../../models/organizationSurveys_model");
// If you also track user progress
// const Progress = require("../models/progress.model");

const createAssignment = async (req, res) => {
  try {
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
      // additional frontend fields
      bulkEmails,
      enableReminder,
      resetProgress,
      recurringInterval,
      customIntervalValue,
      customIntervalUnit,
      // learning path advanced scheduling
      elementSchedules,
      enforceOrder
    } = req.body;

    if (!contentId ) {
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
        : normalizedType === "Learning Path" || normalizedType === "LearningPath"
        ? "LearningPath"
        : null;
    // Preload Learning Path details if applicable (for enforceOrder-driven locking only)
    let lp = null;
    if (content_type === "LearningPath" && contentId) {
      lp = await LearningPath.findById(contentId).select("enforceOrder lessons");
    }

    // Determine effective enforceOrder: rely solely on LP setting
    const enforceOrderEffective = !!(lp && lp.enforceOrder === true);

    // Use element schedules exactly as provided; just coerce provided dates to Date objects
    const elementSchedulesEffective = Array.isArray(elementSchedules)
      ? elementSchedules.map(e => ({
          elementId: e.elementId,
          assign_on: e.assign_on ? new Date(e.assign_on) : null,
          due_date: e.due_date ? new Date(e.due_date) : null,
        }))
      : [];
    console.log(elementSchedulesEffective)
    let assignment;
    // Determine if assigned individually or via groups based on presence of assignedUsers/groups
    const isIndividual = Array.isArray(assignedUsers) && assignedUsers.length > 0 && (!groups || groups.length === 0);
    // Safely parse dates and derive time strings
    const assignDateObj = assignDate ? new Date(assignDate) : null;
    const dueDateObj = dueDate ? new Date(dueDate) : null;
    const assignTimeStr = (assignDateObj && !isNaN(assignDateObj)) ? assignDateObj.toISOString().split('T')[1] : null;
    const   dueTimeStr = (dueDateObj && !isNaN(dueDateObj)) ? dueDateObj.toISOString().split('T')[1] : null;

    if(isIndividual){
     assignment = await ForUserAssignment.create({
        organization_id:req.user.organization_id,
        assign_type:content_type,
        assign_on: assignDateObj || Date.now(),
        due_date: dueDateObj || null,
        notify_users: typeof notifyUsers === 'boolean' ? notifyUsers : true,
        isRecurring: isRecurring ?? false,
        assigned_users:assignedUsers,
        created_by: req.user._id,
        dueTime: dueTimeStr,
        assignTime: assignTimeStr,
        contentId:contentId,
        contentType:contentType,
        contentName:contentName,
        // additional settings
        bulkEmails: Array.isArray(bulkEmails) ? bulkEmails : [],
        enableReminder: !!enableReminder,
        resetProgress: !!resetProgress,
        recurringInterval: isRecurring ? (recurringInterval || "") : "",
        customIntervalValue: isRecurring && recurringInterval === "custom" ? Number(customIntervalValue || 0) : 0,
        customIntervalUnit: isRecurring && recurringInterval === "custom" ? (customIntervalUnit || "days") : "days",
        elementSchedules: elementSchedulesEffective,
      });
    }else{
      
     assignment = await ForUserAssignment.create({
      organization_id:req.user.organization_id,
      assign_type:content_type,
      assign_on: assignDateObj || Date.now(),
      due_date: dueDateObj || null,
      notify_users: typeof notifyUsers === 'boolean' ? notifyUsers : true,
      isRecurring: isRecurring ?? false,
      assigned_users:null,
      created_by: req.user._id,
      dueTime: dueTimeStr,
      assignTime: assignTimeStr,
      contentId:contentId,
      contentType:contentType,
      contentName:contentName,
      groups:groups,
      // additional settings
      bulkEmails: Array.isArray(bulkEmails) ? bulkEmails : [],
      enableReminder: !!enableReminder,
      resetProgress: !!resetProgress,
      recurringInterval: isRecurring ? (recurringInterval || "") : "",
      customIntervalValue: isRecurring && recurringInterval === "custom" ? Number(customIntervalValue || 0) : 0,
      customIntervalUnit: isRecurring && recurringInterval === "custom" ? (customIntervalUnit || "days") : "days",
      elementSchedules: elementSchedulesEffective,
    });
  }
    // Create progress records for targeted users
    let targetUserIds = [];
    if (isIndividual) {
      targetUserIds = Array.isArray(assignedUsers) ? assignedUsers : [];
    } else if (Array.isArray(groups) && groups.length > 0) {
      const profiles = await UserProfile.find({
        $or: [
          { team_id: { $in: groups } },
          { "teams.team_id": { $in: groups } }
        ],
      }).select("user_id teams team_id");
      targetUserIds = profiles.map(p => p.user_id);
    }
    if (targetUserIds.length > 0) {
      // Precompute element progress entries if provided
      const now = new Date();
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
      const ops = targetUserIds.map(uid => ({
        updateOne: {
          filter: { assignment_id: assignment._id, user_id: uid },
          update: {
            $setOnInsert: {
              organization_id: req.user.organization_id,
              assignment_id: assignment._id,
              user_id: uid,
              contentId: assignment.contentId,
              contentType: assignment.contentType,
              status: "assigned",
              progress_pct: 0,
              started_at: null,
              completed_at: null,
              last_activity_at: null,
              ...(elementsProgress.length ? { elements: elementsProgress } : {}),
            },
          },
          upsert: true,
        },
      }));
      if (ops.length) {
        await UserContentProgress.bulkWrite(ops, { ordered: false });
      }
    }
    try{
      // console.log("assignment",assignment)
    if(content_type === "LearningPath"){
      await LearningPath.updateOne({ _id: assignment.contentId }, {status:"Published"});
    }else if(content_type === "OrganizationModule"){
      await Module.updateOne({ _id: assignment.contentId }, {status:"Published"});
    }else if(content_type === "OrganizationAssessments"){
      await OrganizationAssessments.updateOne({ _id: assignment.contentId }, {status:"Published"});
    }else if(content_type === "OrganizationSurvey"){
      await OrganizationSurveys.updateOne({ _id: assignment.contentId }, {status:"Published"});
    }
  }catch(error){
    console.log(error)
  }
    return res.status(201).json({
      isSuccess: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to create assignment",
      error: error.message,
    });
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
    return res.status(200).json({
      isSuccess: true,
      message: "Assignment edited successfully",
      data: assignment,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to edit assignment",
      error: error.message,
    });
  }
};

const deleteAssignment = async(req,res)=>{
    try {
        const {id} = req.params
        const assignment = await ForUserAssignment.findOneAndDelete({uuid:id})
        return res.status(200).json({
            isSuccess:true,
            message:"Assignment deleted successfully",
            data:assignment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to delete assignment",
            error:error.message
        })
    }
}

const getAssignments = async(req,res)=>{
    try {
        const assignments = await ForUserAssignment.find()
        return res.status(200).json({
            isSuccess:true,
            message:"Assignments fetched successfully",
            data:assignments
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch assignments",
            error:error.message
        })
    }
}

const getAssignment = async(req,res)=>{
    try {
        const {id} = req.params
        const assignment = await ForUserAssignment.findOne({uuid:id}).populate("contentId")
        return res.status(200).json({
            isSuccess:true,
            message:"Assignment fetched successfully",
            data:assignment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch assignment",
            error:error.message
        })
    }
}
module.exports = {
  createAssignment,
  editAssignment,
  deleteAssignment,
  getAssignments,
  getAssignment
};
