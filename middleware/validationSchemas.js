const yup = require('yup');

exports.postSchema = yup.object({
	title: yup.string().trim().min(5).required(),
	content: yup.string().trim().min(5).required(),
});

exports.signupSchema = yup.object({
	name: yup.string().trim().min(5).required(),
	email: yup.string().trim().min(5).required(),
	password: yup.string().trim().min(5).required(),
});
