import { StatusCodes } from "http-status-codes";
import catchAsync from "../../middlewares/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { CashInRequestService } from "./cashInRequest.service.js";

const addCashInRequest = catchAsync(async (req, res) => {
  const result = await CashInRequestService.addCashInRequest(req.user);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Cash In Request added successfully",
    data: result,
  });
});

const getAllCashInRequests = catchAsync(async (req, res) => {
  const result = await CashInRequestService.getAllCashInRequests(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cash In Requests fetched successfully",
    data: result?.result,
    meta: result?.meta,
  });
});

const updateCashOutStatus = catchAsync(async (req, res) => {
  const result = await CashInRequestService.updateCashOutStatus(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Cash In Request updated successfully",
    data: result,
  });
});

export const CashInRequestController = { addCashInRequest, getAllCashInRequests, updateCashOutStatus };
