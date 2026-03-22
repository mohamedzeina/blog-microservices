const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
	res.send(commentByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
	const commentId = randomBytes(4).toString('hex');
	const { content } = req.body;

	const comments = commentByPostId[req.params.id] || [];

	comments.push({ id: commentId, content });

	commentByPostId[req.params.id] = comments;

	await axios
		.post('http://localhost:4005/events', {
			type: 'CommentCreated',
			data: {
				id: commentId,
				content,
				postId: req.params.id,
			},
		})
		.catch((err) => {
			console.log(err.message);
		});

	res.status(201).send(comments);
});

app.listen(4001, () => {
	console.log('Comments service is running on port 4001');
});
