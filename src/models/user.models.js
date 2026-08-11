import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
const userSchema = new Schema({
  avatar: {
    type: {
      url: String,
      localpath: String,
    },
    default: {
      url: "https://placehold.co/400x400",
      localpath: "",
    },
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, 
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    isemailverified: {
        type: Boolean,
        default: false
    },
    refreshtoken: {
        type: String
    },
    forgotpasswordtoken: {
        type: String
    },
    forgotpasswordexpiry: {
        type: Date
    },
    emailverificationtoken: {
        type: String
    },
    emailverificationexpiry: {
        type: Date
    }
}, {
    timestamps: true,
}
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.ispasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
};

userSchema.methods.generateaccesstoken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
};

userSchema.methods.generaterefreshtoken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
};

userSchema.methods.generatetemporarytoken = function () {
    const unhashedtoken = crypto.randomBytes(20).toString("hex");
    const hashedtoken = crypto.createHash("sha256").update(unhashedtoken).digest("hex")
    const tokenexpiry = Date.now() + (20 * 60 * 1000)
    return { unhashedtoken, hashedtoken, tokenexpiry }
};

export const User = mongoose.model("User",userSchema)