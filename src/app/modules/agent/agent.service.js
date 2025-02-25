import QueryBuilder from "../../helpers/QueryBuilder.js";
import { CashInRequest } from "../cashIn/cashIn.model.js";
import { CashOutRequest } from "../cashOut/cashOut.model.js";
import { User } from "../user/user.model.js";

import { Agent } from "./agent.model.js";

const getAllAgents = async (query) => {
  const agentSearchableFields = ["name"];

  const resultQuery = new QueryBuilder(
    Agent.find(agentSearchableFields).populate("user").populate("cashOutRequests cashInTransactions"),
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
