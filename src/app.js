import express, { json } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

const app = express();

app.use(cors());
app.use(json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
	await mongoClient.connect();
} catch (err) {
	console.log(err.message);
}
const db = mongoClient.db();

const user = [];

const userSchema = joi.object({
	name: joi.string().required(),
	email: joi.string().email().required(),
	password: joi.string().required().min(3),
});

app.post("/cadastro", async (req, res) => {
	const { name, email, password } = req.body;
	const encryptPassword = bcrypt.hashSync(password, 10);
	try {
		const verifyUser = await db.collection("users").findOne({ email });
		user.push(verifyUser);
		if (verifyUser) return res.status(409).send("Email já cadastrado!");
		const validation = userSchema.validate(
			{ name, email, password },
			{ abortEarly: false }
		);
		if (validation.error) {
			const errors = validation.error.details.map((d) => d.message);
			res.status(422).send(errors);
		}
		await db
			.collection("users")
			.insertOne({ name, email, password: encryptPassword });
		res.status(201).send("created!");
	} catch (err) {
		res.send(err.message);
	}
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const token = uuid();
	const loginSchema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().required().min(3),
	});
	try {
		const validation = loginSchema.validate(
			{ email, password },
			{ abortEarly: false }
		);
		if (validation.error) {
			const errors = validation.error.details.map((d) => d.message);
			res.status(422).send(errors);
		}
		const verifyUser = await db.collection("users").findOne({ email });
		if (!verifyUser) return res.status(404).send("Usuário não encontrado!");

		if (verifyUser && bcrypt.compareSync(password, verifyUser.password)) {
			return res.status(200).send(token);
		} else {
			return res.sendStatus(401);
		}
	} catch (err) {
		res.send(err.message);
	}
});

app.post("/nova-transacao/:tipo", async (req, res) => {
	const { authorization } = req.headers;
	const { tipo } = req.params;
	const { value, description } = req.body;
	const transaction = {
		id: uuid(),
		value,
		description,
		date: dayjs().format("DD:MM"),
	};

	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.sendStatus(401);

	const schema = joi.object({
		value: joi.number().positive().precision(2).required(),
		description: joi.string().required(),
	});
	const validation = schema.validate({ value, description });

	if (validation.error) {
		const errors = validation.error.details.map((d) => d.message);
		res.status(422).send(errors);
	}
	try {
		if (tipo === "entrada") {
			await db.collection("transactions").insertOne(transaction);
			return res.sendStatus(201);
		} else if (tipo === "saida") {
			const { id } = req.body;
			await db.collection("transactions").deleteOne({ id });
			return res.sendStatus(201);
		}
	} catch (err) {
		res.send(err.message);
	}
});

app.get("/transacoes", async (req, res) => {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.sendStatus(401);

	try {
		const transactions = db.collection("transactions").find(token).toArray();
		return res.send(transactions);
	} catch (err) {
		res.send(err.message);
	}
});

app.post("/usuarios", async (req, res) => {
	const { email } = req.body;
	try {
		const user = await db.collection("users").findOne({ email });
		res.send(user);
	} catch (err) {
		console.log(err);
	}
});

export default app;
