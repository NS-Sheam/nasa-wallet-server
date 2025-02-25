import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { USER_ROLES } from "../user/user.const.js";
import { DashboardController } from "./dashboard.controller.js";

const router = Router();

router.get("/", auth(USER_ROLES.ADMIN), DashboardController.adminDashboardData);
router.get("/agent", auth(USER_ROLES.AGENT), DashboardController.agentDashboardData);
router.get("/customer", auth(USER_ROLES.CUSTOMER), DashboardController.customerDashboardData);

export const DashboardRoutes = router;
