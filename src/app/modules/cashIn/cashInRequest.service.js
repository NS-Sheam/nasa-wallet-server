import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError.js";
import { CashInRequest } from "./cashInRequest.model.js";
import QueryBuilder from "../../helpers/QueryBuilder.js";
import mongoose from "mongoose";
import { Agent } from "../agent/agent.model.js";

const addCashInRequest = async (user) => {
  const isAgentExist = await Agent.findOne({ user: user.id });
  if (!isAgentExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Agent not found");
  }

  const result = await CashInRequest.create({
    agent: isAgentExist._id,
  });

  return result;
};

const getAllCashInRequests = async (query) => {
  const resultQuery = new QueryBuilder(
    CashInRequest.find().populate({
      path: "agent",
      populate: "user",
    }),
    query
  )
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await resultQuery.modelQuery;
  const meta = await resultQuery.countTotal();

  return { result, meta };
};

const updateCashOutStatus = async (id, payload) => {
  const { status } = payload;

  const cashInRequest = await CashInRequest.findById(id);
  if (!cashInRequest) {
    throw new AppError(StatusCodes.NOT_FOUND, "Cash In Request not found");
  }
  if (cashInRequest?.status !== "pending") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Cash In Request is already processed");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await CashInRequest.findByIdAndUpdate(id, { status }, { new: true, session });
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, "Cash In Request not found");
    }
    const updatedAgent = await Agent.findByIdAndUpdate(
      result.agent,
      { $inc: { balance: result.amount } },
      { new: true, session }
    );
    if (!updatedAgent) {
      throw new AppError(StatusCodes.NOT_FOUND, "Agent not found");
    }
    await session.commitTransaction();
    await session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong");
  }
};

export const CashInRequestService = {
  addCashInRequest,
  getAllCashInRequests,
  updateCashOutStatus,
};
