import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";
import auth from "../../middlewares/auth.js";
import { USER_ROLES } from "../user/user.const.js";

const router = Router();

router.get("/", TransactionController.getAllTransactions);
router.post("/send-money", auth(USER_ROLES.AGENT, USER_ROLES.CUSTOMER), TransactionController.sendMoney);
router.post("/cash-out", auth(USER_ROLES.AGENT, USER_ROLES.CUSTOMER), TransactionController.cashOut);
router.post("/cash-in", auth(USER_ROLES.AGENT, USER_ROLES.CUSTOMER), TransactionController.cashIn);
export const TransactionRoutes = router;
