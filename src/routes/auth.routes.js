import { Router } from "express";
import { registeruser, login, logoutUser, verifyEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, getCurrUser, changeCurrentPassword, resendEmailVerification} from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validator.middlewares.js"
import { userRegiserValidator, userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidtor, userChangeCurrentPasswordValidator } from "../validators/index.js"; 

const router = Router();

import { verifyJWT } from "../middlewares/auth.middleware.js";

// unsecured routes
router.route("/register").post(userRegiserValidator(), validate, registeruser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/verify_email:verificationToken").get(verifyEmail);
router.route("/refresh_token").post(refreshAccessToken);
router.route("/forgot_password").post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset_password/:resetToken").post(userResetForgotPasswordValidtor(), validate, resetForgotPassword);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current_user").post(verifyJWT, getCurrUser);
router.route("/change_password").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/resend_email_verification").post(verifyJWT, resendEmailVerification)

export default router;