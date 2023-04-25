import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import { db } from "../database/database.connection.js";

export async function newTransaction(req, res) {
	const { authorization } = req.headers;
	const { tipo } = req.params;
	const { value, description } = req.body;
	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.sendStatus(401);
	const transaction = {
		value,
		description,
		date: dayjs().format("DD/MM"),
	};
	try {
		const session = await db.collection("sessions").findOne({ token });
		if (!session) return res.sendStatus(401);
		if (tipo === "entrada") {
			await db
				.collection("transactions")
				.insertOne({ ...transaction, type: "entrada", idUser: session.userId });
			return res.sendStatus(201);
		} else if (tipo === "saida") {
			await db
				.collection("transactions")
				.insertOne({ ...transaction, type: "saida", idUser: session.userId });
			return res.sendStatus(201);
		}
	} catch (err) {
		res.send(err.message);
	}
}
export async function getTransactions(req, res) {
	const { authorization } = req.headers;
	const token = authorization?.replace("Bearer ", "");
	if (!token) return res.sendStatus(401);
	try {
		const session = await db.collection("sessions").findOne({ token });
		if (!session) return res.sendStatus(401);
		const transactions = await db
			.collection("transactions")
			.find({ idUser: new ObjectId(session.userId) })
			.toArray();
		return res.send(transactions);
	} catch (err) {
		res.send(err.message);
	}
}
