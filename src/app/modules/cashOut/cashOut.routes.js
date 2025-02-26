import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { USER_ROLES } from "../user/user.const.js";
import { CashOutRequestController } from "./cashOutRequest.controller.js";

const router = Router();

router.post("/", auth(USER_ROLES.AGENT), CashOutRequestController.addCashOutRequest);

router.get("/", auth(USER_ROLES.ADMIN), CashOutRequestController.getAllCashOutRequests);

router.patch("/:id", auth(USER_ROLES.ADMIN), CashOutRequestController.updateCashOutStatus);

export const CashOutRequestRoutes = router;
