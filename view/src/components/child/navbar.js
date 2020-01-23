import React, { Fragment } from 'react';
import StatusBar from "./statusBar";

class NavBar extends React.Component {

  	render() {
  	  	let { centerText="", backToPreviousPage=()=>{}, rightText="", rightTextFunc=()=>{}} = this.props;
  	  	return (
  	  	    <Fragment>
  	  	        <StatusBar />
  	  	        <div className="navbar-container">
					<div className="back-btn" onClick={backToPreviousPage}>
                        <i className="fa fa-angle-left" aria-hidden="true"></i>
                    </div>
  	  	            <div className="center-text">{centerText}</div>
  	  	            <div className="other-text" onClick={rightTextFunc}>{rightText}</div>
  	  	        </div>
  	  	    </Fragment>
  	  	);
  	}
}

export default NavBar;
