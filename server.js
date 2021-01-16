const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
// GraphQL
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

cors = require('cors');

const app = express();
app.use(cors());

// file upload config
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '_' + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use(bodyParser.json());
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

// set headers to any response to avoir CORS errors
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	);
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

// graphql route
app.use(
	'/graphql',
	graphqlHTTP({
		schema: graphqlSchema,
		rootValue: graphqlResolver,
		graphiql: true, //gives tool for testing in browser
		customFormatErrorFn(err) {
			//setup custom errors
			if (!err.originalError) {
				return err;
			}
			const data = err.originalError.data;
			const message = err.message || 'Something went wrong with';
			const code = err.originalError.code;
			return { message: message, status: code, data: data };
		},
	})
);

// error handling middleware
app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message: message, data: data });
});

const PORT = process.env.PORT || 3021;
mongoose
	.connect('mongodb://localhost:27017/GraphQL-training', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => {
		app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
	});
