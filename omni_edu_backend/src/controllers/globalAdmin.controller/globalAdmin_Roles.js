const GlobalRoles = require("../../models/globalRoles_model");
const Permissions = require("../../models/permissions_model");
const { z } = require("zod");
// ======================
// Zod Schemas
// ======================
// const { z } = require("zod");

const permissionSchema = z.object({
  id: z.string().min(1, "Permission id is required"),   // e.g., "view_home"
  label: z.string().min(1, "Permission label is required"), // e.g., "View Home"
});

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),  // e.g., "Dashboard"
  permissions: z.array(permissionSchema).default([]),   // list of permissions
});

const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().trim().optional().default(""),
  sections: z.array(sectionSchema).default([]), // ✅ new field for sections & permissions
});

const updateRoleSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().trim().optional(),
    sections: z.array(sectionSchema).optional(), // ✅ update allows changing sections
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided to update" }
  );

// ======================
// Controller
// ======================
const addRole = async (req, res) => {
  try {
    const parsed = createRoleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.errors,
      });
    }
    // console.log(parsed.data)
    const { name, description, sections } = parsed.data;
    // console.log(sections)
    const newRole = await GlobalRoles.create({
      name,
      description,
      permissions:sections,
    });
    // console.log(newRole)
    return res.status(201).json({
      success: true,
      message: "Role added successfully",
      data: newRole,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add role",
      error: error.message,
    });
  }
};


const editRole = async(req, res) => {
    try {
        //const { name, description, permissions } = req.body;
        const bodyParsed = updateRoleSchema.safeParse(req.body);
        if (!bodyParsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: bodyParsed.error.errors,
            });
        }
        const updatedRole = await GlobalRoles.findOneAndUpdate({ uuid: req.params.id }, bodyParsed.data, { new: true })
        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: updatedRole
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update role",
            error: error.message
        })
    }
}

const deleteRole = async(req, res) => {
    try {
        const deletedRole = await GlobalRoles.findOneAndDelete({ uuid: req.params.id })
        return res.status(200).json({
            success: true,
            message: "Role deleted successfully",
            data: deletedRole
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete role",
            error: error.message
        })
    }
}
const getRoles = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;
        const roles = await GlobalRoles.find().skip(skip).limit(limit)
        const total = await GlobalRoles.countDocuments()
        return res.status(200).json({
            success: true,
            message: "Roles fetched successfully",
            data: roles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch roles",
            error: error.message
        })
    }
}

const addPermissions = async (req, res) => {
    try {
      // Check if permissions already exist to prevent duplicates
      const existing = await Permissions.find({});
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Permissions already exist in the database."
        });
      }
      const availablePermissions = [
        { "id": "training_calendar", "label": "Training Calendar", "section": "User Home Section" },
        { "id": "message_board", "label": "Message Board", "section": "User Home Section" },
      
        { "id": "my_training_leaderboard", "label": "My Training / Leaderboard", "section": "Learning Hub Section" },
        { "id": "assigned_training", "label": "Assigned Training", "section": "Learning Hub Section" },
        { "id": "additional_training", "label": "Additional Training", "section": "Learning Hub Section" },
        { "id": "mandatory_training", "label": "Mandatory Training", "section": "Learning Hub Section" },
      
        { "id": "course_catalog", "label": "Course Catalog Section", "section": "Course Catalog Section" },
      
        { "id": "activity_history", "label": "Activity History Section", "section": "Activity History Section" },
      
        { "id": "user_profile", "label": "User Profile Section", "section": "User Profile Section" },
        { "id": "change_password", "label": "Change Password Button", "section": "User Profile Section" },
      
        { "id": "help_center", "label": "Help Center Section", "section": "Help Center Section" },
      
        { "id": "support_button", "label": "Support Button", "section": "Support Button" }
      ];
      
      // Insert all permissions
      await Permissions.insertMany(availablePermissions);
  
      res.status(200).json({
        success: true,
        message: "Permissions added successfully.",
        data: availablePermissions
      });
    } catch (error) {
      console.error("Error adding permissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add permissions.",
        error: error.message
      });
    }
  };

module.exports = {
    addRole,
    editRole,
    deleteRole,
    getRoles,
    addPermissions
}