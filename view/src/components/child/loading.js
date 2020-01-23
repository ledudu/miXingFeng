import React from 'react';
const Loading = (props) => {
	return (
		<div className="loading-text animate-flicker">{props.text || '觅星峰'}</div>
	)
}

export default Loading;
