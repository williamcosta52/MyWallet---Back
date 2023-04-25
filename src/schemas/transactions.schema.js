import joi from "joi";

const schema = joi.object({
	value: joi.number().positive().precision(2).required(),
	description: joi.string().required(),
});

export default schema;
