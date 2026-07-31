import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api_response.js";
import { asynchandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userid);
        user.generateaccesstoken
    } catch (error) {
        
    }
}

const registeruser = asynchandler(async (req, res) => {
    const { email, username, password, role } = req.body
    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if (existedUser) {
        throw new ApiError(409, "user with email or username already exists", [])
    }
    const user = await User.create({
        email, 
        password, 
        username, 
        isemailverified: false
    })
    const { unhashedtoken, hashedtoken, tokenexpiry } = user.generatetemporarytoken()
})