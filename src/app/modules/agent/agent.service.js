import QueryBuilder from "../../helpers/QueryBuilder.js";
import { CashInRequest } from "../cashIn/cashIn.model.js";
import { CashOutRequest } from "../cashOut/cashOut.model.js";
import { User } from "../user/user.model.js";

import { Agent } from "./agent.model.js";

const getAllAgents = async (query) => {
  const agentSearchableFields = ["name"];

  let findQuery = {};

  if (query.mobileNumber) {
    // find user by mobile number login
  }

  const resultQuery = new QueryBuilder(
    Agent.find({
      ...findQuery,
    }).populate("user"),
    query
  )
    .search(agentSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await resultQuery.modelQuery;

  const meta = await resultQuery.countTotal();

  return { result, meta };
};

export const AgentService = { getAllAgents };
