const GlobalModule = require("../../models/globalModule_model");
const { z } = require("zod");
const { logGlobalAdminActivity } = require("./globalAdmin_activity");

const CONTENT_TYPES = ["PDF", "DOCX", "Theory"];

const createContentSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(CONTENT_TYPES, {
      message: `Type must be one of: ${CONTENT_TYPES.join(", ")}`,
    }),
    content: z.string().optional(),
    is_active: z.boolean().optional(),
    pushable_to_orgs: z.boolean().optional(),
    file_url: z.string().url("Invalid file URL").optional(),
  })
  .refine(
    (data) => {
      if (data.type === "Theory") return !!data.content;
      if (["PDF", "DOCX"].includes(data.type)) return !!data.file_url;
      return true;
    },
    {
      message:
        "Invalid content: Theory requires content text, PDF/DOCX require file_url",
    }
  );

const updateContentSchema = createContentSchema.partial();

const addContent = async (req, res) => {
  try {
    // const {
    //   title,
    //   type,
    //   content,
    //   is_active,
    //   pushable_to_orgs,
    // } = req.body;
    // const parsed = createContentSchema.safeParse({
    //   ...req.body,
    //   file_url: req.uploadedFile?.url || req.body.file_url,
    // });
    // if (!parsed.success) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors: parsed.error.flatten(),
    //   });
    // }

    const { title, type, content, pushable_to_orgs, tags, duration,learning_outcomes } = req.body;
    const created_by = req.user?._id || null;
    // Validate required fields
    // if (!title || !type) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Title and type are required.'
    //   });
    // }
    // if (!['PDF', 'DOCX', 'Theory'].includes(type)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid content type. Must be PDF, DOCX, or Theory.'
    //   });
    // }
    // // At least one of content or file_url should be present
    // if (type === 'Theory' && !content) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Theory content requires a text body.'
    //   });
    // }
    // if ((type === 'PDF' || type === 'DOCX') && !file_url) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `${type} content requires a file URL.`
    //   });
    // }
    const docUrls = req.uploadedFiles?.documentFiles.filter((doc) => doc.url).map((doc) => doc.url)
    const newModule = new GlobalModule({
      title,
      type,
      content,
      video_url: req.uploadedFiles.videoFile[0].url,
      doc_url: docUrls,
      pushable_to_orgs,
      learning_outcomes,
      tags,
      duration,
      created_by
    });

    await newModule.save();
    await logGlobalAdminActivity(req,"Create Content","content",`Content created successfully ${newModule.title}`)
    return res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      data: newModule
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add module.',
      error: error.message
    });
  }
};

const getContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const content = await GlobalModule.find().skip(skip).limit(limit)
    const total = await GlobalModule.countDocuments()
    // await logGlobalAdminActivity(req,"Get Content","content", `Content fetched successfully ${content.title}`)
    return res.status(200).json({
      success: true,
      message: 'Modules fetched successfully.',
      data: content,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch modules.',
      error: error.message
    });
  }
};

const getContentById = async (req, res) => {
  try {
    const content = await GlobalModule.findOne({ uuid: req.params.id });
    // await logGlobalAdminActivity(req,"Get Content","content",`Module fetched successfully ${content.title}`)
    return res.status(200).json({ success: true, message: 'Module fetched successfully.', data: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch module.', error: error.message });
  } 
}

const editContent = async (req, res) => {
  try {
    const { title, type, content, file_url, is_active, pushable_to_orgs } = req.body;
    // console.log(req.body)
    // const bodyParsed = updateContentSchema.safeParse({ 
    //   ...req.body,
    //   file_url: req.uploadedFile?.url || req.body.file_url,
    // }); 
    // if (!bodyParsed.success) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors: bodyParsed.error.flatten(),
    //   });
    // }
    const updatedModule = await GlobalModule.findOneAndUpdate(
      { uuid: req.params.id },
      { title, type, content, file_url, is_active, pushable_to_orgs },
      { new: true }
    );
    if (!updatedModule) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      })
    }
    await logGlobalAdminActivity(req,"Edit Content","content",`Content updated successfully ${updatedModule.title}`)
    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedModule
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error.message
    })
  }
}

const deleteContent = async (req, res) => {
  try {
    const deletedModule = await GlobalModule.findOneAndDelete({ uuid: req.params.id })
    if (!deletedModule) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      })
    }
    await logGlobalAdminActivity(req,"Delete Content","content",`Content deleted successfully ${deletedModule.title}`)
    return res.status(200).json({
      success: true,
      message: "Content deleted successfully",
      data: deletedModule
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message
    })
  }
}

module.exports = {
  addContent,
  getContent,
  editContent,
  deleteContent,
  getContentById
}