import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api_response.js";
import { asynchandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error.js";
import { emailverificationmailgencontent, fogotpassowordmailgencontent, sendemail } from "../utils/mail.js";
import jwt from "jsonwebtoken"

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
            "user registered successfully and verification email has been sent on your email"),
    );
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

const getCurrUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(
        new ApiResponse(200,
            req.user,
            "Current user fetched successfully"
        ));
});

const verifyEmail = asynchandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Emailverificationtoken is missing");
    }
    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")
    
    const user = await User.findOne({
        emailverificationtoken: hashedToken,
        emailverificationexpiry: {$gt: Date.now()}
    })
    if (!user) {
        throw new ApiError(400, "Token is invalid or expired");
    }
    user.emailverificationtoken = undefined;
    user.emailverificationexpiry = undefined;

    user.isemailverified = true
    await user.save({ validateBeforeSave: false })
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, 
                { isemailverified: true },
                "Email is verified"
            )
        )
});

const resendEmailVerification = asynchandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User doesnot exist");
    }
    if (user.isemailverified) {
        throw new ApiError(409, "Email is already verified");
    }
    const { unhashedtoken, hashedtoken, tokenexpiry } =
        user.generatetemporarytoken();

    user.emailverificationtoken = hashedtoken;
    user.emailverificationexpiry = tokenexpiry;

    await user.save({ validateBeforeSave: false });

    await sendemail({
        email: user?.email,
        subject: "please verify your email",
        mailgenContent: emailverificationmailgencontent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedtoken}`,
        ),
    });
    return res
        .status(200)
        .json(
            200,
            {},
            "Mail has been sent to your email ID"
        )
});

const refreshAccessToken = asynchandler(async (req, res) => {
    const incomingRefreshToken = req.body.refreshToken || req.cookie.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        if (incomingRefreshToken !== user?.refreshtoken) {
            throw new ApiError(401, "Expired Refresh Token");
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accesToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        user.refreshtoken = newRefreshToken
        await user.save()
        return res
            .status(200)
            .cookie("acesstoken", accesToken, options)
            .cookie("refreshtoken", newRefreshToken, options)
            .json(
                200,
                { accesToken, refreshToken: newRefreshToken },
                "Access Token Refreshed"
            )
    }
    catch (error) {
        throw new ApiError(401, "Invalid Refresh Token");
    }
});

const forgotPasswordRequest = asynchandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "user doesnot Exists");
    }
    const { unhashedtoken, hashedtoken, tokenexpiry } = user.generatetemporarytoken()
    
    user.forgotpasswordtoken = hashedtoken
    user.forgotpasswordexpiry = tokenexpiry
    await user.save({ validateBeforeSave: false });
    await sendemail({
        email: user?.email,
        subject: "password reset request",
        mailgenContent: fogotpassowordmailgencontent(
            user.username,
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedtoken}`,
        ),
    });
    return res
        .status(200)
        .json(200,
            {},
            "password reset mail has been sent to your mail id"
        )
});

const resetForgotPassword = asynchandler(async (req, res) => {
    const { resetToken } = req.params
    const { newPassword } = req.body
    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")
    
    const user = await User.findOne({
        forgotpasswordtoken: hashedToken,
        forgotpasswordexpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired")
    }

    user.forgotpasswordtoken = undefined
    user.forgotpasswordexpiry = undefined
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "password reset successfully"
            )
        )
});

const changeCurrentPassword = asynchandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id);
    const isPasswordValid = await user.ispasswordcorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    } 

    user.password = newPassword
    await user.save({ validateBeforeSave: false });
    return res  
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "password changes successfully"
            )
        )
});

export {
    registeruser,
    login,
    logoutUser,
    getCurrUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    changeCurrentPassword,
    resetForgotPassword,
    forgotPasswordRequest
};