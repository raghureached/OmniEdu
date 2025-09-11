const Organization = require("../../models/organization_model");
const Plan = require("../../models/plans_model");
const { z } = require("zod");


const STATUS_ENUM = ["Active", "Inactive", "Suspended"];

const baseOrgSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    email: z.string().email("Invalid email format"),
    status: z.enum(STATUS_ENUM),
    start_date: z.coerce.date({ invalid_type_error: "Invalid start date" }),
    end_date: z.coerce.date({ invalid_type_error: "Invalid end date" }),
    planId: z.string().min(1, "Plan ID is required"),
    logo_url: z.string().url("Invalid logo URL").optional(),
    documents: z.array(z.string().url("Invalid document URL")).optional(),
});

const createOrganizationSchema = baseOrgSchema;

const updateOrganizationSchema = baseOrgSchema.partial().refine(
    (data) => Object.keys(data).length > 0, { message: "At least one field must be provided for update" }
);

const addOrganization = async(req, res) => {
    try {
        // const {
        //     name,
        //     email,
        //     status,
        //     start_date,
        //     end_date,
        //     planId,
        // } = req.body;
        const parsed = createOrganizationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.flatten(),
            });
        }

        const { name, email, status, start_date, end_date, planId } = parsed.data;
        const plan = await Plan.findById(planId)
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Plan not found",
            });
        }
        console.log(req.uploadedFiles)
        const logo_url = req.uploadedFiles.logo[0].url;
        const documents_urls = req.uploadedFiles.documents.map(doc => doc.url);
        // 1. Create organization inside transaction
        const newOrg = await Organization.create(
            [{
                name,
                email,
                status,
                logo_url: logo_url,
                start_date,
                end_date,
                documents: documents_urls,
                plan: plan._id,
                planName: plan.name,
                planId: generatePlanId(name, plan.name),
            }, ]
        );


        return res.status(201).json({
            success: true,
            message: "Organization added successfully",
            data: newOrg[0],
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to add organization",
            error: error.message,
        });
    }
};

function generatePlanId(orgName, planName) {
    const sanitize = (str, len = null) => {
        if (!str) return "";
        return str
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "") // remove spaces, hyphens, special chars
            .substring(0, len || str.length); // cut length if required
    };

    const orgCode = sanitize(orgName, 3).padEnd(3, "X"); // ensure at least 3 chars
    const planCode = sanitize(planName, 3);
    const year = new Date().getFullYear();

    return `${orgCode}-${planCode}-${year}`;
}


const editOrganization = async(req, res) => {
    try {
        //chrom const { name, email, status, logo_url, start_date, end_date, documents, planId } = req.body;
        const parsed = updateOrganizationSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.flatten(),
            });
        }

        const { name, email, status, logo_url, start_date, end_date, documents, planId } = parsed.data;

        const plan = await Plan.findById(planId)
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Plan not found"
            })
        }
        const updatedOrg = await Organization.findOneAndUpdate({ uuid: req.params.id }, {
            name,
            email,
            status,
            logo_url,
            start_date,
            end_date,
            documents,
            plan: plan._id,
            planName: plan.name,
            planId: generatePlanId(name, plan.name),
        })
        return res.status(200).json({
            success: true,
            message: "Organization updated successfully",
            data: updatedOrg
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update organization",
            error: error.message
        })
    }
}

const deleteOrganization = async(req, res) => {
    try {
        const deletedOrg = await Organization.findOneAndDelete({ uuid: req.params.id })
        return res.status(200).json({
            success: true,
            message: "Organization deleted successfully",
            data: deletedOrg
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete organization",
            error: error.message
        })
    }
}
const getOrganizations = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        // Filters from query
        const name = req.query.name;
        const status = req.query.status;
        const plan = req.query.plan;

        // Build dynamic MongoDB filter
        const filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // case-insensitive search
        }

        if (status) {
            filter.status = status;
        }

        if (plan) {
            filter.plan = plan; // e.g., 'free', 'premium'
        }

        // Fetch filtered and paginated results
        const organizations = await Organization.find(filter)
            .skip(skip)
            .limit(limit);

        const total = await Organization.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Organizations fetched successfully",
            data: organizations,
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
            message: "Failed to fetch organizations",
            error: error.message
        });
    }
};

module.exports = {
    addOrganization,
    editOrganization,
    deleteOrganization,
    getOrganizations
}