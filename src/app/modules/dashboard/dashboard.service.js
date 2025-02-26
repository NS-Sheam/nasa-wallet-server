import config from "../../config/index.js";
import { Admin } from "../admin/admin.model.js";
import { Agent } from "../agent/agent.model.js";
import { CashInRequest } from "../cashIn/cashInRequest.model.js";
import { CashOutRequest } from "../cashOut/cashOutRequest.model.js";
import { Customer } from "../customer/customer.model.js";
import { Transaction } from "../transaction/transaction.model.js";
import { USER_ROLES } from "../user/user.const.js";
import { User } from "../user/user.model.js";

const adminDashboardData = async () => {
  const totalUsers = await User.countDocuments({ role: USER_ROLES.CUSTOMER });
  const totalAgents = await Agent.countDocuments();
  const totalCashInRequests = await Transaction.countDocuments({ type: "cashIn" });
  const totalCashOutRequests = await Transaction.countDocuments({ type: "cashOut" });
  const totalTransactions = await Transaction.countDocuments();
  const user = await User.findOne({ mobileNumber: config.admin_mobile_number });
  const admin = await Admin.findOne({ user: user._id });

  const totalBalance = admin.totalSystemMoney;
  const totalIncome = admin.income;
  const agentCashInpendingRequests = await CashInRequest.countDocuments({ status: "pending" });

  const agentCashOutpendingRequests = await CashOutRequest.countDocuments({ status: "pending" });
  const pendingRequests = agentCashInpendingRequests + agentCashOutpendingRequests;
  const agentCashInCompletedRequest = await CashInRequest.countDocuments({ status: "completed" });
  const agentCashOutCompletedRequest = await CashOutRequest.countDocuments({ status: "completed" });
  const approvedRequests = agentCashInCompletedRequest + agentCashOutCompletedRequest;
  const agentCashInRejectedRequest = await CashInRequest.countDocuments({ status: "rejected" });
  const agentCashOutRejectedRequest = await CashOutRequest.countDocuments({ status: "rejected" });
  const rejectedRequests = agentCashInRejectedRequest + agentCashOutRejectedRequest;
  const totalSystemMoneyRequests = await Transaction.countDocuments();
  return {
    totalUsers,
    totalAgents,
    totalCashInRequests,
    totalCashOutRequests,
    totalTransactions,
    totalBalance,
    totalIncome,
    pendingRequests,
    approvedRequests,
    totalSystemMoneyRequests,
    rejectedRequests,
  };
};

const agentDashboardData = async (userId) => {
  const agent = await Agent.findOne({ user: userId }).populate("user");

  const findQuery = {
    $or: [{ senderId: userId }, { receiverId: userId }],
  };
  const totalCashInRequests = await Transaction.countDocuments({ ...findQuery, type: "cashIn" });
  const totalCashOutRequests = await Transaction.countDocuments({ ...findQuery, type: "cashOut" });
  const totalTransactions = await Transaction.countDocuments({ ...findQuery });
  const agentCashInpendingRequests = await CashInRequest.countDocuments({ agent: agent._id, status: "pending" });

  const agentCashOutpendingRequests = await CashOutRequest.countDocuments({ agent: agent._id, status: "pending" });
  const pendingRequests = agentCashInpendingRequests + agentCashOutpendingRequests;
  const agentCashInCompletedRequest = await CashInRequest.countDocuments({ agent: agent._id, status: "completed" });
  const agentCashOutCompletedRequest = await CashOutRequest.countDocuments({ agent: agent._id, status: "completed" });
  const approvedRequests = agentCashInCompletedRequest + agentCashOutCompletedRequest;
  const agentCashInRejectedRequest = await CashInRequest.countDocuments({ agent: agent._id, status: "rejected" });
  const agentCashOutRejectedRequest = await CashOutRequest.countDocuments({ agent: agent._id, status: "rejected" });
  const rejectedRequests = agentCashInRejectedRequest + agentCashOutRejectedRequest;
  const agentBalance = agent.balance;
  const agentIncome = agent.income;
  return {
    totalCashInRequests,
    totalCashOutRequests,
    totalTransactions,
    agentBalance,
    agentIncome,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
  };
};

const customerDashboardData = async (userId) => {
  const customer = await Customer.findOne({ user: userId }).populate("user");

  const findQuery = {
    $or: [{ senderId: userId }, { receiverId: userId }],
  };
  const totalCashInRequests = await Transaction.countDocuments({ ...findQuery, type: "cashIn" });
  const totalCashOutRequests = await Transaction.countDocuments({ ...findQuery, type: "cashOut" });
  const totalTransactions = await Transaction.countDocuments({ ...findQuery });
  const pendingRequests = await Transaction.countDocuments({ ...findQuery, status: "pending" });
  const approvedRequests = await Transaction.countDocuments({ ...findQuery, status: "completed" });
  const customerBalance = customer.balance;
  return {
    totalCashInRequests,
    totalCashOutRequests,
    totalTransactions,
    customerBalance,
    pendingRequests,
    approvedRequests,
  };
};

export const DashboardService = {
  adminDashboardData,
  agentDashboardData,
  customerDashboardData,
};
