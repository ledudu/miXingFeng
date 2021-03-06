import React, { useState, useRef, useEffect } from 'react';
import { connect } from "react-redux";
import StatusBar from "./child/statusBar";
import { confirm } from "../services/utils";
import { HTTP_URL } from "../constants/httpRoute";
import MusicPlayer from "./musicPlayer"
import { updateMusicSubmitStatus, updateMusicUploadProgress } from "../ducks/fileServer"
import { checkFileMD5Func, calcFileMD5, logActivity } from "../logic/common"
import { CONSTANT } from "../constants/enumeration"

const Music = ({ musicList, username, token, musicSubmitStatus, musicUploadProgress, setMobile }) => {

	const [MD5Value, setMD5Value] = useState("")
	const [MD5ValueError, setMD5ValueError] = useState(null)
	const [willUploadMusicSrc, setWillUploadMusicSrc] = useState(null)
	const fileToUploadRef = useRef()
	const willUploadMusicRef = useRef()
	let getMD5Time = 0, startToUpload = false

	useEffect(() => {
		const handleMD5 = (e) => {
			setMD5Value("")
			setMD5ValueError(null)
			return calcFileMD5(e.target.files[0])
				.then((resultObj) => {
					const { MD5Value, MD5ValueError } = resultObj
					logger.info("fileServer handleMD5 MD5Value", MD5Value)
					if(MD5Value && !MD5ValueError){
						setMD5Value(MD5Value)
					} else {
						setMD5ValueError(MD5ValueError)
					}
				})
		}
		fileToUploadRef.current.addEventListener('change', handleMD5, false);
		return () => {
			getMD5Time = null
			startToUpload = null
			fileToUploadRef.current.removeEventListener('change', handleMD5, false);
		}
	}, [])

	const uploadMusic = () => {
		try {
			const files = fileToUploadRef.current.files;
			if(!files[0]) return;
			if(!token){
				return window.goRoute(this, "/login")
			}
			if(!startToUpload){
				startToUpload = true;
				const filename = fileToUploadRef.current.files[0].name;
				const fileSize = fileToUploadRef.current.files[0].size;
				let overwriteSameMusicName = false;
				for(let item of musicList){
					if(item.filename === filename){
						overwriteSameMusicName = true;
						confirm(`提示`, `已经存在${filename}，上传将覆盖原音乐`, "确定", () => {
							logger.info("overwrite file true", item.filename);
							uploadMusicFunc(filename, fileSize, files)
						}, () => {
							logger.info("overwrite file false", item.filename);
							startToUpload = false;
							return;
						})
					}
				}
				if(!overwriteSameMusicName){
					uploadMusicFunc(filename, fileSize, files)
				}
			}
		} catch(err){
			logger.error("music uploadMusic err", err)
		}
	}

	const uploadMusicFunc = async(filename, fileSize, files) => {
		if (!/\.mp3$|\.MPEG$|\.OPUS$|\.OGG$|\.OGA$|\.WAV$|\.AAC$|\.CAF$|\.M4A$|\.MP4$|\.WEBA$|\.WEBM$|\.DOLBY$|\.FLAC$/gi.test(filename)) {
			const filenameArr = filename.split('.')
			if(filenameArr.length > 1){
				const extname = filenameArr.pop()
				alertDialog(`不支持的音乐文件后缀名: .${extname}`);
			} else {
				alertDialog("不支持上传无后缀名的音乐")
			}
			logger.info("不支持的音乐文件后缀名 filename", filename)
			startToUpload = false;
			return
		} else if (/#|%/g.test(filename)) {
			startToUpload = false;
			alertDialog("文件名不能包含%或#");
			return
		} else if (fileSize > 100* 1024 * 1024) {
			startToUpload = false;
			alertDialog('文件大小超过100M');
			return
		} else if(getMD5Time > 100 && !MD5Value ){
			$dispatch(updateMusicSubmitStatus("上传"))
			logger.warn("too long loop to generate md5")
			startToUpload = false;
			logger.error("文件不可读，请更换文件重试 filename, fileSize",  filename, fileSize)
			return alertDialog("文件不可读，请更换文件重试")
		}
		$dispatch(updateMusicSubmitStatus("上传中"))
		if(MD5Value){
			const willUploadMusicSrc = window.webkitURL.createObjectURL(files[0]);
			const checkResult = await checkFileMD5Func(filename, username || setMobile, MD5Value, "default-music", "music")
			if(checkResult === "缺少字段"){
				startToUpload = false;
				return alertDialog('缺少字段')
			}
			if(checkResult === "上传成功") {
				startToUpload = false;
				$dispatch(updateMusicSubmitStatus("上传"))
				logActivity({
					msg: "second upload music success"
				})
				return  alertDialog('秒传成功')
			}
			if(checkResult === "没有匹配"){
				setWillUploadMusicSrc(willUploadMusicSrc)
				let i = 0
				const getTimeInterval = setInterval(function () {
					i++;
					if(i > 100){
						clearInterval(getTimeInterval)
						alertDialog("文件读取错误, 请上传其他文件");
						logger.error("文件读取错误, 请上传其他文件 filename, fileSize", filename, fileSize)
						$dispatch(updateMusicSubmitStatus("上传"))
						$dispatch(updateMusicUploadProgress(''))
						startToUpload = false;
						return
					}
					const duration = willUploadMusicRef.current.duration;
					logger.info("uploadMusic duration, isNaN(duration)", duration, isNaN(duration))
					if(!isNaN(duration)){
						logger.info("uploadMusicFunc username, duration, MD5Value", username||setMobile, duration, MD5Value)
						clearInterval(getTimeInterval);
						const formData = new FormData();
						formData.append('files', files[0]);
						formData.append("username", username||setMobile);
						formData.append("type", 'music');
						formData.append("duration", duration);
						formData.append("md5", MD5Value);
						formData.append("registrationID", localStorage.getItem("registrationID") || "");
						const xhr = new XMLHttpRequest();
						xhr.upload.addEventListener("progress", uploadProgress, false);
						xhr.addEventListener("error", uploadFailed, false);
						xhr.open('POST', HTTP_URL.uploadFile);
						xhr.onreadystatechange = function() {
							startToUpload = false;
							logger.info('上传成功' + xhr.responseText);
							if (xhr.status === 200) {
								if (xhr.responseText.response === "illegal_filetype") {
									alertDialog(`不支持的文件后缀名: ${filename.split('.').pop()}`);
								} else if (xhr.responseText.response === "illegal_filename") {
									alertDialog('文件名不得含有%或#');
								} else if (xhr.responseText.response === "more_than_100mb") {
									alertDialog('文件大小超过100MB');
								} else {
									logActivity({
										msg: "upload music success"
									})
									alert('上传成功！');
								}
							} else {
								alertDialog('上传失败')
								logger.error("music upload fail xhr", xhr)
							}
							$dispatch(updateMusicSubmitStatus("上传"))
							$dispatch(updateMusicUploadProgress(''))
						};
						xhr.send(formData);
					}
				}, 20);
			}
		} else {
			if(MD5ValueError){
				startToUpload = false;
				$dispatch(updateMusicSubmitStatus("上传"))
				alertDialog("文件不可读，请更换文件重试");
				return
			} else {
				getMD5Time++
				setTimeout(() => uploadMusicFunc(filename, fileSize, files), 300)
			}
		}
	}

	const uploadProgress = (evt) => {
		if (evt.lengthComputable) {
			const percentComplete = Math.round(evt.loaded * 100 / evt.total);
			$dispatch(updateMusicUploadProgress( percentComplete.toString() + '%'))
		} else {
			uploadFailed()
		}
	}

	const uploadFailed = () => {
		alertDialog("上传失败");
		$dispatch(updateMusicSubmitStatus("上传"))
		$dispatch(updateMusicUploadProgress('失败'))
		startToUpload = false;
	}

	return (
		<div className="music-container">
			<StatusBar />
			<div className="music-header">音乐列表</div>
			<div className="upload-area">
				<input type="file" className="file-to-upload" ref={fileToUploadRef} />
				<div className="upload">
					<input type="button" name="submit" value={musicSubmitStatus} onClick={uploadMusic} />
					<div className='progress-number'>{musicUploadProgress}</div>
				</div>
			</div>
			<audio className="will-upload-music" ref={willUploadMusicRef}  src={willUploadMusicSrc} ></audio>
			<MusicPlayer musicDataList={musicList} original={CONSTANT.musicOriginal.musicShare} pageType={CONSTANT.musicOriginal.musicShare} />
		</div>
	)

}

const mapStateToProps = state => {
    return {
		musicList: state.fileServer.musicList,
		username: state.login.username,
		token: state.login.token,
		musicSubmitStatus: state.fileServer.musicSubmitStatus,
		musicUploadProgress: state.fileServer.musicUploadProgress,
		setMobile: state.myInfo.setMobile,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Music);
