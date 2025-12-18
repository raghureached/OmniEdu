const { options } = require("../config/constants");
const GlobalAdmin = require("../models/globalAdmin_model");
const GlobalRoles = require("../models/globalRoles_model");
const UserProfile = require("../models/userProfiles_model");
const User = require("../models/users_model");
const jwt = require("jsonwebtoken");
const passport = require('passport');

const canonicalRole = (role) => {
    const r = String(role || '').toLowerCase().replace(/[^a-z]/g, '');
    if (r === 'globaladmin') return 'GlobalAdmin';
    if (r === 'administrator' || r === 'admin') return 'Administrator';
    if (r === 'user' || r === 'learner') return 'User';
    return role || null;
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                isSuccess: false,
                message: "Email and password are required"
            })
        }
        const globalAdmin = await GlobalAdmin.findOne({ email })
        if (globalAdmin) {
            return handleLogin(globalAdmin, password, "GlobalAdmin", res)
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({
                isSuccess: false,
                message: "Invalid email or password"
            })
        }
        let roleDoc = null;
        try {
            if (user.global_role_id) {
                roleDoc = await GlobalRoles.findById(user.global_role_id).select("name");
            }
        } catch (_) { }
        const resolvedRole = canonicalRole(roleDoc?.name) || 'User';
        return handleLogin(user, password, resolvedRole, res)
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to login",
            error: error.message
        })
    }
}

const logout = async (req, res) => {
    try {
        const userId = req.user._id;
        if (req.user.role === "GlobalAdmin") {
            const globalAdmin = await GlobalAdmin.findById(userId)
            globalAdmin.refreshToken = undefined;
            await globalAdmin.save();
            res.clearCookie("refreshToken");
            res.clearCookie("accessToken");
            return res.status(200).json({
                isSuccess: true,
                message: "Logout successful"
            })
        }
        const user = await User.findById(userId)
        user.refreshToken = undefined;
        await user.save();
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        return res.status(200).json({
            isSuccess: true,
            message: "Logout successful"
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to logout",
            error: error.message
        })
    }
}

const generateTokens = async (userId, role, organization_id) => {
    const canon = canonicalRole(role);
    if (canon !== "GlobalAdmin") {
        const accessToken = jwt.sign({ _id: userId, role: canon, organization_id: organization_id }, process.env.ACCESS_TOKEN_SECRET)
        const refreshToken = jwt.sign({ _id: userId, role: canon, organization_id: organization_id }, process.env.REFRESH_TOKEN_SECRET)
        return { accessToken, refreshToken }
    }
    const accessToken = jwt.sign({ _id: userId, role: canon }, process.env.ACCESS_TOKEN_SECRET)
    const refreshToken = jwt.sign({ _id: userId, role: canon }, process.env.REFRESH_TOKEN_SECRET)
    return { accessToken, refreshToken }
}

const handleLogin = async (entity, password, role, res) => {
    if (!entity) {
        return res.status(401).json({
            isSuccess: false,
            message: "Invalid email or password",
        });
    }

    const isPasswordValid = await entity.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            isSuccess: false,
            message: "Invalid email or password",
        });
    }
    entity.last_login = new Date();
    await entity.save();
    entity.password = undefined;
    const canonRole = canonicalRole(role);
    let userProfile;
    if (canonRole !== "GlobalAdmin") {
        userProfile = await UserProfile.findOne({ user_id: entity._id });
        // const { accessToken, refreshToken } = await generateTokens(entity._id, canonRole, userProfile.organization_id);
        const { accessToken, refreshToken } = await generateTokens(entity._id, canonRole, entity.organization_id);

        res.cookie("refreshToken", refreshToken, options);
        res.cookie("accessToken", accessToken, options);
    } else {
        const { accessToken, refreshToken } = await generateTokens(entity._id, canonRole);
        res.cookie("refreshToken", refreshToken, options);
        res.cookie("accessToken", accessToken, options);
    }
    return res.status(200).json({
        isSuccess: true,
        message: "Login successful",
        data: entity,
        role: canonRole,
        organization_id: userProfile?.organization_id
    });
};

const checkAuth = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = canonicalRole(req.user.role);
        let userProfile;
        if (role === "GlobalAdmin") {
            const globalAdmin = await GlobalAdmin.findById(userId)
            return res.status(200).json({
                isSuccess: true,
                message: "User authenticated successfully",
                data: globalAdmin,
                role
            })
        }
        const user = await User.findById(userId)
        const globalRole = await GlobalRoles.findById(user.global_role_id).select("name");
        userProfile = await UserProfile.findOne({ user_id: user._id });
        return res.status(200).json({
            isSuccess: true,
            message: "User authenticated successfully",
            data: user,
            role: canonicalRole(globalRole?.name),
            organization_id: userProfile?.organization_id
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to authenticate user",
            error: error.message
        })
    }
}

const changePassword = async (req, res) => {
    try {
        const { newPassword, email } = req.body;
        let user;
       
        const globalAdmin = await GlobalAdmin.findOne({ email: email });
        if (globalAdmin) {
            user = globalAdmin;
        } else {
            user = await User.findOne({ email: email });
        }

        if (!user) {
            return res.status(404).json({
                isSuccess: false,
                message: "User not found"
            });
        }
        user.password = newPassword;
        await user.save();
        return res.status(200).json({
            isSuccess: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to change password",
            error: error.message
        })
    }
};

const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleAuthCallback = async (req, res) => {
    passport.authenticate('google', async (err, user) => {
        try {
            if (err) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}`);
            }
            
            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
            }

            // Determine user role and generate tokens
            let role = 'User';
            let organization_id = null;
            
            if (user.role === 'GlobalAdmin') {
                role = 'GlobalAdmin';
            } else {
                // Get user profile for organization info
                const userDoc = await User.findOne({ _id: user._id });
                if (userDoc) {
                    organization_id = userDoc.organization_id;
                }
                
                // Get role from GlobalRoles if available
                if (user.global_role_id) {
                    const roleDoc = await GlobalRoles.findById(user.global_role_id).select("name");
                    role = canonicalRole(roleDoc?.name) || 'User';
                }
            }

            // Generate JWT tokens
            const { accessToken, refreshToken } = await generateTokens(user._id, role, organization_id);

            // Set cookies
            res.cookie("refreshToken", refreshToken, options);
            res.cookie("accessToken", accessToken, options);

            // Redirect based on role
            let redirectUrl = '/user/dashboard';
            if (role === 'GlobalAdmin') {
                redirectUrl = '/global-admin/organizations';
            } else if (role === 'Administrator') {
                redirectUrl = '/admin';
            }
            return res.redirect(`${process.env.FRONTEND_URL}${redirectUrl}`);
            
        } catch (error) {
            console.error('Google auth callback error:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
        }
    })(req, res);
};

module.exports = {
    login,
    logout,
    changePassword,
    checkAuth,
    googleAuth,
    googleAuthCallback
}