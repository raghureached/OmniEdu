require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/mongoDBConfig");
const logger = require("./src/utils/logger");
const helmetMiddleware = require("./src/config/helmetConfig");
const corsMiddleware = require("./src/config/corsConfig");
const app = express(); //intializing the express
const PORT = process.env.PORT || 5003;
const globalAdminRouter = require("./src/routes/globalAdmin.routes");
const authRouter = require("./src/routes/auth.routes");
const adminRouter = require("./src/routes/admin.routes");
const devRouter = require("./src/routes/dev.routes");
const userRouter = require("./src/routes/user.routes");
const cookieParser = require("cookie-parser");
const { authenticate, authorize } = require("./src/middleware/auth_middleware");
//MONGODB connection
connectDB;

app.use(helmetMiddleware); //before passing to the routes, securing the SITE using helmet
app.use(corsMiddleware) //cors config...
app.use(express.static('uploads'));

app.use(express.json({ limit: "200mb" })); //to parse the json data upto 200mb(because at client meeting , client said upto 200mb)
app.use(express.urlencoded({ extended: true, limit: "200mb" })); //same here as json
app.use(cookieParser())
app.use((req, res, next) => {
  //to track whats coming || method || url
  logger.info(`Received Method:${req.method} request to ${req.url}`);
  logger.info(`Request Body -${JSON.stringify(req.body)}`);
  next(); //to pass into next function
});
// app.use(logActivity)

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/globalAdmin',authenticate,authorize(['GlobalAdmin']),globalAdminRouter)
// app.use('/api/globalAdmin',globalAdminRouter)
app.use('/auth',authRouter)
app.use('/api/admin',authenticate,authorize(['Administrator']),adminRouter)
// app.use('/api/admin',adminRouter)
app.use('/dev',devRouter)
// app.use('/api/user',authenticate,authorize(['User']),userRouter)
app.use('/api/user',authenticate,userRouter)
app.listen(PORT, () => {
  console.log(`Server is running at PORT:${PORT}`);
});
