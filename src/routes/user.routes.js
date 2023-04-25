import { infoUser, signIn, signUp } from "../controllers/user.controller.js";
import { Router } from "express";
import {
	validateLoginSchema,
	validateUserSchema,
} from "../middlewares/validateSchema.middlewares.js";

const userRouter = Router();

userRouter.post("/cadastro", validateUserSchema, signUp);
userRouter.post("/login", validateLoginSchema, signIn);
userRouter.post("/usuarios", infoUser);

export default userRouter;
