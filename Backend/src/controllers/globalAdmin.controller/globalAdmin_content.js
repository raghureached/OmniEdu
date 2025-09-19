const Content = require("../../models/content_model");
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

    const { title, type, content, is_active, pushable_to_orgs } =
      req.body;

    // Optional: set this from auth middleware
    const created_by = req.user?.id || null;

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


    const newContent = new Content({
      title,
      type,
      content: type === 'Theory' ? content : null,
      file_url: req.uploadedFile?.url,
      is_active: is_active !== undefined ? is_active : true,
      pushable_to_orgs: pushable_to_orgs !== undefined ? pushable_to_orgs : true,
      created_by
    });

    await newContent.save();
    await logGlobalAdminActivity(req,"Create Content","content",`Content created successfully ${newContent.title}`)
    return res.status(201).json({
      success: true,
      message: 'Content added successfully.',
      data: newContent
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add content.',
      error: error.message
    });
  }
};

const getContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const content = await Content.find().skip(skip).limit(limit)
    const total = await Content.countDocuments()
    // await logGlobalAdminActivity(req,"Get Content","content", `Content fetched successfully ${content.title}`)
    return res.status(200).json({
      success: true,
      message: 'Content fetched successfully.',
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
      message: 'Failed to fetch content.',
      error: error.message
    });
  }
};
const getContentById = async (req, res) => {
  try {
    const content = await Content.findOne({ uuid: req.params.id });
    // await logGlobalAdminActivity(req,"Get Content","content",`Content fetched successfully ${content.title}`)
    return res.status(200).json({ success: true, message: 'Content fetched successfully.', data: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch content.', error: error.message });
  } 
}

const editContent = async (req, res) => {
  try {
    const { title, type, content, file_url, is_active, pushable_to_orgs } = req.body;
    console.log(req.body)
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
    const updatedContent = await Content.findOneAndUpdate(
      { uuid: req.params.id },
      { title, type, content, file_url, is_active, pushable_to_orgs },
      { new: true }
    );
    if (!updatedContent) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      })
    }
    await logGlobalAdminActivity(req,"Edit Content","content",`Content updated successfully ${updatedContent.title}`)
    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedContent
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
    const deletedContent = await Content.findOneAndDelete({ uuid: req.params.id })
    if (!deletedContent) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      })
    }
    await logGlobalAdminActivity(req,"Delete Content","content",`Content deleted successfully ${deletedContent.title}`)
    return res.status(200).json({
      success: true,
      message: "Content deleted successfully",
      data: deletedContent
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