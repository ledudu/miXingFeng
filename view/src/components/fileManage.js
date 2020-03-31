import React, { useState }  from 'react'
import { useHistory } from "react-router-dom"
import { connect } from "react-redux"
import { ActionSheet } from 'antd-mobile'
import MINE from "mime-types"
import { calcSize } from "../logic/common"
import { networkErr, confirm, saveFileToLocal, updateDownloadingStatus, checkFileWritePriority, requestFileWritePriority, onBackKeyDown } from "../services/utils"
import { HTTP_URL } from "../constants/httpRoute"
import { CONSTANT } from "../constants/enumeration"
import { updateToken } from "../ducks/login"
import { openDownloadedFile, removeFileFromDownload, optimizeLoadPerformance, removePrefixFromFileOrigin } from "../logic/common"
import { updateLastFileSearchResult, updateLastSearchAllFileResult } from "../ducks/fileServer"

const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let wrapProps;
if (isIPhone) {
	wrapProps = {
		onTouchStart: e => e.preventDefault(),
	};
}
let currentTime = new Date().getTime()

const FileManage = ({
		username,
		token,
		downloadingFileList,
		downloadedFileList,
		lastFileSearchResult,
		lastSearchAllFileResult,
		setMobile,
		fileDataList = [],
		original
	}) => {

	const history = useHistory()
	const [ firstRender, setFirstRender ] = useState(true)
	let startToDeleteOnline = false

	const listenBackFunc = () => {
		window.cancelMenuFirst = true
		document.addEventListener("backbutton", closeShowMenu, false);
	}

	const removeListenBackFunc = () => {
		document.removeEventListener("backbutton", closeShowMenu);
		document.removeEventListener("deviceready", listenBackFunc);
		document.addEventListener("backbutton", onBackKeyDown, false);
	}

	const closeShowMenu = () => {
		window.cancelMenuFirst = false
		const musicMenuExisted = document.querySelector('.am-action-sheet-button-list div:nth-last-child(1)')
		if(musicMenuExisted) musicMenuExisted.click();
		if(musicMenuExisted) musicMenuExisted.click();
	}

	const showMenu = async(filename, fileSize, filePath, uploadUsername, filenameOrigin, date) => {
		try {
			document.removeEventListener("backbutton", onBackKeyDown, false);
			document.addEventListener("deviceready", listenBackFunc);

			let firstItem = "下载";
			let isFileFinished = (original === "fileFinished")
			if(isFileFinished){
				firstItem = "打开"
			} else if(original === "fileShare" || original === "fileSearch"){
				downloadedFileList.some((item) => {
					if(removePrefixFromFileOrigin(item.filenameOrigin) === removePrefixFromFileOrigin(filenameOrigin) && (!item.status || item.status === "downloaded")){
						firstItem = "打开"
						isFileFinished = true
						return true
					} else {
						return false
					}
				})
			}
			if(original === "fileDownloading" || original === "fileFinished"){
				date = ""
			} else {
				date = ` ${date}`
			}
			const buttons = [firstItem, '删除', '取消'];
			const showActionSheetWithOptionsConfig = {
				options: buttons,
				cancelButtonIndex: buttons.length - 1,
				destructiveButtonIndex:  buttons.length - 2,
				message: `大小: ${calcSize(fileSize)}${date}`,
				title: filename,
				maskClosable: true,
				'data-seed': 'logId',
				wrapProps,
			}
			ActionSheet.showActionSheetWithOptions(
				showActionSheetWithOptionsConfig,
				(buttonIndex) => {
					logger.info("file manage showMenu buttonIndex", buttonIndex)
					switch(buttonIndex){
						case 0:
							if(isFileFinished){
								openFileFunc(filename, filenameOrigin)
							} else {
								saveFileToLocalFunc(filename, uploadUsername, fileSize, filePath, false, filenameOrigin)
							}
							break;
						case 1:
							// 只有在已下载页面的删除才能删除已下载的文件，其他的页面删除都是删除服务器上的文件
							if(original === "fileFinished"){
								confirm(`提示`, `确定从本地删除${filename}吗`, "确定", () => {
									removeFileFromDownload(removePrefixFromFileOrigin(filenameOrigin), "file")
										.catch(error => {
											logger.error("删除文件过程中发生了错误 isFileFinished", error.stack||error.toString());
											networkErr(error, `fileManage removeFileFromDownload filename ${filename}`);
										})
								})
							} else {
								if(!token) return window.goRoute(this, "/login")
								const dataInfo = {
									username: username || setMobile,
									token,
									filename,
									type: "default-file"
								}
								confirm(`提示`, `确定从服务器删除${filename}吗`, "确定", () => {
									if(!startToDeleteOnline){
										startToDeleteOnline = true
										return axios.delete(HTTP_URL.delFile, {data: dataInfo})
											.then(response => {
												startToDeleteOnline = false
												if (response.data.result.result === 'file_deleted') {
													alert("文件已删除!");
													$dispatch(updateToken(response.data.result.token))
													return updateSearchList(original, filenameOrigin)
												} else if (response.data.result.result === 'success'){
													alert("删除成功!");
													$dispatch(updateToken(response.data.result.token))
													return updateSearchList(original, filenameOrigin)
												} else {
													alert("删除失败!");
												}
											})
											.catch(error => {
												startToDeleteOnline = false
												logger.error("删除文件过程中发生了错误", error.stack||error.toString());
												networkErr(error, `delFile dataInfo: ${JSON.stringify(dataInfo)}`);
											})
									}
								})
							}
							break;
						default:
							logger.warn("buttonIndex default")
							break;
					}
					removeListenBackFunc()
				}
			);
		} catch(err){
			logger.error("fileManage showMenu err", err)
		}
	}

	const updateSearchList = (original, filenameOrigin) => {
		if(original === "fileSearch"){
			let lastFileSearchResultIndex, lastSearchAllFileResultIndex
			lastFileSearchResult.some((item, index) => {
				if(item.filenameOrigin === filenameOrigin){
					lastFileSearchResultIndex = index
					return true
				}
			})
			lastFileSearchResult.splice(lastFileSearchResultIndex, 1)
			lastSearchAllFileResult.some((item, index) => {
				if(item.filenameOrigin === filenameOrigin){
					lastSearchAllFileResultIndex = index
					return true
				}
			})
			lastSearchAllFileResult.splice(lastSearchAllFileResultIndex, 1)
			$dispatch(updateLastFileSearchResult(lastFileSearchResult))
			$dispatch(updateLastSearchAllFileResult(lastSearchAllFileResult))
		}
	}

	const openFileFunc = (filename, filenameOrigin) => {
		let fileMine = MINE.lookup(filename)
		if(!fileMine){
			fileMine = 'text/plain';
			alert("不支持打开的的文件类型，请提交反馈")
		}
		openDownloadedFile(filename, fileMine, removePrefixFromFileOrigin(filenameOrigin))
	}

	const saveFileToLocalFunc = async (filename, uploadUsername, fileSize, filePath, retry, filenameOrigin) => {
		if(!token) return window.goRoute(this, "/login")
		if(!window.isCordova){
			return saveFileToLocal(filenameOrigin, filePath, "download", filename, uploadUsername, true, fileSize, false, {})
		}
		if((new Date().getTime() - currentTime) < 300){
			// not allow to click frequently
			currentTime = new Date().getTime();
			return;
		}
		let isDownload = false
		const filenameOriginOld = filenameOrigin
		filenameOrigin = removePrefixFromFileOrigin(filenameOrigin)
		if(!retry && window.isCordova){
			downloadingFileList.some((item) => {
				if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin){
					isDownload = true
					confirm(`提示`, `${filename}正在下载`, "去查看", () => {
						history.push("/my_finished_files")
					})
					return true
				} else {
					return false
				}
			})
		}
		downloadedFileList.some((item) => {
			if(removePrefixFromFileOrigin(item.filenameOrigin) === filenameOrigin && (!item.status || item.status === "downloaded")){
				isDownload = true
				openFileFunc(filename, filenameOriginOld)
				return true
			} else {
				return false
			}
		})
		if(!isDownload){
			return checkFileWritePriority()
				.then(bool => {
					if(bool){
						if(retry){
							alert(`重新下载${filename}`)
						} else {
							alert(`开始下载${filename}`)
						}
						updateDownloadingStatus(filename, '准备中', uploadUsername, fileSize, true, filePath, filenameOrigin, false, {})
						saveFileToLocal(filenameOrigin, filePath, "download", filename, uploadUsername, true, fileSize, false, {})
					} else {
						return alertDialog("请授予文件读写权限，否则不能下载文件", "", "知道了", requestFileWritePriority)
					}
				})
		}
	}

	const removeDownloadItem = (filename, filenameOrigin) => {
        confirm('提示', `确定要移除下载${filename}吗`, "确定", () => {
			logger.info("removePrefixFromFileOrigin(filenameOrigin)", removePrefixFromFileOrigin(filenameOrigin))
			window.eventEmit.$emit(`FileTransfer-${removePrefixFromFileOrigin(filenameOrigin)}`, 'abort', ["file", filenameOrigin])
		})
	}

	const dealWithFileUploadTime = (date) => {
		if(!date) return ""
		if(original === "fileDownloading" || original === "fileFinished") return ""
		return " " + date.split(" ")[0]
	}

	const downloadOrOpenFile = async (filename, uploadUsername, fileSize, filePath, filenameOrigin) => {
		if(original === "fileFinished"){
			openFileFunc(filename, filenameOrigin)
		} else if(original === "fileShare" || original === "fileSearch"){
			//只要在这个条件里不要再往下写强依赖逻辑，这里的await可以不加
			await saveFileToLocalFunc(filename, uploadUsername, fileSize, filePath, false, filenameOrigin)
		} else if(original === "fileDownloading"){
			downloadingFileList.some((item) => {
				if(item.filenameOrigin === filenameOrigin) {
					filenameOrigin = filenameOrigin.replace(/^downloading_/, "")
					logger.info("downloadOrOpenFile filenameOrigin", filenameOrigin)
					if(item.progress === "失败" || item.progress === "已取消"){
						saveFileToLocalFunc(filename, uploadUsername, fileSize, filePath, true, filenameOrigin)
					} else {
						window.eventEmit.$emit(`FileTransfer-${filenameOrigin}`, 'abort')
					}
					return true
				} else {
					return false
				}
			})
		}
	}

	const fileDataListCopy = optimizeLoadPerformance(fileDataList, firstRender, CONSTANT.showFileNumberPerTime, setFirstRender)
	return (
		<div className={`file-manage-container`}>
			{
				fileDataListCopy.map((item, index) =>
					<div className="file-list" key={item.filenameOrigin}>
						<div className={`file-content ${original === "fileDownloading" && "downloading"}`} onClick={downloadOrOpenFile.bind(this, item.filename, item.uploadUsername, item.fileSize, item.filePath, item.filenameOrigin)}>
							<div className="num">{index + 1}</div>
							<div className="file-info">
								<div className={`info ${original === "fileFinished" ? "center" : ""} ${item.downloaded ? "downloaded" : ""}`}>
									<div className="filename">{item.filename}</div>
									{item.downloaded && <div className="downloaded-text">已下载</div>}
								</div>
								{
									original !== "fileFinished" && <div className="upload-info">
										<div className="upload-user">
											{`${item.uploadUsername}${dealWithFileUploadTime(item.date)}`}
										</div>
										{
											(original === "fileShare" || original === "fileSearch")
											?	<div className="file-size">{calcSize(item.fileSize)}</div>
											:	<div className="file-size">{item.progress}</div>
										}
									</div>
								}
							</div>
						</div>
						{
							original !== "fileDownloading"
							?   <div className="menu" onClick={showMenu.bind(this, item.filename, item.fileSize, item.filePath, item.uploadUsername, item.filenameOrigin, item.date)}>
									<div className="dot"></div>
									<div className="dot"></div>
									<div className="dot"></div>
								</div>
							:	<div className="move-downloading-item fa fa-remove" onClick={removeDownloadItem.bind(this, item.filename, item.filenameOrigin)}></div>
						}
					</div>
				)
			}
		</div>
	);
}

const mapStateToProps = state => {
    return {
		username: state.login.username,
		token: state.login.token,
		downloadingFileList: state.fileServer.downloadingFileList,
		lastFileSearchResult: state.fileServer.lastFileSearchResult,
		lastSearchAllFileResult: state.fileServer.lastSearchAllFileResult,
		setMobile: state.myInfo.setMobile,
		downloadedFileList: state.fileServer.downloadedFileList
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(FileManage);
