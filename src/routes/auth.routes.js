import Router from "express"
import {loginuser, logoutuser, registeruser} from "../controllers/auth.controllers.js"
const router=Router()
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validator.middleware.js"
import {userRegisterValidator,userLoginValidator} from "../validators/index.js"


// functionName    → pass function itself (Express will call it later)

// functionName()  → execute function immediately and pass its returned value
router.route("/register").post(userRegisterValidator(),validate,registeruser)
router.route("/login").post(userLoginValidator(),validate,loginuser)
router.route("/logout").post(verifyJWT,logoutuser) //in verifyjwt at the end we kept req.user=user so we appended smth to the request
export default router