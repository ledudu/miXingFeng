import React from 'react';
import { connect } from "react-redux";
import NavBar from "./child/navbar";
import { logActivity } from "../logic/common"

class NicknamePage extends React.Component {

	componentDidMount() {
		const { sharedNicknames } = this.props
		const nicknameListTemp = [], randomFontSizeArr = [14, 16, 20, 24, 26, 30,  35, 42, 45]
		sharedNicknames.forEach(item => {
			nicknameListTemp.push([
				item, randomFontSizeArr[parseInt(Math.random()*9)]
			])
		})

		const options = {
			list: nicknameListTemp,
			// set to true to allow word being draw partly outside of the canvas. Allow word bigger than the size of the canvas to be drawn.
			drawOutOfBound: false,
			//  set to true to shrink the word so it will fit into canvas. Best if drawOutOfBound is set to false. warning This word will now have lower weight.
			shrinkToFit: true,
			shuffle: false,
		}
		WordCloud(document.getElementById('canvas'), options);
		logActivity({
			msg: 'Looking at nickname page'
		})
	}

	backToMainPage = () => {
		window.goRoute(this, "/main/myInfo")
	}

    render() {
		return (
			<div className="nickname-page-container">
				<NavBar centerText="昵称墙" backToPreviousPage={this.backToMainPage} />
				<div className="nickname-page-content">
					<div id="canvas"></div>
				</div>
			</div>
		);
    }
}

const mapStateToProps = state => {
    return {
		sharedNicknames: state.common.sharedNicknames
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NicknamePage);
