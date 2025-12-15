const mongoose = require("mongoose");
const ActivityLog = require("../models/activityLog_model");

/**
 * Log user activity to the database
 * @param {Object} options - Logging options
 * @param {string} options.userId - User ID who performed the action
 * @param {string} options.userRole - Role of the user (admin, manager, user, etc.)
 * @param {string} options.action - Action type ('add', 'edit', 'delete', 'view', 'login', 'logout')
 * @param {string} [options.details] - Description of what was done (optional, will be generated if not provided)
 * @param {string} [options.resourceType] - Type of resource (module, user, organization, etc.)
 * @param {string} [options.resourceName] - Name/title of the resource
 * @param {string} [options.resourceId] - ID of the resource
 * @param {Object} [options.req] - Express request object (for IP, user-agent, etc.)
 * @param {string} [options.status='success'] - Status of the action ('success' or 'failed')
 * @returns {Promise<Object>} - Created activity log entry
 */
const logActivity = async (options) => {
  try {
    const {
      userId,
      userRole,
      action,
      details,
      resourceType,
      resourceName,
      resourceId,
      req,
      status = 'success'
    } = options;

    // Validate required parameters
    if (!userId || !userRole || !action) {
      throw new Error('userId, userRole, and action are required parameters');
    }

    // Generate details if not provided
    let finalDetails = details;
    if (!finalDetails) {
      if (resourceName) {
        finalDetails = `${action.charAt(0).toUpperCase() + action.slice(1)}d ${resourceType || 'resource'}: ${resourceName}`;
      } else if (resourceId) {
        finalDetails = `${action.charAt(0).toUpperCase() + action.slice(1)}d ${resourceType || 'resource'} with ID: ${resourceId}`;
      } else {
        finalDetails = `${action.charAt(0).toUpperCase() + action.slice(1)}d ${resourceType || 'resource'}`;
      }
    }

    // Get IP address and user agent from request if available
    let ip = 'unknown';
    let userAgent = 'unknown';
    
    if (req) {
      ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
      userAgent = req.headers['user-agent'] || 'unknown';
    }

    // Create activity log entry using the updated model structure
    const activityLog = new ActivityLog({
      user: userId,
      userRole: userRole,
      action: action,
      details: finalDetails,
      ip: ip,
      userAgent: userAgent,
      status: status,
      Date: new Date()
    });

    // Save the activity log
    const savedLog = await activityLog.save();
    
    console.log(`Activity logged: ${action} by ${userRole} ${userId} - ${finalDetails}`);
    
    return savedLog;

  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

/**
 * Convenience function for creating resources
 * @param {string} userId - User ID
 * @param {string} userRole - Role of the user
 * @param {string} resourceType - Type of resource
 * @param {string} resourceName - Name of the resource
 * @param {Object} [req] - Express request object
 * @returns {Promise<Object>} - Created activity log entry
 */
const logCreation = async (userId, userRole, resourceType, resourceName, req) => {
  return logActivity({
    userId,
    userRole,
    action: 'add',
    resourceType,
    resourceName,
    req
  });
};

/**
 * Convenience function for updating resources
 * @param {string} userId - User ID
 * @param {string} userRole - Role of the user
 * @param {string} resourceType - Type of resource
 * @param {string} resourceName - Name of the resource
 * @param {string} [resourceId] - ID of the resource
 * @param {Object} [req] - Express request object
 * @returns {Promise<Object>} - Created activity log entry
 */
const logUpdate = async (userId, userRole, resourceType, resourceName, resourceId, req) => {
  return logActivity({
    userId,
    userRole,
    action: 'edit',
    resourceType,
    resourceName,
    resourceId,
    req
  });
};

/**
 * Convenience function for deleting resources
 * @param {string} userId - User ID
 * @param {string} userRole - Role of the user
 * @param {string} resourceType - Type of resource
 * @param {string} [resourceId] - ID of the resource
 * @param {Object} [req] - Express request object
 * @returns {Promise<Object>} - Created activity log entry
 */
const logDeletion = async (userId, userRole, resourceType, resourceId, req) => {
  return logActivity({
    userId,
    userRole,
    action: 'delete',
    resourceType,
    resourceId,
    req
  });
};

/**
 * Convenience function for login/logout
 * @param {string} userId - User ID
 * @param {string} userRole - Role of the user
 * @param {string} action - 'login' or 'logout'
 * @param {Object} [req] - Express request object
 * @param {string} [status='success'] - Status of the login attempt
 * @returns {Promise<Object>} - Created activity log entry
 */
const logAuth = async (userId, userRole, action, req, status = 'success') => {
  return logActivity({
    userId,
    userRole,
    action,
    details: `User ${action}${status === 'failed' ? ' failed' : ''}`,
    req,
    status
  });
};

module.exports = {
  logActivity,
  logCreation,
  logUpdate,
  logDeletion,
  logAuth
};
