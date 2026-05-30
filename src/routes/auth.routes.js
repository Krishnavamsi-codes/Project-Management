import Router from "express"
import {changeCurrentPassword, forgetPasswordRequest, getCurrentuser, loginuser, logoutuser, refreshAccessToken, registeruser, resendemailverification, verifyemail, resetForgotPassword} from "../controllers/auth.controllers.js"
const router=Router()
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validator.middleware.js"
import {userRegisterValidator,userLoginValidator, userforgotpasswordvalidator, userresetforgotpasswordvalidator, userchangecurrentpasswordvalidator} from "../validators/index.js"



// functionName    → pass function itself (Express will call it later)

// functionName()  → execute function immediately and pass its returned value


//unsecured route
router.route("/register").post(userRegisterValidator(),validate,registeruser)
router.route("/login").post(userLoginValidator(),validate,loginuser)

router.route("/verify-email/:verificationtoken").get(verifyemail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(userforgotpasswordvalidator(),validate,forgetPasswordRequest)
router.route("/reset-password/:resettoken").post(userresetforgotpasswordvalidator(),validate,resetForgotPassword)

//secure routes
router.route("/logout").post(verifyJWT,logoutuser) //in verifyjwt at the end we kept req.user=user so we appended smth to the request
router.route("/current-user").post(verifyJWT,getCurrentuser)
router.route("/change-password").post(verifyJWT,userchangecurrentpasswordvalidator(),validate,changeCurrentPassword)
router.route("/resend-email-verification").post(verifyJWT,resendemailverification)
export default router;