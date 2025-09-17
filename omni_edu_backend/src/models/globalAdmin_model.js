const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const globalAdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    uuid:{
        type:String,
        default:uuidv4,
        unique:true,
        index:true
    },
    last_login:{
        type:Date
    }
},{timestamps:true});
globalAdminSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})

globalAdminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const GlobalAdmin = mongoose.model("GlobalAdmin", globalAdminSchema);


module.exports = GlobalAdmin