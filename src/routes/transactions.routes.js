import {
	getTransactions,
	newTransaction,
} from "../controllers/transactions.controller.js";
import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.middlewares.js";

const transactionsRouter = Router();

transactionsRouter.post(
	"/nova-transacao/:tipo",
	validateSchema,
	newTransaction
);
transactionsRouter.get("/transacoes", getTransactions);

export default transactionsRouter;
