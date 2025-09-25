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

const Origin = process.env.prod === "true" ? process.env.ORIGIN : "http://localhost:3000";

const corsMiddleware = cors({
  origin: Origin, // allowed origins or using "*" for all sites || whitelisted sites
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if you use cookies or tokens
});

module.exports = corsMiddleware;
