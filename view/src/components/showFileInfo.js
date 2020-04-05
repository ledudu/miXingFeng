import React, { useState, useEffect, Fragment } from 'react';
import { dealWithThirdPartVisit } from "../logic/common"
import { comeFromWeChat, saveFileToLocal } from "../services/utils"
import { CONSTANT } from "../constants/enumeration"
import "../themes/css/showFileInfo.less"

let filePath = ""
const ShowFileInfo = () => {

	const [filename, setFilename] = useState("")
	const [fileSize, setFileSize] = useState("")
	const [showDownloadHeaderTip, setShowDownloadHeaderTip] = useState(false)

	useEffect(() => {
		const queryParams = dealWithThirdPartVisit()
		if(queryParams.filePath){
			filePath = queryParams.filePath
			setFilename(queryParams.filename)
			setFileSize(queryParams.fileSize)
		} else {
			return alertOld("缺少必要的参数,请稍后重试")
		}
	})

	const downloadFile = () => {
		if(comeFromWeChat()){
			setShowDownloadHeaderTip(true)
		} else {
			saveFileToLocal({
				filenameOrigin: "downloadFileFromThirdPart",
				fileUrl: filePath,
				folder: CONSTANT.downloadAppFromPage
			})
		}
	}

	const downloadApp = () => {
		if(comeFromWeChat()){
			setShowDownloadHeaderTip(true)
		} else {
			saveFileToLocal({
				filenameOrigin: "downloadAppFromThirdPartFile",
				fileUrl: CONSTANT.appDownloadUrl,
				folder: CONSTANT.downloadAppFromPage
			})
		}
	}

	return 	(
		<div className="show-file-info-container">
			<div className="file-info">
				<i className="fa fa-file-text-o file-ico"></i>
				<div className="filename">{filename}</div>
				<div className="file-size">文件大小: {fileSize}</div>
			</div>
			<div className="download-info">
				<div className="download-file" onClick={downloadFile} >下载</div>
				<div className="download-app" onClick={downloadApp} >app打开</div>
			</div>
			{
				showDownloadHeaderTip
				? 	<Fragment>
						<div className="open-with-browser">
							<div className="text1">链接打不开?</div>
							<div className="text2">请点击右上角 <strong>. . .</strong></div>
							<div className="text2">选择在"浏览器"打开</div>
						</div>
						<div className="overlay" onClick={() => setShowDownloadHeaderTip(false)}></div>
					</Fragment>
				: null
			}
		</div>
	)
}

export default ShowFileInfo
