import QueryBuilder from "../../helpers/QueryBuilder.js";
import { Transaction } from "../transaction/transaction.model.js";
import { User } from "../user/user.model.js";
import { Customer } from "./customer.model.js";

const getAllCustomers = async (query) => {
  const findQuery = {};
  console.log(query);

  if (query.mobileNumber) {
    // find user by mobile number login
  }

  const resultQuery = new QueryBuilder(
    Customer.find({
      ...findQuery,
    })
      .populate("user")
      .populate("transactions"),
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

export const CustomerService = { getAllCustomers };
