const helmet = require("helmet");

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      //Stops hackers from injecting malicious scripts
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted.cdn.com"],  //our frontend sites...
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: "no-referrer" }, //Keeps our (backend routes) URLs and data private
  frameguard: { action: "deny" }, //-->Prevents clickjacking scams
  hsts: {
    //only https connection to make secure...
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  crossOriginEmbedderPolicy: false, // Optional, depending on your frontend needs
  // Allow frontend on a different origin (e.g., http://localhost:3000) to embed images/audio/video/PDFs
  // from this backend (http://localhost:5003). This prevents Chrome's NotSameOrigin blocking.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

module.exports = helmetMiddleware;
