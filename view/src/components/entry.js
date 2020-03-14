import React from 'react';

export default class Entry extends React.Component {

    componentDidMount(){
		window.SELF = this;
        window.goRoute(this, "/main/sign")
    }

    render() {
        return null;
    }
}
