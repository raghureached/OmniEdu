const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users_model');
const GlobalAdmin = require('../models/globalAdmin_model');
const GlobalRoles = require('../models/globalRoles_model');
const UserProfile = require('../models/userProfiles_model');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Try to find as regular user first
    let user = await User.findById(id);
    if (user) {
      const userProfile = await UserProfile.findOne({ user_id: user._id });
      return done(null, { ...user.toObject(), profile: userProfile, role: 'User' });
    }
    
    // Try to find as GlobalAdmin
    const admin = await GlobalAdmin.findById(id);
    if (admin) {
      return done(null, { ...admin.toObject(), role: 'GlobalAdmin' });
    }
    
    done(null, false);
  } catch (error) {
    done(error, false);
  }
});

// Only initialize Google Strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      
      // Check if user exists as GlobalAdmin
      let admin = await GlobalAdmin.findOne({ email });
      if (admin) {
        return done(null, admin);
      }
      
      // Check if user exists as regular user
      let user = await User.findOne({ email });
      if (user) {
        // Update last login
        user.last_login = new Date();
        await user.save();
        return done(null, user);
      }
      
      // For new users, you might want to handle registration differently
      // For now, we'll return an error indicating user doesn't exist
      return done(new Error('No account found with this email. Please contact your administrator.'), null);
      
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth credentials not found. Google SSO will not be available.');
}

module.exports = passport;
