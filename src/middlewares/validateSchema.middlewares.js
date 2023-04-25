import schema from "../schemas/transactions.schema.js";
import { userSchema, loginSchema } from "../schemas/user.schema.js";

export function validateSchema(req, res, next) {
	const { value, description } = req.body;
	const validation = schema.validate({ value, description });

	if (validation.error) {
		const errors = validation.error.details.map((d) => d.message);
		return res.status(422).send(errors);
	}
	next();
}
export function validateUserSchema(req, res, next) {
	const { name, email, password } = req.body;
	const validation = userSchema.validate(
		{ name, email, password },
		{ abortEarly: false }
	);
	if (validation.error) {
		const errors = validation.error.details.map((d) => d.message);
		res.status(422).send(errors);
	}
	next();
}
export function validateLoginSchema(req, res, next) {
	const { email, password } = req.body;
	const validation = loginSchema.validate(
		{ email, password },
		{ abortEarly: false }
	);
	if (validation.error) {
		const errors = validation.error.details.map((d) => d.message);
		res.status(422).send(errors);
	}
	next();
}
