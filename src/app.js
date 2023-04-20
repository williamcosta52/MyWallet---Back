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
		console.log(err.message);
	}
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
