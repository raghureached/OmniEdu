const mongoose = require("mongoose");
const ActivityLog = require("../models/organizationActivity_model");

const logActivity = async (req, res, next) => {
  // Only log non-GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Store original res.end to intercept response
  const originalEnd = res.end;
  let responseData = null;

  // Override res.end to capture response data
  res.end = function(chunk, encoding) {
    if (chunk) {
      responseData = chunk;
    }
    originalEnd.call(this, chunk, encoding);
  };

  // Continue to next middleware
  next();

  // Set up response listener to log after response is sent
  res.on('finish', async () => {
    try {
      // Skip logging if user is not authenticated
      if (!req.user || !req.user.id) {
        return;
      }

      // Determine action based on HTTP method and route
      let action = 'view';
      switch (req.method) {
        case 'POST':
          action = 'add';
          break;
        case 'PUT':
        case 'PATCH':
          action = 'edit';
          break;
        case 'DELETE':
          action = 'delete';
          break;
        default:
          action = 'view';
      }

      // Create details string based on route and method
      let details = '';
      const route = req.originalUrl || req.url;
      
      // Extract resource type from route
      const getResourceType = (route) => {
        const pathParts = route.split('/').filter(part => part);
        const lastPart = pathParts[pathParts.length - 1];
        const secondLastPart = pathParts[pathParts.length - 2];
        
        // Common resource mappings
        const resourceMap = {
          'users': 'user',
          'modules': 'module',
          'organizations': 'organization',
          'roles': 'role',
          'tickets': 'ticket',
          'surveys': 'survey',
          'courses': 'course',
          'lessons': 'lesson',
          'assignments': 'assignment',
          'admin': 'admin',
          'student': 'student',
          'teacher': 'teacher'
        };
        
        // Check if the route contains known resource types
        for (const [key, value] of Object.entries(resourceMap)) {
          if (route.includes(key)) {
            return value;
          }
        }
        
        return 'resource';
      };
      
      const resourceType = getResourceType(route);
      
      if (req.method === 'POST') {
        // Get resource name from request body if available
        let resourceName = '';
        if (req.body) {
          resourceName = req.body.name || req.body.title || req.body.moduleName || 
                        req.body.courseName || req.body.organizationName || 
                        req.body.userName || req.body.email || '';
        }
        
        if (resourceName) {
          details = `Created ${resourceType}: ${resourceName}`;
        } else {
          details = `Created new ${resourceType}`;
        }
      } else if (req.method === 'PUT' || req.method === 'PATCH') {
        // Get resource name from request body or params
        let resourceName = '';
        if (req.body) {
          resourceName = req.body.name || req.body.title || req.body.moduleName || 
                        req.body.courseName || req.body.organizationName || 
                        req.body.userName || req.body.email || '';
        }
        if (!resourceName && req.params && req.params.id) {
          resourceName = `ID: ${req.params.id}`;
        }
        
        if (resourceName) {
          details = `Updated ${resourceType}: ${resourceName}`;
        } else {
          details = `Updated ${resourceType}`;
        }
      } else if (req.method === 'DELETE') {
        // Get resource ID from params
        let resourceId = '';
        if (req.params && req.params.id) {
          resourceId = `ID: ${req.params.id}`;
        } else if (req.params && req.params.uuid) {
          resourceId = `UUID: ${req.params.uuid}`;
        }
        
        if (resourceId) {
          details = `Deleted ${resourceType} with ${resourceId}`;
        } else {
          details = `Deleted ${resourceType}`;
        }
      } else {
        details = `${req.method} request to ${route}`;
      }

      // Add additional context if available (but not for create/update/delete since we already have specific details)
      if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH' && req.method !== 'DELETE' && 
          req.body && Object.keys(req.body).length > 0) {
        // Remove sensitive data from body before logging
        const sanitizedBody = { ...req.body };
        delete sanitizedBody.password;
        delete sanitizedBody.token;
        delete sanitizedBody.secret;
        
        if (Object.keys(sanitizedBody).length > 0) {
          details += ` with data: ${JSON.stringify(sanitizedBody).substring(0, 200)}`;
        }
      }

      // Determine status based on response status code
      const status = res.statusCode >= 400 ? 'failed' : 'success';

      // Get IP address
      const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';

      // Get user agent
      const userAgent = req.headers['user-agent'] || 'unknown';

      // Create activity log entry
      const activityLog = new ActivityLog({
        admin: req.user.id,
        action: action,
        details: details,
        ip: ip,
        userAgent: userAgent,
        status: status,
        timeStamp: new Date()
      });

      // Save the activity log
      await activityLog.save();

      console.log(`Activity logged: ${action} by user ${req.user.id} at ${route}`);

    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to avoid affecting the main request flow
    }
  });
};

module.exports = logActivity;
