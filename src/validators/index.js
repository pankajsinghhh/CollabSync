import { body } from "express-validator"

const userRegiserValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLowercase()
            .withMessage("username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage("username must be atleast 3 characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
        body("fullname")
            .optional()
            .trim()
    ];
};
const userLoginValidator = () => {
    return [
        body("emial")
            .optional()
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("password is required")
    ]
}
export {
    userRegiserValidator,
    userLoginValidator
}