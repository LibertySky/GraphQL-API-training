const postValidation = (schema) => async (req, res, next) => {
	const body = req.body;
	try {
		await schema.validate(body);
		// next();
		return next();
	} catch (err) {
		return res.status(400).json({ err });
	}
};
module.exports = postValidation;
