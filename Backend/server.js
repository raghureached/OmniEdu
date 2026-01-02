require("dotenv").config();
const express = require("express");
require("./src/config/mongoDBConfig");
const logger = require("./src/utils/logger");
const helmetMiddleware = require("./src/config/helmetConfig");
const corsMiddleware = require("./src/config/corsConfig");
const passport = require('./src/config/passport');
const session = require('express-session');
const app = express(); //intializing the express
const PORT = process.env.PORT || 5003;
const globalAdminRouter = require("./src/routes/globalAdmin.routes");
const authRouter = require("./src/routes/auth.routes");
const adminRouter = require("./src/routes/admin.routes");
const devRouter = require("./src/routes/dev.routes");
const userRouter = require("./src/routes/user.routes");
const cookieParser = require("cookie-parser");
const { authenticate, authorize } = require("./src/middleware/auth_middleware");
const activityLogRouter = require("./src/routes/globalAdmin.activityLogs.routes");
const startSubscriptionUpdater = require("./src/utils/updateSubscriptions");

// connectDB
startSubscriptionUpdater()

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(helmetMiddleware); //before passing to the routes, securing the SITE using helmet
app.use(corsMiddleware) //cors config...
app.use(express.static('uploads'));
app.use(express.json({ limit: "200mb" })); //to parse the json data upto 200mb(because at client meeting , client said upto 200mb)
app.use(express.urlencoded({ extended: true, limit: "200mb" })); //same here as json
app.use(cookieParser());
app.use((req, res, next) => {
  logger.info(`Received Method:${req.method} request to ${req.url}`);
  logger.info(`Request Body -${JSON.stringify(req.body)}`);
  next();
});
const path = require('path');
const { sendMail } = require("./src/utils/Emailer");
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/globalAdmin',authenticate,authorize(['GlobalAdmin']),globalAdminRouter)
app.use('/auth',authRouter)
app.use('/api/admin',authenticate,authorize(['Administrator']),adminRouter)
app.use('/dev',devRouter)
app.use('/api/user',authenticate,userRouter)
app.post('/api/sendOtp', require('./src/controllers/OTP').sendOTP)
app.post('/api/verifyOtp', require('./src/controllers/OTP').verifyOTP)
app.get('/api/getPermissions', authenticate,require('./src/controllers/permissions.controller').getPermissions)
app.use('/api/activity',authenticate,activityLogRouter)

app.get('/testMail',async(req,res)=>{await sendMail("raghu071003@gmail.com","Test Mail","This is a test mail")})
app.listen(PORT, () => {
  console.log(`Server is running at PORT:${PORT}`);
});
