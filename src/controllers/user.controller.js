import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";
import db from "../database/database.connection.js";
import { loginSchema } from "../schemas/user.schema.js";
import {
	validateLoginSchema,
	validateUserSchema,
} from "../middlewares/validateSchema.middlewares.js";

export async function signUp(req, res) {
	const { name, email, password } = req.body;
	const encryptPassword = bcrypt.hashSync(password, 10);
	try {
		const verifyUser = await db.collection("users").findOne({ email });
		if (verifyUser) return res.status(409).send("Email já cadastrado!");
		await db
			.collection("users")
			.insertOne({ name, email, password: encryptPassword });
		res.status(201).send("created!");
	} catch (err) {
		res.send(err.message);
	}
}
export async function signIn(req, res) {
	const { email, password } = req.body;
	try {
		const verifyUser = await db.collection("users").findOne({ email });
		if (!verifyUser) return res.status(404).send("Usuário não encontrado!");
		if (verifyUser && bcrypt.compareSync(password, verifyUser.password)) {
			const token = uuid();
			await db
				.collection("sessions")
				.insertOne({ userId: verifyUser._id, token });
			return res.status(200).send(token);
		} else {
			return res.sendStatus(401);
		}
	} catch (err) {
		res.send(err.message);
	}
}
export async function infoUser(req, res) {
	const { email } = req.body;
	try {
		const user = await db.collection("users").findOne({ email });
		res.send(user);
	} catch (err) {
		console.log(err);
	}
}
