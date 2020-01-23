import React, { Component } from 'react';

export default class AutoSuggest extends Component {

	render(){
		let { item, query, select } = this.props;
		let result;
		const index1 = (item.toLowerCase()).indexOf(query.toLowerCase())
		const index2 = query.length
		const string1 = item.slice(0, index1)
		const string2 = item.slice(index1, index1 + index2)
		const string3 = item.slice(index1 + index2)
		result = string1 + '<b>' + string2 + '</b>' + string3;
		return (
			<div className="auto-suggest-name" onClick={() => select(item)} dangerouslySetInnerHTML={{ __html: result }}  />
		)
	}
}
