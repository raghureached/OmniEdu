const Organization = require("../../models/organization_model");
const Plan = require("../../models/plans_model");
const { z } = require("zod");
const { logGlobalAdminActivity } = require("./globalAdmin_activity");
const Role = require("../../models/globalRoles_model");
const OrganizationRole = require("../../models/organizationRoles_model");
const mongoose = require("mongoose");
const User = require("../../models/users_model");
const UserProfile = require("../../models/userProfiles_model");

const STATUS_ENUM = ["Active", "Inactive", "Suspended"];

const baseOrgSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    email: z.string().email("Invalid email format"),
    status: z.enum(STATUS_ENUM),
    start_date: z.coerce.date({ invalid_type_error: "Invalid start date" }),
    end_date: z.coerce.date({ invalid_type_error: "Invalid end date" }),
    planId: z.string().min(1, "Plan ID is required"),
});

const createOrganizationSchema = baseOrgSchema;

const updateOrganizationSchema = baseOrgSchema.partial().refine(
    (data) => Object.keys(data).length > 0, { message: "At least one field must be provided for update" }
);

const addOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // -------- 1. Validation --------
      const parsed = createOrganizationSchema.safeParse(req.body);
      if (!parsed.success) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        });
      }
  
      // -------- 2. Plan Verification --------
      const { name, email, status, start_date, end_date, planId } = parsed.data;
      const plan = await Plan.findById(planId);
      if (!plan) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }
  
      // -------- 3. Logo & Document files checks --------
      // console.log(req.uploadedFiles)
      if (!req.uploadedFiles?.logo?.[0]?.url) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          message: "Organization logo upload failed or missing.",
        });
      }
      if (!req.uploadedFiles?.invoice?.[0]?.url) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          message: "Invoice document upload failed or missing.",
        });
      }
      if(!req.uploadedFiles?.receipt?.[0]?.url){
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          message: "Reciept document upload failed or missing.",
        });
      }
      if(!req.uploadedFiles?.document3?.[0]?.url){
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          message: "Document 3 upload failed or missing.",
        });
      }
      if(!req.uploadedFiles?.document4?.[0]?.url){
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          message: "Document 4 upload failed or missing.",
        });
      }
      const logo_url = req.uploadedFiles.logo[0].url;
      const invoice_url = req.uploadedFiles.invoice[0].url;
      const receipt_url = req.uploadedFiles.receipt[0].url;
      const document3 = req.uploadedFiles?.document3?.[0]?.url;
      const document4 = req.uploadedFiles?.document4?.[0]?.url;
      const roles = await Role.find({isDefault:true})
  
      // -------- 3. Organization creation --------
      const newOrg = await Organization.create([{
        name,
        email,
        status,
        logo_url,
        start_date,
        end_date,
        receipt_url,
        invoice_url,
        document3,
        document4,
        plan: plan._id,
        planName: plan.name,
        planId: generatePlanId(name, plan.name),
        roles:roles.map(role=>role._id)
      }], { session,ordered:true });
  
      const org = Array.isArray(newOrg) ? newOrg[0] : newOrg; 
      const password = name.toLowerCase().replace(/\s/g, "").slice(0, 6) + "@123";
      const user = await User.create([{
        name,
        email,
        password,
        organization_id: org._id,
        global_role_id: "68c67caae94bfd6484cd0d00",
      }], { session,ordered:true })
      await user.save({ session });
  
      await session.commitTransaction();
      await session.endSession();
      await logGlobalAdminActivity(req,"Add Organization","organization", `Organization added successfully ${org.name}`);
  
      return res.status(201).json({
        success: true,
        message: "Organization added successfully",
        data: org,
      });
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      // console.log(error)
      // Duplicate key error    
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An organization or user with these details already exists.",
          keyValue: error.keyValue,
        });
      }
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


