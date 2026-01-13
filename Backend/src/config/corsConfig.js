const cors = require("cors");

//------------After some time we will procced with this
// const allowedOrigins = ['https://site1.com', 'https://site2.com'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// };

const allowedOrigins = ['http://localhost:3000', 'https://omniedu-fe587.web.app'];

const corsMiddleware = cors({
  origin: allowedOrigins, // allowed origins or using "*" for all sites || whitelisted sites
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, 
});

module.exports = corsMiddleware;
