const { required } = require("joi");
const ForAdminMessage = require("../../models/messageforAdmin");
const {z} =require("zod");
const User = require("../../models/users_model.js");
// const Notification = require("../../models/notification_model.js");
const { logActivity } = require("../../utils/activityLogger");
const ForUserMessage = require("../../models/messageForUser.js");

const MessageSchema=z.object({
    message:z.string({required_error:"Message is required"}).min(1,"messge cannot be empty"),
    orgId:z.string({required_error:"OrgId is required"}).min(1,"orgId cannot be empty"),
    status: z.enum(["active", "inactive"]).optional(),
    sendUsers:z.boolean().optional(),
})
const setMessage = async(req,res)=>{
    try {
        const parsed=MessageSchema.safeParse(req.body);
        // console.log(req.body)
        if(!parsed.success){
            return res.status(400).json({
                success:false,
                message:"Validation error",
                error:parsed.error.errors
            })
        }
        const {message,status,orgId,sendUsers} = parsed.data;
        // console.log(message,orgId)
        const messageSet = await ForAdminMessage.create({
            message_text:message,
            status,
            send_users:sendUsers,
            organization_id:orgId,
            created_by:req.user._id,
        })
        if(sendUsers){
                await ForUserMessage.create({ 
                    message_text:message,
                    status:status,
                    organization_id:orgId,
                    created_by:req.user._id,
                    isGlobal:true
                })
            
            await logActivity({
                userId: req.user._id,
                action: "Create",
                details: `Set global message: ${message?.substring(0, 50) || 'unknown'}...`,
                userRole: req.user.role,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                status: "success",
            })
            return res.status(201).json({
                success:true,
                message:"Message set successfully for users and admin",
                data:messageSet
            })
        }
        await logActivity({
            userId: req.user._id,
            action: "Create",
            details: `Set global message: ${message?.substring(0, 50) || 'unknown'}...`,
            userRole: req.user.role,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            status: "success",
        })
        return res.status(201).json({
            success:true,
            message:"Message set successfully for admin",
            data:messageSet
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to set message",
            error:error.message
        })
    }
}

const editMessage = async(req,res)=>{
    try {
        //const {message,status} = req.body;
         const parsed=MessageSchema.partial().safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                success:false,
                message:"Validation error",
                error:parsed.error.errors
            })
        }
        const {message,status} = parsed.data;
        const editedMessage = await ForAdminMessage.findOneAndUpdate({uuid:req.params.id}, { message_text: message, status },
      { new: true })
        if(!editedMessage){
            return res.status(404).json({
                success:false,
                message:"Message not found"
            })
        }
        await logActivity({
            userId: req.user._id,
            action: "Update",
            details: `Edited global message: ${message?.substring(0, 50) || 'unknown'}...`,
            userRole: req.user.role,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            status: "success",
        })
        return res.status(201).json({
            success:true,
            message:"Message edited successfully",
            data:editedMessage
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to set message",
            error:error.message
        })
    }
}

const deleteMessage = async(req,res)=>{
    try {
        const deletedMessage = await ForAdminMessage.findOneAndDelete({uuid:req.params.id})
        if(!deletedMessage){
            return res.status(404).json({
                success:false,
                message:"Message not found"
            })
        }
        await logActivity({
            userId: req.user._id,
            action: "Delete",
            details: `Deleted global message: ${deletedMessage?.message_text?.substring(0, 50) || 'unknown'}...`,
            userRole: req.user.role,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            status: "success",
        })
        return res.status(200).json({
            success:true,
            message:"Message deleted successfully",
            data:deletedMessage
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to delete message",
            error:error.message
        })
    }
}
const getMessage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const {orgId} = req.body;
    const messages = await ForAdminMessage.find({organization_id:orgId})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // newest first (optional)

    const total = await ForAdminMessage.countDocuments({ organization_id:orgId});
    // await logGlobalAdminActivity(req,"Get Message","message","Message fetched successfully")
    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// duplicate getAllMessages removed

// New: Fetch all messages across organizations (Global Admin dashboard)
const getAllMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await ForAdminMessage.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForAdminMessage.countDocuments({});

    return res.status(200).json({
      success: true,
      message: "All messages fetched successfully",
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

module.exports = {
  setMessage,
  editMessage,
  deleteMessage,
  getMessage,
  getAllMessages,
};