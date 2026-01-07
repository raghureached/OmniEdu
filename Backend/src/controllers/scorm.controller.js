const ScormService = require("../services/scorm.service");
const { SUCCESS } = require("../utils/scorm.constants");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs");
const ScormModule = require("../models/scorm/scormModule");
const { parseManifest } = require("../utils/scormParser");
const mongoose = require("mongoose");
const ForUserAssignment = require("../models/forUserAssigments_model");
const UserContentProgress = require("../models/userContentProgress_model");

// Helper function to handle file operations
const handleFileUpload = async (file, extractPath) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const zip = new AdmZip(file.path);
  fs.mkdirSync(extractPath, { recursive: true });
  zip.extractAllTo(extractPath, true);

  const manifestPath = path.join(extractPath, "imsmanifest.xml");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Invalid SCORM package (manifest missing)");
  }

  return parseManifest(manifestPath);
};

// Helper function to inject SCORM API
const injectScormApi = (entryFilePath, registrationId) => {
  const apiScript = `
  <script>
  (function () {
    const rid = "${registrationId}";
    window.API = {
      LMSInitialize: function () {
        fetch("/api/scorm/initialize", { method: "POST" });
        return "true";
      },
      LMSGetValue: function (key) {
        return fetch("/api/scorm/value?registrationId=" + rid + "&key=" + key)
          .then(r => r.json())
          .then(d => d.value || "");
      },
      LMSSetValue: function (key, value) {
        fetch("/api/scorm/value", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId: rid, key, value })
        });
        return "true";
      },
      LMSCommit: function () {
        fetch("/api/scorm/commit", { method: "POST" });
        return "true";
      },
      LMSFinish: function () {
        fetch("/api/scorm/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationId: rid })
        });
        return "true";
      }
    };
  })();
  </script>
  </head>`;

  let html = fs.readFileSync(entryFilePath, "utf-8");
  html = html.replace("</head>", apiScript);
  fs.writeFileSync(entryFilePath, html);
};

/**
 * ADMIN: Upload SCORM ZIP → Create Module
 */
exports.uploadScorm = async (req, res) => {
  try {
    const {
      title,
      description = "",
      tags = [],
      team = null,
      subteam = null,
      category = null,
      credits = 2,
      prerequisites = [],
      learningOutcomes = [],
      status = "Draft"
    } = req.body;

    const moduleFolder = `scorm_${Date.now()}`;
    const extractPath = path.join("scorm_content", moduleFolder);

    // Process the uploaded SCORM package
    const { entryPoint } = await handleFileUpload(req.file, extractPath);
    
    // Inject SCORM API into the entry point file
    const entryFilePath = path.join(extractPath, entryPoint);
    const registrationId = new mongoose.Types.ObjectId();
    injectScormApi(entryFilePath, registrationId);

    // Create the module with all fields
    const module = await ScormModule.create({
      title,
      description,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      team: team || null,
      subteam: subteam || null,
      organization_id: req.user?.organization_id || null,
      category,
      credits: parseInt(credits) || 2,
      prerequisites: Array.isArray(prerequisites) ? 
        prerequisites : 
        prerequisites.split(',').map(p => p.trim()),
      learning_outcomes: Array.isArray(learningOutcomes) ? 
        learningOutcomes : 
        learningOutcomes.split('\n').filter(lo => lo.trim() !== ''),
      status,
      entryPoint,
      scormPath: extractPath,
      createdBy: req.user._id,
      created_by: req.user._id,
      global: false
    });

    res.json({
      success: true,
      module
    });

  } catch (error) {
    console.error("SCORM upload error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to upload SCORM package" 
    });
  }
};

/**
 * Get all SCORM modules with optional filtering
 */
exports.getScormModules = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      team, 
      subteam, 
      category,
      page = 1,
      limit = 10
    } = req.query;

    const query = { global: false, organization_id: req.user?.organization_id };

    if (status) query.status = status;
    if (team) query.team = team;
    if (subteam) query.subteam = subteam;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [modules, total] = await Promise.all([
      ScormModule.find(query)
        .populate('team', 'name')
        .populate('subteam', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ScormModule.countDocuments(query)
    ]);

    res.json({
      success: true,
      modules,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching SCORM modules:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch SCORM modules" 
    });
  }
};

/**
 * Get a single SCORM module by ID
 */
