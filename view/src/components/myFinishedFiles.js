import React from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import FileManage from "./fileManage"
import NavBar from "./child/navbar";
import { updateDownloadedFileList } from "../ducks/fileServer"
import { removeFileFromDownload, removePrefixFromFileOrigin } from "../logic/common"
import { confirm } from "../services/utils"

const MyFinishedFiles = ({ downloadingFileList, downloadedFileList } ) => {

	const history = useHistory()
	function backToMainPage(){
		history.push("/main/myInfo")
	}

	const clearAllFiles = () => {
		confirm(`提示`, `确定要删除所有文件吗`, "确定", () => {
			$dispatch(updateDownloadedFileList([]))
			if(downloadedFileList.length){
				alert("删除成功")
			} else {
				alert("没有文件需要被清理")
			}
			if(window.isCordova){
				downloadedFileList.forEach(item => {
					removeFileFromDownload(removePrefixFromFileOrigin(item.filenameOrigin), "file")
				})
			}
		})
	}

	return (
		<div className="my-download-container">
			<NavBar centerText="文件" backToPreviousPage={backToMainPage}
				rightText="清空" rightTextFunc={clearAllFiles}
			/>
			<div className="my-download-content file-container">
				<div className="downloading-file-container">
					<div className="downloading-file-title">正在下载</div>
					{ window.isCordova && <FileManage fileDataList={downloadingFileList} original="fileDownloading" /> }
				</div>
				<div className="interval-line"></div>
				<div className="downloaded-file-container">
					<div className="downloaded-file-title">已完成</div>
					{ window.isCordova && <FileManage original="fileFinished" fileDataList={downloadedFileList} /> }
				</div>
			</div>
		</div>
	);
}

const mapStateToProps = state => {
    return {
		downloadingFileList: state.fileServer.downloadingFileList,
		downloadedFileList: state.fileServer.downloadedFileList
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MyFinishedFiles);
