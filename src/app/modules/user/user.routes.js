import { Router } from "express";
import { UserController } from "./user.controller.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.post("/", UserController.createUser);
router.get("/me", auth(), UserController.getMe);
router.patch("/verify/:id", UserController.verifyUser);
router.patch("/status/:id", UserController.toggleUserStatus);
export const UserRoutes = router;
