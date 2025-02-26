import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes.js";
import { UserRoutes } from "../modules/user/user.routes.js";
import { CustomerRoutes } from "../modules/customer/customer.routes.js";
import { AgentRoutes } from "../modules/agent/agent.routes.js";
import { TransactionRoutes } from "../modules/transaction/transaction.routes.js";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes.js";
import { CashInRequestRoutes } from "../modules/cashIn/cashInRequest.routes.js";
import { CashOutRequestRoutes } from "../modules/cashOut/cashOut.routes.js";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/customers",
    route: CustomerRoutes,
  },
  {
    path: "/agents",
    route: AgentRoutes,
  },
  {
    path: "/transactions",
    route: TransactionRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
  {
    path: "/cash-in-requests",
    route: CashInRequestRoutes,
  },
  {
    path: "/cash-out-requests",
    route: CashOutRequestRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route?.path, route?.route));

export default router;
