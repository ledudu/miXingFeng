import React, { Component } from 'react';
import { connect } from "react-redux";
import { HashRouter as Router, Route, Switch  } from 'react-router-dom';
import MyLoadable from './Loadable';

const MusicMvPlayer = MyLoadable({
	loader: () => import("./components/musicMvPlayer")
})

const MusicPlaying = MyLoadable({
	loader: () => import("./components/musicPlaying")
})


const ShowFileInfo = MyLoadable({
	loader: () => import("./components/showFileInfo")
})

class Routers extends Component {

    componentDidMount(){
		document.getElementById("root").classList.remove('loading-text')
		document.getElementById("root").classList.remove("animate-flicker")

	}

    render(){
    	return (
    		<Router>
    			<div className="container">
					<div className="main-content">
    					<Switch>
							<Route path="/music_mv_player" component={MusicMvPlayer} />
							<Route path="/music_playing" component={MusicPlaying} />
							<Route path="/show_file_info" component={ShowFileInfo} />
    					</Switch>
					</div>
    			</div>
            </Router>
        )
    }
}


const mapStateToProps = state => {
    return {

    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Routers);
