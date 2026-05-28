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
export {userRegisterValidator,userLoginValidator};