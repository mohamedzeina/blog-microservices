import React, { useState } from 'react';
import axios from 'axios';

const PostCreate = () => {
	const [title, setTtitle] = useState('');

	const onSubmit = async (event) => {
		event.preventDefault();

		await axios.post('http://posts.com:4000/posts/create', {
			title,
		});

		setTtitle('');
	};

	return (
		<div>
			<form onSubmit={onSubmit}>
				<div className="form-group">
					<label>Title</label>
					<input
						value={title}
						onChange={(e) => setTtitle(e.target.value)}
						className="form-control"
					/>
				</div>
				<button className="btn btn-primary">Submit</button>
			</form>
		</div>
	);
};

export default PostCreate;
