const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true, // Fast lookup
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    global_role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalRoles", // Make sure your global roles model uses this name
      required: true,
    },
    last_login: {
      type: Date,
    },
  },
  { timestamps: true } // createdAt & updatedAt
);
userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}
const   User = mongoose.model("User", userSchema);

module.exports = User;
