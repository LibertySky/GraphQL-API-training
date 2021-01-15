const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');

module.exports = {
	createUser: async function ({ userInput }, req) {
		//const email=userInput.email; //destructuring userInput from schema

		// validation
		const errors = [];
		if (!validator.isEmail(userInput.email)) {
			errors.push({ message: 'Email is invalid' });
		}
		if (
			!validator.isEmpty(
				userInput.name || validator.isLength(userInput.name, { min: 2 })
			)
		) {
			errors.push({ message: 'Name is to short' });
		}
		if (
			!validator.isEmpty(
				userInput.password || validator.isLength(userInput.password, { min: 5 })
			)
		) {
			errors.push({ message: 'Password is to short' });
		}
		if (errors.length > 0) {
			const error = new Error('Invalid input');
			error.data = errors;
			error.code = 422;
			throw error;
		}

		const existingUser = await User.findOne({ email: userInput.email });
		if (existingUser) {
			const error = new Error('Such email already registered');
			throw error;
		}
		const hashedPassword = await bcrypt.hash(userInput.password, 12);
		const user = new User({
			email: userInput.email,
			name: userInput.name,
			password: hashedPassword,
		});
		const createdUser = await user.save();
		return {
			...createdUser._doc,
			_id: createdUser._id.toString(),
		};
	},
};
