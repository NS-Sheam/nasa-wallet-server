import { StatusCodes } from "http-status-codes";
import catchAsync from "../../middlewares/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { DashboardService } from "./dashboard.service.js";

const adminDashboardData = catchAsync(async (req, res) => {
  const result = await DashboardService.adminDashboardData();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dashboard data fetched successfully",
    data: result,
  });
});

const agentDashboardData = catchAsync(async (req, res) => {
  const result = await DashboardService.agentDashboardData(req.user.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dashboard data fetched successfully",
    data: result,
  });
});

const customerDashboardData = catchAsync(async (req, res) => {
  const result = await DashboardService.customerDashboardData(req.user.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Dashboard data fetched successfully",
    data: result,
  });
});

export const DashboardController = {
  adminDashboardData,
  agentDashboardData,
  customerDashboardData,
};
