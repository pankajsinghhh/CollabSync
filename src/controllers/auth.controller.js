import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api_response.js";
import { asynchandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error.js";
import { emailverificationmailgencontent, sendemail } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const acessToken = user.generateaccesstoken();
        const refreshToken = user.generaterefreshtoken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accesToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating token")
    }
}

const registeruser = asynchandler(async (req, res) => {
    const { email, username, password, role } = req.body
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
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

    user.emailverificationtoken = hashedtoken;
    user.emailverificationexpiry = tokenexpiry;

    await user.save({ validateBeforeSave: false })
    
    await sendemail({
        email: user?.email,
        subject: "please verify your email",
        mailgenContent: emailverificationmailgencontent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedtoken}`
        )
    });
    const createdUser = await User.findById(user._id).select(
        "-password -emailverificationtoken -refreshtoken -emailverificationexpiry"
    )
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, { user: createdUser },
            "user registered successfully and verification email has been sent on your email")
    )
});

const login = asynchandler(async (req, res) => {
    const { email, password, username } = req.body
    if (!email) {
        throw new ApiError(400, "EMAIL is required")
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(400, "user doesnot exists");
    }
    const isPasswordValid = user.ispasswordcorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -emailverificationtoken -refreshtoken -emailverificationexpiry",
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "user logged in successfully")
        )
});

const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: ""
            }
        },
        {
            new: true,
        },
    );
    const options = {
        httpOnly: true, 
        secure: true,
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out")
        );
});
export { registeruser, login, logoutUser};