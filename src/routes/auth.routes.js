import { Router } from "express";
import { registeruser, login, logoutUser} from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validator.middlewares.js"
import { userRegiserValidator, userLoginValidator } from "../validators/index.js"; 

const router = Router();

import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/register").post(userRegiserValidator(), validate, registeruser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;