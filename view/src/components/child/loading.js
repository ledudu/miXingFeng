import React from 'react';
const Loading = ({text}) => {
	return (
		<div className="loading-text animate-flicker">{text || '觅星峰'}</div>
	)
}

export default Loading;
