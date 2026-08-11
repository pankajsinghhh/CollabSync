import { ApiError } from "../utils/api_error";
import { User } from "../models/user.models";
import { asynchandler } from "../utils/async_handler";
import jwt from "jsonwebtoken"

export const verifyJWT = asynchandler(async (req, res, next) => {
    const token = req.cookiers?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded_Token?._id).select(
          "-password -emailverificationtoken -refreshtoken -emailverificationexpiry",
        );
        if (!user) {
          throw new ApiError(401, "Invalid access token");
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
})