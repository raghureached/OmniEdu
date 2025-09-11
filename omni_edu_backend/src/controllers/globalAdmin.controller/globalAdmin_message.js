const { required } = require("joi");
const ForAdminMessage = require("../../models/messageforAdmin");
const {z} =require("zod");

const MessageSchema=z.object({
    message:z.string({required_error:"Message is required"}).min(1,"messge cannot be empty"),
    status: z.enum(["active", "inactive"]).optional(),
})
const setMessage = async(req,res)=>{
    try {
        const parsed=MessageSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                success:false,
                message:"Validation error",
                error:parsed.error.errors
            })
        }
        const {message,status} = parsed.data;

        const messageSet = await ForAdminMessage.create({
            message_text:message,
            status,
            organization_id:"68bc0898fdb4a64d5a727a60",
            created_by:"68bc1d953f117b638adf49dc"
        })
        return res.status(201).json({
            success:true,
            message:"Message set successfully",
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

    const messages = await ForAdminMessage.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // newest first (optional)

    const total = await ForAdminMessage.countDocuments();

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
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

module.exports={
    setMessage,
    editMessage,
    deleteMessage,
    getMessage
}