import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { USER_ROLES } from "../user/user.const.js";
import { CashInRequestController } from "./cashInRequest.controller.js";

const router = Router();

router.post("/", auth(USER_ROLES.AGENT), CashInRequestController.addCashInRequest);

router.get("/", auth(USER_ROLES.ADMIN), CashInRequestController.getAllCashInRequests);

router.patch("/:id", auth(USER_ROLES.ADMIN), CashInRequestController.updateCashOutStatus);

export const CashInRequestRoutes = router;
