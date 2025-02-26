import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError.js";
import { CashOutRequest } from "./cashOutRequest.model.js";
import QueryBuilder from "../../helpers/QueryBuilder.js";
import mongoose from "mongoose";
import { Agent } from "../agent/agent.model.js";

const addCashOutRequest = async (user, payload) => {
  const isAgentExist = await Agent.findOne({ user: user.id });

  if (!isAgentExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Agent not found");
  }

  if (isAgentExist.income < payload.amount) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance");
  }

  const result = await CashOutRequest.create({
    agent: isAgentExist._id,
    amount: payload.amount,
  });

  return result;
};

const getAllCashOutRequests = async (query) => {
  const resultQuery = new QueryBuilder(
    CashOutRequest.find().populate({
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

  const cashOutRequest = await CashOutRequest.findById(id);
  if (!cashOutRequest) {
    throw new AppError(StatusCodes.NOT_FOUND, "Cash Out Request not found");
  }
  if (cashOutRequest?.status !== "pending") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Cash Out Request is already processed");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await CashOutRequest.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
        session,
      }
    );
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, "Cash Out Request not found");
    }
    const updatedAgent = await Agent.findByIdAndUpdate(
      result.agent,
      {
        $inc: {
          income: -result.amount,
        },
      },
      {
        new: true,
        session,
      }
    );
    if (!updatedAgent) {
      throw new AppError(StatusCodes.NOT_FOUND, "Agent not found");
    }
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const CashOutRequestService = { addCashOutRequest, getAllCashOutRequests, updateCashOutStatus };
