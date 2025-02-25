import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.post("/login", AuthController.login);
router.post("/change-password", auth(), AuthController.changePassword);
export const AuthRoutes = router;