const editOrganization = async (req, res) => {
  try {
    // 1. Validate request body presence for required fields
    const { name, email, status, logo_url, start_date, end_date, planId } = req.body;

    if (!name || !email || !status || !start_date || !end_date || !planId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 2. Handle uploaded files URLs if present
    let newLogoUrl, newInvoiceUrl, newReceiptUrl, newDocument3Url, newDocument4Url;
    if (req.uploadedFiles) {
      if (req.uploadedFiles.logo) newLogoUrl = req.uploadedFiles.logo[0].url;
      if (req.uploadedFiles.invoice) newInvoiceUrl = req.uploadedFiles.invoice[0].url;
      if (req.uploadedFiles.receipt) newReceiptUrl = req.uploadedFiles.receipt[0].url;
      if (req.uploadedFiles.document3) newDocument3Url = req.uploadedFiles.document3[0].url;
      if (req.uploadedFiles.document4) newDocument4Url = req.uploadedFiles.document4[0].url;
    }

    // 3. Validate plan existence
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // 4. Update organization document with fallback for logos and docs
    const updatedOrg = await Organization.findOneAndUpdate(
      { uuid: req.params.id },
      {
        name,
        email,
        status,
        logo_url: newLogoUrl || logo_url,
        start_date,
        end_date,
        invoice_url: newInvoiceUrl || req.body.invoice_url,
        receipt_url: newReceiptUrl || req.body.receipt_url,
        document3_url: newDocument3Url || req.body.document3_url,
        document4_url: newDocument4Url || req.body.document4_url,
        plan: plan._id,
        planName: plan.name,
        planId: generatePlanId(name, plan.name),
      },
      { new: true, runValidators: true }
    );

    // 5. Check if organization found & updated
    if (!updatedOrg) {
      return res.status(404).json({
        success: false,
        message: "Organization not found to update",
      });
    }

    // 6. Log admin activity asynchronously (no need to await blocking here)
    logGlobalAdminActivity(
      req,
      "Edit Organization",
      "organization",
      `Organization updated successfully ${updatedOrg.name}`
    ).catch(console.error);

    // 7. Send success response
    return res.status(200).json({
      success: true,
      message: "Organization updated successfully",
      data: updatedOrg,
    });
  } catch (error) {
    // 8. Handle duplicate key errors (e.g., unique constraint)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate record error",
        keyValue: error.keyValue,
      });
    }

    // 9. Validation errors from Mongoose or others
    if (error.name === "ValidationError") {
      let errors = {};
      for (field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // 10. Generic server error catch-all
    return res.status(500).json({
      success: false,
      message: "Failed to update organization",
      error: error.message || "Internal server error",
    });
  }
};


const deleteOrganization = async(req, res) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const deletedOrg = await Organization.findOneAndDelete({ uuid: req.params.id },{session})
        const deletedAdmin = await User.findOneAndDelete({email:deletedOrg.email},{session})
        await session.commitTransaction();
        await session.endSession();
        await logGlobalAdminActivity(req,"Delete Organization","organization",`Organization deleted successfully ${deletedOrg.name}`)
        return res.status(200).json({
            success: true,
            message: "Organization deleted successfully",
            data: deletedOrg
        })
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(500).json({
            success: false,
            message: "Failed to delete organization",
            error: error.message
        })
    }
}

const deleteOrganizations = async(req, res) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const deletedOrgs = await Organization.deleteMany({ uuid: { $in: req.body.ids } },{session})
        const deletedAdmins = await User.deleteMany({email:deletedOrgs.email},{session})
        await session.commitTransaction();
        await session.endSession();
        await logGlobalAdminActivity(req,"Delete Organizations","organization",`Organizations deleted successfully ${deletedOrgs.deletedCount}`)
        return res.status(200).json({
            success: true,
            message: "Organizations deleted successfully",
            data: deletedOrgs
        })
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(500).json({
            success: false,
            message: "Failed to delete organizations",
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
            filter.status  = status;
        }

        if (plan) {
            filter.plan = plan; // e.g., 'free', 'premium'
        }

        // Fetch filtered and paginated results
        const organizations = await Organization.find(filter)
            .skip(skip)
            .limit(limit);
        const total = await Organization.countDocuments(filter);
        // console.log("organizations",organizations)
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

const getOrganizationById = async(req,res)=>{
    try {
        const organization = await Organization.findOne({ uuid: req.params.id })
        // await logGlobalAdminActivity(req,"Get Organization","organization",`Organization fetched successfully ${organization.name}`)
        return res.status(200).json({
            success: true,
            message: "Organization fetched successfully",
            data: organization
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch organization",
            error: error.message
        })
    }
}
module.exports = {
    addOrganization,
    editOrganization,
    deleteOrganization,
    getOrganizations,
    getOrganizationById,
    deleteOrganizations
}