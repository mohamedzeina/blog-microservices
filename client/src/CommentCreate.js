import React, { useState } from 'react';
import axios from 'axios';

const CommentCreate = ({ postId }) => {
	const [comment, setComment] = useState('');

	const handleSubmit = async (event) => {
		event.preventDefault();
		const response = await axios.post(
			`http://posts.com:4001/posts/${postId}/comments`,
			{
				content: comment,
			},
		);
		setComment('');
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>New Comment</label>
					<input
						className="form-control"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>
				</div>
				<button className="btn btn-primary">Submit</button>
			</form>
		</div>
	);
};

export default CommentCreate;
