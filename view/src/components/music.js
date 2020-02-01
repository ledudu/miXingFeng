import React from 'react';
import { connect } from "react-redux";
import StatusBar from "./child/statusBar";
import { onBackKeyDown, confirm } from "../services/utils";
import { HTTP_URL } from "../constants/httpRoute";
import MusicPlayer from "./musicPlayer"
import { updateMusicSubmitStatus, updateMusicUploadProgress } from "../ducks/fileServer"
import { checkFileMD5Func, calcFileMD5, checkSongSavedFunc } from "../logic/common"
import { CONSTANT } from "../constants/enumeration"

class Music extends React.Component {

    constructor(props){
		super(props)
        this.state = {
			willUploadMusicSrc: "",
			MD5Value: "",
			MD5ValueError: null
		}
    }

    componentDidMount(){
		document.addEventListener("deviceready", this.listenBackFunc);
		this.el = document.getElementById('fileToUpload');
		this.el.addEventListener('change', this.handleMD5, false);
		this.getMD5Time = 0
    }

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackFunc);
		document.removeEventListener("backbutton", onBackKeyDown);
		this.el.removeEventListener('change', this.handleMD5, false);
		this.getMD5Time = null
	}

    listenBackFunc = () => {
        document.addEventListener("backbutton", onBackKeyDown, false);
	}

	handleMD5 = (e) => {
		this.setState({
			MD5Value: "",
			MD5ValueError: null
		})
		return calcFileMD5(e.target.files[0])
			.then((resultObj) => {
				const { MD5Value, MD5ValueError } = resultObj
				if(MD5Value && !MD5ValueError){
					this.setState({
						MD5Value
					})
				} else {
					this.setState({
						MD5ValueError
					})
				}
			})
	}

	uploadMusic = () => {
		try {
			const files = $('#fileToUpload')[0].files;
			if(!files[0]) return;
			const { username, token, musicList } = this.props;
			if(!username || !token){
				alert("请先登录");
				return;
			}
			if(!this.startToUpload){
				this.startToUpload = true;
				const filename = $('#fileToUpload')[0].files[0].name;
				const fileSize = $('#fileToUpload')[0].files[0].size;
				let overwriteSameMusicName = false;
				for(let item of musicList){
					if(item.filename === filename){
						overwriteSameMusicName = true;
						confirm(`提示`, `已经存在${filename}，上传将覆盖原音乐`, "确定", () => {
							logger.info("overwrite file true", item.filename);
							this.uploadMusicFunc(filename, fileSize, files)
						}, () => {
							logger.info("overwrite file false", item.filename);
							this.startToUpload = false;
							return;
						})
					}
				}
				if(!overwriteSameMusicName){
					this.uploadMusicFunc(filename, fileSize, files)
				}
			}
		} catch(err){
			logger.error("uploadMusic err", err)
		}
	}

	uploadMusicFunc = async(filename, fileSize, files) => {
		const self = this;
		const { MD5Value, MD5ValueError } = this.state;
		const { username } = this.props;
		if (!/\.mp3$|\.MPEG$|\.OPUS$|\.OGG$|\.OGA$|\.WAV$|\.AAC$|\.CAF$|\.M4A$|\.MP4$|\.WEBA$|\.WEBM$|\.DOLBY$|\.FLAC$/gi.test(filename)) {
			alert(`不支持的音乐文件后缀名: .${filename.split('.').pop()}`);
			this.startToUpload = false;
			return
		} else if (/#|%/g.test(filename)) {
			this.startToUpload = false;
			alert("文件名不能包含%或#");
			return
		} else if (fileSize > 100* 1024 * 1024) {
			this.startToUpload = false;
			alert('文件大小超过100M');
			return
		} else if(this.getMD5Time > 100 && !MD5Value ){
			$dispatch(updateMusicSubmitStatus("上传"))
			logger.warn("too long loop to generate md5")
			this.startToUpload = false;
			return alert("文件不可读，请更换文件重试")
		}
		$dispatch(updateMusicSubmitStatus("上传中"))
		if(MD5Value){
			const willUploadMusicSrc = window.webkitURL.createObjectURL(files[0]);
			const checkResult = await checkFileMD5Func(filename, username, MD5Value, "default-music", "music")
			if(checkResult === "缺少字段"){
				this.startToUpload = false;
				return alert('缺少字段')
			}
			if(checkResult === "上传成功") {
				this.startToUpload = false;
				$dispatch(updateMusicSubmitStatus("上传"))
				return  alert('上传成功')
			}
			if(checkResult === "没有匹配"){
				this.setState({
					willUploadMusicSrc
				}, () => {
					let i = 0
					const getTimeInterval = setInterval(function () {
						i++;
						if(i > 100){
							clearInterval(getTimeInterval)
							alert("文件读取错误, 请上传其他文件");
							logger.warn('"文件读取错误, 请上传其他文件"')
							$dispatch(updateMusicSubmitStatus("上传"))
							$dispatch(updateMusicUploadProgress(''))
							self.startToUpload = false;
							return
						}
						const duration = $(".will-upload-music")[0].duration;
						logger.info("uploadMusic duration", duration)
						if(!isNaN(duration)){
							clearInterval(getTimeInterval);
							const formData = new FormData();
							formData.append('files', files[0]);
							formData.append("username", username);
							formData.append("type", 'music');
							formData.append("duration", duration);
							formData.append("md5", MD5Value);
							formData.append("registrationID", localStorage.getItem("registrationID") || "");
							const xhr = new XMLHttpRequest();
							xhr.upload.addEventListener("progress", self.uploadProgress, false);
							xhr.addEventListener("error", self.uploadFailed, false);
							xhr.open('POST', HTTP_URL.uploadFile);
							xhr.onreadystatechange = function() {
								self.startToUpload = false;
								logger.info('上传成功' + xhr.responseText);
								if (xhr.status === 200) {
									if (xhr.responseText.response === "illegal_filetype") {
										alert(`不支持的文件后缀名: ${filename.split('.').pop()}`);
									} else if (xhr.responseText.response === "illegal_filename") {
										alert('非法的文件名');
									} else if (xhr.responseText.response === "more_than_100mb") {
										alert('文件大小超过100MB');
									} else {
										alert('上传成功！');
									}
									$dispatch(updateMusicSubmitStatus("上传"))
									$dispatch(updateMusicUploadProgress(''))
								} else {
									alert('上传失败')
									logger.error("music upload fail xhr", xhr)
								}
							};
							xhr.send(formData);
						}
					}, 20);
				})
			}
		} else {
			if(MD5ValueError){
				this.startToUpload = false;
				$dispatch(updateMusicSubmitStatus("上传"))
				alert("文件不可读，请更换文件重试");
				return
			} else {
				this.getMD5Time++
				setTimeout(() => this.uploadMusicFunc(filename, fileSize, files), 300)
			}
		}
	}

	uploadProgress = (evt) => {
		if (evt.lengthComputable) {
			const percentComplete = Math.round(evt.loaded * 100 / evt.total);
			$dispatch(updateMusicUploadProgress( percentComplete.toString() + '%'))
		} else {
			this.uploadFailed()
		}
	}

	uploadFailed = () => {
		alert("上传失败");
		$dispatch(updateMusicSubmitStatus("上传"))
		$dispatch(updateMusicUploadProgress('失败'))
		this.startToUpload = false;
	}

    render() {
		const { willUploadMusicSrc } = this.state;
		const { musicList, musicSubmitStatus, musicUploadProgress } = this.props
		checkSongSavedFunc(musicList, CONSTANT.musicOriginal.musicShare)
        return (
            <div className="music-container">
                <StatusBar />
                <div className="music-header">音乐列表</div>
				<div className="upload-area">
                    <input type="file" id="fileToUpload" style={{"backgroundImage": "none"}} />
                    <div className="upload">
                        <input type="button" name="submit" value={musicSubmitStatus} onClick={this.uploadMusic} />
                        <div className='progress-number'>{musicUploadProgress}</div>
                    </div>
                </div>
				<audio className="will-upload-music" src={willUploadMusicSrc} style={{"display": "none"}}></audio>
				<MusicPlayer musicDataList={musicList} original={CONSTANT.musicOriginal.musicShare}  pageType={CONSTANT.musicOriginal.musicShare} />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
		musicList: state.fileServer.musicList,
		username: state.login.username,
		token: state.login.token,
		musicSubmitStatus: state.fileServer.musicSubmitStatus,
		musicUploadProgress: state.fileServer.musicUploadProgress,
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Music);
