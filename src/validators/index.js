import {body} from "express-validator"

const userRegisterValidator=()=>{
    return[
        body("email")
        .trim()
        .notEmpty()
        .withMessage("e-mail Field is Empty.Please fill it")
        .isEmail()
        .withMessage("Not a valid e-mail @"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username Field is Empty.Please fill it")
        .isLength({min:3})
        .withMessage("Username must be atleast 3 characters long"),
        body("password")
        .trim()
        .notEmpty()
        .withMessage("Password Field is Empty.Please fill it"),
        body("Fullname")
        .optional().trim()


    ]
}

const userLoginValidator=()=>
{
    return[
        body("email").optional().isEmail().withMessage("Email is valid"),
        body("password").notEmpty().withMessage("Password is required")
    ]
}

const userchangecurrentpasswordvalidator=()=>
{
    return [
        body("oldpassword").notEmpty().withMessage("Old password is required"),
        body("newpassword").notEmpty().withMessage("New password is required")
    ]
}

const userforgotpasswordvalidator=()=>{
    return[
        body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail().withMessage("Email is invalid")

    ]
}

const userresetforgotpasswordvalidator=()=>{
        return[body("newpassword").notEmpty().withMessage("Password is required")]
}

const crreateprojectvalidator=()=>{
    return [
        body("name").notEmpty().withMessage("Name is required"),
        body("description").optional()
    ]
}
import { AvailableUserRole } from "../utils/constants.js"
const addmemberstoprojectvalidator()=>
{
    return [
        body("email").trim().notEmpty().withMessage("Email field cannot be empty").isEmail().withMessage("Invalid Email @"),
        body("role").notEmpty().withMessage("Role is required").isIn(AvailableUserRole).withMessage("Role is INVALID")
    ]
}
export {userRegisterValidator,userLoginValidator,userchangecurrentpasswordvalidator,userforgotpasswordvalidator,userresetforgotpasswordvalidator,crreateprojectvalidator,addmemberstoprojectvalidator};