const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const Post = require('../models/post');
const User = require('../models/user');
const io = require('../socket');

exports.getPosts = async (req, res, next) => {
	// pagination
	const currentPage = req.query.page || 1;
	const perPage = 2;
	try {
		const totalItems = await Post.find().countDocuments();
		const posts = await Post.find()
			.populate('creator')
			.sort({ createdAt: -1 })
			.skip((currentPage - 1) * perPage)
			.limit(perPage);

		if (!posts) {
			const error = new Error('Could not find posts');
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({
			message: 'Posts fetched successfully!',
			posts: posts,
			totalItems: totalItems,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.createPost = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Error: validation failed, entered data is incorrect'
		);
		error.statusCode = 422;
		error.data = error.errors.array();
		throw error;
	}
	if (!req.file) {
		const error = new Error('No image provided');
		error.statusCode = 422;
		throw error;
	}
	const imageUrl = req.file.path;
	const title = req.body.title;
	const content = req.body.content;

	const post = new Post({
		title: title,
		content: content,
		imageUrl: imageUrl,
		creator: req.userId,
	});

	try {
		await post.save();
		const user = await User.findById(req.userId);
		user.posts.push(post);
		await user.save();

		io.getIo().emit('posts', {
			action: 'create',
			post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
		});

		res.status(201).json({
			message: 'Post created successfully!',
			post: post,
			creator: { _id: user._id, name: user.name },
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getPost = async (req, res, next) => {
	const postId = req.params.postId;
	try {
		const post = await Post.findById(postId);
		if (!post) {
			const error = new Error('Could not find post.');
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ message: 'Post fetched.', post: post });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.editPost = async (req, res, next) => {
	const postId = req.params.postId;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error(
			'Error: validation failed, entered data is incorrect'
		);
		error.statusCode = 422;
		throw error;
	}
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = req.body.image;
	if (req.file) {
		imageUrl = req.file.path;
	}
	if (!imageUrl) {
		const error = new Error('No image added');
		error.statusCode = 422;
		throw error;
	}
	try {
		const post = await Post.findById(postId).populate('creator');
		if (!post) {
			const error = new Error('Could not find posts');
			error.statusCode = 404;
			throw error;
		}

		if (post.creator._id.toString() !== req.userId) {
			const error = new Error('Not authorized');
			error.statusCode = 403;
			throw error;
		}

		if (imageUrl !== post.imageUrl) {
			clearImage(post.imageUrl);
		}
		post.title = title;
		post.content = content;
		post.imageUrl = imageUrl;
		const result = await post.save();

		io.getIo().emit('posts', {
			action: 'update',
			post: result,
		});

		res
			.status(200)
			.json({ message: 'Post updated successfully!', post: result });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.deletePost = async (req, res, next) => {
	const postId = req.params.postId;
	try {
		const post = await Post.findById(postId);

		if (!post) {
			const error = new Error('Could not find post.');
			error.statusCode = 404;
			throw error;
		}
		// check user permission
		if (post.creator.toString() !== req.userId) {
			const error = new Error('Not authorized');
			error.statusCode = 403;
			throw error;
		}
		clearImage(post.imageUrl);
		await Post.findByIdAndRemove(postId);

		// delete post reference in use document of the db
		const user = await User.findById(req.userId);
		user.posts.pull(postId);
		await user.save();

		io.getIo().emit('posts', {
			action: 'delete',
			post: postId,
		});

		res.status(200).json({ message: 'Post deleted.' });
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, '..', filePath);
	fs.unlink(filePath, (err) => {
		// console.log(err);
	});
};