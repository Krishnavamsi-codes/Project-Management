import Router from "express"
import {registeruser} from "../controllers/auth.controllers.js"
const router=Router()

router.route("/register").post(registeruser)
export default router