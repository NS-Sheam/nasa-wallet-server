import mongoose from "mongoose";
import QueryBuilder from "../../helpers/QueryBuilder.js";
import { Admin } from "../admin/admin.model.js";
import { USER_ROLES } from "../user/user.const.js";
import { Transaction } from "./transaction.model.js";
import { User } from "../user/user.model.js";
import { Customer } from "../customer/customer.model.js";
import AppError from "../../errors/appError.js";
import { StatusCodes } from "http-status-codes";
import { generateTransactionId } from "./transaction.utils.js";
import config from "../../config/index.js";
import { Agent } from "../agent/agent.model.js";
import { PasswordHelper } from "../../utils/passwordHelpers.js";
import { AdminService } from "../admin/admin.service.js";

const getAllTransactions = async (query) => {
  const transactionSearchableFields = ["transactionId", "amount", "fee", "type", "status"];
  let findQuery = {};

  if (query.userId) {
    findQuery = { $or: [{ senderId: query.userId }, { receiverId: query.userId }] };
  }

  const resultQuery = new QueryBuilder(Transaction.find({ ...findQuery }).populate("senderId receiverId"), query)
    .search(transactionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const result = await resultQuery.modelQuery;

  const meta = await resultQuery.countTotal();

  return { result, meta };
};

const sendMoney = async (payload) => {
  const { senderMobile, receiverMobile, amount } = payload;

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    // Validate the minimum amount
    if (amount < 50) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Minimum amount is 50 Taka!");
    }

    // Find sender and receiver
    const sender = await User.findOne({ mobileNumber: senderMobile, role: USER_ROLES.CUSTOMER }, null, { session });
    if (!sender) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Sender not found!");
    }
    if (senderMobile === receiverMobile) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Cannot send money to yourself!");
    }

    const receiver = await User.findOne({ mobileNumber: receiverMobile, role: USER_ROLES.CUSTOMER }, null, { session });

    if (!receiver) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Receiver not found!");
    }

    const senderCustomer = await Customer.findOne({ user: sender._id }, null, { session });
    const receiverCustomer = await Customer.findOne({ user: receiver._id }, null, { session });

    if (senderCustomer.balance < amount) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    const fee = amount > 100 ? 5 : 0;
    const totalAmount = amount + fee;

    senderCustomer.balance -= totalAmount;
    await senderCustomer.save({ session });

    receiverCustomer.balance += amount;
    await receiverCustomer.save({ session });

    if (fee > 0) {
      const adminUser = await User.findOne({ role: USER_ROLES.ADMIN });

      await Admin.findOneAndUpdate(
        { user: adminUser._id },
        { $inc: { totalSystemMoney: fee, income: fee } },
        { session }
      );
    }
    const transactionId = generateTransactionId();
    const transaction = await Transaction.create(
      [
        {
          transactionId,
          senderId: sender._id,
          receiverId: receiver._id,
          amount,
          fee,
          type: "sendMoney",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    await session.endSession();

    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const cashOut = async (payload) => {
  const { customerNumber, agentMobile, password } = payload;
  const amount = parseFloat(payload?.amount);
  console.log("amount", amount);
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    if (amount <= 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Amount must be greater than 0!");
    }

    const customerUser = await User.findOne({ mobileNumber: customerNumber, role: USER_ROLES.CUSTOMER });
    if (!customerUser) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Customer not found!");
    }

    const isPinMatch = await PasswordHelper.comparePassword(password, customerUser.password);
    if (!isPinMatch) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid account PIN!");
    }

    const agentUser = await User.findOne({ mobileNumber: agentMobile, role: USER_ROLES.AGENT });
    if (!agentUser) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Agent not found!");
    }

    const customer = await Customer.findOne({ user: customerUser._id });
    if (!customer) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Customer account not found!");
    }

    const agent = await Agent.findOne({ user: agentUser._id });
    if (!agent) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Agent account not found!");
    }

    // Fee & Income Calculation
    const feePercentage = 1.5;
    const agentIncomePercentage = 1;
    const adminIncomePercentage = 0.5;

    const fee = (amount * feePercentage) / 100;
    const agentIncome = (amount * agentIncomePercentage) / 100;
    const adminIncome = (amount * adminIncomePercentage) / 100;
    const totalDeduction = amount + fee;
    if (customer.balance < totalDeduction) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance!");
    }
    // Deduct from customer's balance
    customer.balance -= totalDeduction;
    await customer.save({ session });

    // Update agent balance and income
    agent.balance += amount - fee;
    agent.income += agentIncome;

    await agent.save({ session });

    const adminUser = await User.findOne({ role: USER_ROLES.ADMIN });
    if (!adminUser) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Admin not found!");
    }

    const totalSystemMoney = (await AdminService.systemTotalMoney()) + adminIncome;

    await Admin.findOneAndUpdate(
      { user: adminUser._id },
      {
        totalSystemMoney,
        $inc: { income: adminIncome },
      },
      { session, new: true }
    );

    const transactionId = generateTransactionId();
    const transaction = await Transaction.insertMany(
      [
        {
          transactionId,
          senderId: customerUser._id,
          receiverId: agentUser._id,
          amount,
          fee,
          type: "cashOut",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const cashIn = async (payload) => {
  const { agentMobile, customerMobile, amount, password } = payload;
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    if (amount <= 0) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Amount must be greater than 0!");
    }

    const agentUser = await User.findOne({ mobileNumber: agentMobile, role: USER_ROLES.AGENT });
    if (!agentUser) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Agent not found!");
    }

    const isPasswordMatch = await PasswordHelper.comparePassword(password, agentUser.password);
    if (!isPasswordMatch) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid password!");
    }
    const customerUser = await User.findOne({ mobileNumber: customerMobile, role: USER_ROLES.CUSTOMER });
    if (!customerUser) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Customer not found!");
    }

    const customer = await Customer.findOne({ user: customerUser._id });
    if (!customer) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Customer account not found!");
    }
    const agent = await Agent.findOne({ user: agentUser._id });
    if (!agent) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Agent account not found!");
    }

    if (agent.balance < amount) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    // Deduct amount and fee from customer's balance
    customer.balance += amount;
    await customer.save({ session });
    // Add amount to agent's balance
    agent.balance -= amount;
    await agent.save({ session });
    const adminUser = await User.findOne({ role: USER_ROLES.ADMIN });

    await Admin.findOneAndUpdate({ user: adminUser._id }, { $inc: { totalSystemMoney: amount } }, { session });
    // Record the transaction
    const transactionId = generateTransactionId();
    const transaction = await Transaction.create(
      [
        {
          transactionId,
          senderId: agentUser._id,
          receiverId: customerUser._id,
          amount,
          type: "cashIn",
          status: "completed",
        },
      ],
      { session }
    );
    await session.commitTransaction();
    await session.endSession();
    return transaction[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

export const TransactionService = {
  getAllTransactions,
  sendMoney,
  cashOut,
  cashIn,
};

//Cash In
// ● Users can perform a cash-in transaction through authorized agents.
// ● Agents facilitate the cash-in process on behalf of users.
// ● There is no fee associated with user cash-in transactions through agents.
// ● Agents must fill the amount of money and his PIN for security purposes before
// processing the cash-in transaction.
// ● Upon successful completion of the cash-in transaction:
// ● The user's account balance will be updated.
// ● The total money of the system will be updated.
// ● Users will receive a notification confirming the cash-in transaction details once
// completed.
