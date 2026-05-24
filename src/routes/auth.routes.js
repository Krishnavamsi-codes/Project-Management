import Router from "express"
import {registeruser} from "../controllers/auth.controllers.js"
const router=Router()
import { validate } from "../middlewares/validator.middleware.js"
import {userRegisterValidator} from "../validators/index.js"

router.route("/register").post(userRegisterValidator(),validate,registeruser)
export default router