exports.getScormModule = async (req, res) => {
  try {
    const module = await ScormModule.findOne({ _id: req.params.id, global: false, organization_id: req.user?.organization_id })
      .populate('team', 'name')
      .populate('subteam', 'name')
      .populate('createdBy', 'name email');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "SCORM module not found"
      });
    }

    res.json({
      success: true,
      module
    });

  } catch (error) {
    console.error("Error fetching SCORM module:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch SCORM module" 
    });
  }
};

/**
 * Update a SCORM module
 */
exports.updateScormModule = async (req, res) => {
  try {
    const {
      title,
      description,
      tags,
      team,
      subteam,
      category,
      credits,
      prerequisites,
      learningOutcomes,
      status
    } = req.body;

    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(tags !== undefined && { 
        tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()) 
      }),
      ...(team !== undefined && { team: team || null }),
      ...(subteam !== undefined && { subteam: subteam || null }),
      ...(category !== undefined && { category }),
      ...(credits !== undefined && { credits: parseInt(credits) || 2 }),
      ...(prerequisites !== undefined && { 
        prerequisites: Array.isArray(prerequisites) ? 
          prerequisites : 
          prerequisites.split(',').map(p => p.trim()) 
      }),
      ...(learningOutcomes !== undefined && {
        learning_outcomes: Array.isArray(learningOutcomes) ? 
          learningOutcomes : 
          learningOutcomes.split('\n').filter(lo => lo.trim() !== '')
      }),
      ...(status && { status })
    };

    const updatedModule = await ScormModule.findOneAndUpdate(
      { _id: req.params.id, global: false, organization_id: req.user?.organization_id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedModule) {
      return res.status(404).json({
        success: false,
        message: "SCORM module not found"
      });
    }

    res.json({
      success: true,
      module: updatedModule
    });

  } catch (error) {
    console.error("Error updating SCORM module:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update SCORM module" 
    });
  }
};

/**
 * Delete a SCORM module
 */
exports.deleteScormModule = async (req, res) => {
  try {
    const module = await ScormModule.findOneAndDelete({ _id: req.params.id, global: false, organization_id: req.user?.organization_id });
    const deletedAssignments = await ForUserAssignment.deleteMany({contentId:module._id})
    await UserContentProgress.deleteMany({assignment_id:deletedAssignments._id})

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "SCORM module not found"
      });
    }

    // Delete the associated files
    if (module.scormPath && fs.existsSync(module.scormPath)) {
      fs.rmSync(module.scormPath, { recursive: true, force: true });
    }

    res.json({
      success: true,
      message: "SCORM module deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting SCORM module:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete SCORM module" 
    });
  }
};

// The rest of your existing SCORM runtime methods (initialize, getValue, setValue, commit, finish) 
// can remain the same as they don't directly interact with the ScormModule model
/**
 * USER: Launch SCORM Course
 */

exports.launch = async (req, res) => {
  try {
    const { moduleId } = req.body;
    const userId = req.user._id;

    const module = await ScormModule.findOne({ _id: moduleId, global: false, organization_id: req.user?.organization_id });
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const registration = await ScormService.createRegistration(
      userId,
      moduleId
    );

    // IMPORTANT FIX
    const folderName = path.basename(module.scormPath);

    const launchUrl = `/scorm_content/${folderName}/${module.entryPoint}?rid=${registration._id}`;

    res.json({
      success: true,
      launchUrl
    });

  } catch (err) {
    console.error("Launch error:", err);
    res.status(500).json({ message: "Launch failed" });
  }
};


/**
 * SCORM Runtime
 */
exports.initialize = async (req, res) => {
  res.json({ success: true, errorCode: SUCCESS });
};

exports.getValue = async (req, res) => {
  const { registrationId, key } = req.query;

  const value = await ScormService.getCmiValue(registrationId, key);
  res.json({ value: value || "", errorCode: SUCCESS });
};

exports.setValue = async (req, res) => {
  const { registrationId, key, value } = req.body;

  await ScormService.setCmiValue(registrationId, key, value);
  res.json({ success: true, errorCode: SUCCESS });
};

exports.commit = async (req, res) => {
  res.json({ success: true, errorCode: SUCCESS });
};

exports.finish = async (req, res) => {
  const { registrationId } = req.body;

  await ScormService.finishRegistration(registrationId);
  res.json({ success: true, errorCode: SUCCESS });
};

exports.getScormModules = async (req, res) => {
  try {
    const modules = await ScormModule.find().sort({ createdAt: -1 });
    res.json({ success: true, modules });
  } catch (error) {
    console.error("Error fetching SCORM modules:", error);
    res.status(500).json({ message: "Failed to fetch SCORM modules" });
  }
};