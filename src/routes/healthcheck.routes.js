import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controllers.js";

const router=Router();
// router.route() lets you define multiple HTTP methods for the same path in one place.
router.route("/").get(healthcheck) //if we see in the prd we have written the endpoint as /api/v1/healthcheck but we implement only for / here then 
export default router;
