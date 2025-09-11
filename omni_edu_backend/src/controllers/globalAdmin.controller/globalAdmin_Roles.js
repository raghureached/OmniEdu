const GlobalRoles = require("../../models/globalRoles_model");
const { z } = require("zod");


const ROLE_NAMES = ["User", "Admin", "Global Admin"];

const createRoleSchema = z.object({
    name: z.enum(ROLE_NAMES, {
        message: `name must be one of: ${ROLE_NAMES.join(", ")}`,
    }),
    description: z.string().trim().optional().default(""),
    permissions: z.array(z.string().trim()).optional().default([]),
});

const updateRoleSchema = z
    .object({
        name: z.enum(ROLE_NAMES).optional(),
        description: z.string().trim().optional(),
        permissions: z.array(z.string().trim()).optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0, { message: "At least one field must be provided to update" }
    );

const addRole = async(req, res) => {
    //// Changes to be made in roles model
    try {


        const parsed = createRoleSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.errors,
            });
        }
        const { name, description, permissions } = parsed.data;
        const newRole = await GlobalRoles.create({
            name,
            description,
            permissions
        })
        return res.status(201).json({
            success: true,
            message: "Role added successfully",
            data: newRole
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add role",
            error: error.message
        })
    }
}

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

module.exports = {
    addRole,
    editRole,
    deleteRole,
    getRoles
}