// role.controller.js
const Role = require("../../models/globalRoles_model");
const permissions_model = require("../../models/permissions_model");
const Permission = require("../../models/permissions_model");
const { z } = require("zod");
const Section = require("../../models/sections_model");
const OrganizationRole = require("../../models/organizationRoles_model");
const { logGlobalAdminActivity } = require("./globalAdmin_activity");
const Organization = require("../../models/organization_model");

// ✅ Validation
const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().trim().optional().default(""),
  sections: z
    .array(
      z.object({
        name: z.string().min(1, "Section name is required"),
        permissions: z.array(z.string().min(1, "Permission id required"))
      })
    )
    .nonempty("At least one section is required"),
});

const addRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    for (const permBlock of permissions) {
      const sectionExists = await Section.findById(permBlock.section);
      if (!sectionExists) {
        return res.status(400).json({ message: `Section not found: ${permBlock.section}` });
      }

      const validPermissions = await Permission.find({
        _id: { $in: permBlock.allowed },
        section: permBlock.section
      });

      if (validPermissions.length !== permBlock.allowed.length) {
        return res.status(400).json({
          message: `One or more permissions are invalid for section: ${permBlock.section}`
        });
      }
    } 
    // Create role
    const newRole = await Role.create({
      name,
      description,
      permissions
    });
    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: newRole
    });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// ✅ Update Role
const editRole = async (req, res) => {
  try {
    // const bodyParsed = updateRoleSchema.safeParse(req.body);
    // if (!bodyParsed.success) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Validation failed",
    //     errors: bodyParsed.error.errors,
    //   });
    // }

    const { name, description, permissions } = req.body;

    // 🔹 Validate sections & permissions if provided
    if (permissions && permissions.length > 0) {
      for (const permBlock of permissions) {
        const sectionExists = await Section.findById(permBlock.section);
        if (!sectionExists) {
          return res.status(400).json({ message: `Section not found: ${permBlock.section}` });
        }

        const validPermissions = await Permission.find({
          _id: { $in: permBlock.allowed },
          section: permBlock.section,
        });

        if (validPermissions.length !== permBlock.allowed.length) {
          return res.status(400).json({
            message: `One or more permissions are invalid for section: ${permBlock.section}`,
          });
        }
      }
    }
    // 🔹 Update role
    const updatedRole = await Role.findOneAndUpdate(
      { uuid: req.params.id },
      { name, description, permissions },
      { new: true, runValidators: true }
    ).populate("permissions.section").populate("permissions.allowed");

    if (!updatedRole) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }
    await logGlobalAdminActivity(req,"Edit Role","role",`Updated ${updatedRole.name} role for ${updatedRole.organization_id}`)
    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update role",
      error: error.message,
    });
  }
};


const deleteRole = async(req, res) => {
    try {
        const deletedRole = await Role.findOneAndDelete({ uuid: req.params.id })
        await logGlobalAdminActivity(req,"Delete Role","role",`Role deleted successfully ${deletedRole.name}`)
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
// ✅ Get all roles with populated sections + permissions
const getRoles = async (req, res) => {
  try {
    let formatted = []
    if(req.params.id === "global"){
      const GlobalRoles = await Role.find({})
      .populate({
        path: "permissions",
        select: "section allowed", 
      });
     formatted = GlobalRoles.map(role => ({
      _id:role._id,
      uuid: role.uuid,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(perm => ({
        section: perm.section?._id?.toString(),  // section ID
        allowed: perm.allowed?.map(a => a._id?.toString()) || [] // array of IDs
      }))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }else{
    const orgRolesIds = await Organization.findOne({uuid:req.params.id}).select("roles")
    formatted = orgRolesIds.roles;
  }
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};



//////Edit Org Role

const editOrgRole = async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const roleId = req.body.id;
    // console.log(orgId,roleId)
    if (!roleId) {
      return res.status(400).json({ success: false, message: "Role ID missing" });
    }

    // Find role by UUID
    const role = await Role.findOne({ uuid: roleId });
    if (!role) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    // Find org document by UUID
    const organization = await Organization.findOne({ uuid: orgId });
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Check if role already assigned to org, toggle accordingly
    const roleExists = organization.roles.includes(role._id);
    if (roleExists) {
      // Remove role from array
      organization.roles.pull(role._id);
    } else {
      // Add role to array (using $addToSet-like logic)
      organization.roles.push(role._id);
    }

    // Save updated organization document
    await organization.save();

    // Log the role update
    await logGlobalAdminActivity(
      req, 
      "Edit Role", 
      "role", 
      `${roleExists ? "Removed" : "Added"} ${role.name} role for organization ${organization.uuid}`
    );

    return res.status(200).json({
      success: true,
      message: `Role ${roleExists ? "removed" : "added"} successfully`,
      data: organization.roles,
    });

  } catch (error) {
    console.error("Error editing org role:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const addPermissions = async (req, res) => {
  try {
    // Prevent duplicates (if already inserted)
    const existingSections = await Section.find({});
    if (existingSections.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Sections & Permissions already exist in the database."
      });
    }

    // Define sections and permissions
    const availablePermissions = [
      {
        section: "User Home Section",
        permissions: ["Training Calendar", "Message Board"]
      },
      {
        section: "Learning Hub Section",
        permissions: [
          "My Training / Leaderboard",
          "Assigned Training",
          "Additional Training",
          "Mandatory Training"
        ]
      },
      {
        section: "Course Catalog Section",
        permissions: ["Course Catalog Access"]
      },
      {
        section: "Activity History Section",
        permissions: ["Activity History Access"]
      },
      {
        section: "User Profile Section",
        permissions: ["Profile Access", "Change Password Button"]
      },
      {
        section: "Help Center Section",
        permissions: ["Help Center Access"]
      },
      {
        section: "Support Button",
        permissions: ["Support Button Access"]
      }
    ];

    let savedSections = [];
    let savedPermissions = [];

    // Insert sections and permissions
    for (const sec of availablePermissions) {
      // Create section
      const newSection = new Section({ name: sec.section });
      const savedSection = await newSection.save();

      // Create permissions under this section
      const permissionDocs = await Permission.insertMany(
        sec.permissions.map((perm) => ({
          name: perm,
          section: savedSection._id
        }))
      );

      savedSections.push(savedSection);
      savedPermissions.push(...permissionDocs);
    }
    await logGlobalAdminActivity(req,"Add Permissions","permissions","Permissions added successfully")
    res.status(200).json({
      success: true,
      message: "Sections & Permissions added successfully.",
      sections: savedSections,
      permissions: savedPermissions
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

const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({})
      .populate("section", "uuid name description");

    // Group by section
    const grouped = permissions.reduce((acc, perm) => {
      const sectionId = perm.section._id.toString();

      if (!acc[sectionId]) {
        acc[sectionId] = {
          sectionId: perm.section._id,
          uuid: perm.section.uuid,
          name: perm.section.name,
          description: perm.section.description || "",
          permissions: []
        };
      }

      acc[sectionId].permissions.push({
        _id: perm._id,
        uuid: perm.uuid,
        name: perm.name
      });

      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: Object.values(grouped)
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



module.exports = {
    addRole,
    editRole,
    deleteRole,
    editOrgRole,
    getRoles,
    addPermissions,
    getPermissions
}