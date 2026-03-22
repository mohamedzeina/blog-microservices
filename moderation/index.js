const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/events', (req, res) => {
	const { type, data } = req.body;
});

app.listen(4003, () => {
	console.log('Moderation service is running on port 4003');
});
