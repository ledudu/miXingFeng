import React from 'react';
import { connect } from "react-redux";
import NavBar from "./child/navbar";
import { showHeadPic } from "../logic/myInfo";

class LookHeadPic extends React.Component {

	state = {
		saving: false,
		headPicAddress: ""
	}

	componentDidMount(){
		let { headPicAddress } = this.state;
		const { setHeadPic, setHeadPicName } = this.props;
		headPicAddress = showHeadPic(setHeadPic, headPicAddress, setHeadPicName);
		this.setState({
			headPicAddress
		})
    }

    backToMainPage = () => {
        window.goRoute(this, "/user_profile");
	}

	saveToLocal = (fileUrl) => {
		if(window.isCordova){
			alert('图片已保存到/storage/emulated/0/miXingFeng/avatar')
		} else {
			alert("觅星峰：请使用右键图片另存为")
		}
	}

    render() {
		let { saving, headPicAddress } = this.state;
		let { setHeadPic, replaceHeadPic } = this.props;
		if(replaceHeadPic){
			headPicAddress = window.serverHost + "/" + setHeadPic
		}
        return (
            <div className="look-head-pic-container">
                <NavBar centerText="头像" backToPreviousPage={this.backToMainPage} />
                <div className="look-head-pic-content">
					<img className="big-head-pic" src={headPicAddress} />
					{saving
					? 	<div className="save-to-local">正在保存...</div>
					: 	<div className="save-to-local" onClick={() => this.saveToLocal(headPicAddress)}>保存</div>}
				</div>
            </div>
        );
    }
}

const mapStateToProps = state => {
	return {
		setHeadPic: state.myInfo.setHeadPic,
		setHeadPicName: state.myInfo.setHeadPicName,
		replaceHeadPic: state.myInfo.replaceHeadPic
	};
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(LookHeadPic);
