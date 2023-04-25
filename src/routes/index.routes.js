import { Router } from "express";
import transactionsRouter from "./transactions.routes.js";
import userRouter from "./user.routes.js";

const router = Router();

router.use(userRouter);
router.use(transactionsRouter);

export default router;
