import { StatusCodes } from "http-status-codes";
import catchAsync from "../../middlewares/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { CashOutRequestService } from "./cashOutRequest.service.js";

const addCashOutRequest = catchAsync(async (req, res) => {
  const result = await CashOutRequestService.addCashOutRequest(req.user, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Cash In Request added successfully",
    data: result,
  });
});

const getAllCashOutRequests = catchAsync(async (req, res) => {
  const result = await CashOutRequestService.getAllCashOutRequests(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cash In Requests fetched successfully",
    data: result?.result,
    meta: result?.meta,
  });
});

const updateCashOutStatus = catchAsync(async (req, res) => {
  const result = await CashOutRequestService.updateCashOutStatus(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cash In Request updated successfully",
    data: result,
  });
});

export const CashOutRequestController = { addCashOutRequest, getAllCashOutRequests, updateCashOutStatus };
