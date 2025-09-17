// ====== helpers/auth.helper.js ======
const { options } = require("../config/constants");

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
  
    const { accessToken, refreshToken } = await generateTokens(entity._id, role);
  
    // attach cookies for refresh and access tokens
    res.cookie("refreshToken", refreshToken, options);
    res.cookie("accessToken", accessToken, options);
  
    return res.status(200).json({
      isSuccess: true,
      message: "Login successful",
      data: entity,
      role,
    });
  };
  const generateTokens = async (userId,role) => {
    const accessToken = jwt.sign({_id:userId,role:role},process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"15m"
    })
    const refreshToken = jwt.sign({_id:userId,role:role},process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d"
    })
    return {accessToken,refreshToken}
}
  export default handleLogin;
  