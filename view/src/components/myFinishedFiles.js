import React from 'react';
import { connect } from "react-redux";
import FileManage from "./fileManage"
import NavBar from "./child/navbar";

class MyFinishedFiles extends React.Component {

	backToMainPage = () => {
		window.goRoute(this, "/main/myInfo")
	}

	clearAllFiles = () => {
		window.eventEmit.$emit("clearAllFiles")
	}

    render() {
		const { downloadingFileItems } = this.props;
		return (
			<div className="my-download-container">
				<NavBar centerText="文件" backToPreviousPage={this.backToMainPage}
					rightText="清空" rightTextFunc={this.clearAllFiles}
				/>
				<div className="my-download-content file-container">
					<div className="downloading-file-container">
						<div className="downloading-file-title">正在下载</div>
						{ window.isCordova && <FileManage fileDataList={downloadingFileItems} original="fileDownloading" /> }
					</div>
					<div className="interval-line"></div>
					<div className="downloaded-file-container">
						<div className="downloaded-file-title">已完成</div>
						{ window.isCordova && <FileManage original="fileFinished" /> }
					</div>
				</div>
			</div>
		);
    }
}

const mapStateToProps = state => {
    return {
		downloadingFileItems: state.fileServer.downloadingFileItems
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MyFinishedFiles);
