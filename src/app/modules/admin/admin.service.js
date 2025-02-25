import { Agent } from "../agent/agent.model.js";
import { Customer } from "../customer/customer.model.js";
import { Admin } from "./admin.model.js";

const systemTotalMoney = async () => {
  const agentTotalBalance = await Agent.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$balance" },
      },
    },
  ]);
  const customerTotalBalance = await Customer.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$balance" },
      },
    },
  ]);

  const agentIncome = await Agent.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$income" },
      },
    },
  ]);
  const adminIncome = await Admin.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$income" },
      },
    },
  ]);

  const total =
    agentTotalBalance[0].total + customerTotalBalance[0].total + agentIncome[0].total + adminIncome[0].total;
  return total;
};

export const AdminService = { systemTotalMoney };
