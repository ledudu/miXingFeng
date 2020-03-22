import { HTTP_URL } from "../../constants/httpRoute";
import { networkErr, alert, saveFileToLocal, checkFileWritePriority, requestFileWritePriority } from "../../services/utils";
import { updateSetSex, updateSetBirthday, updateSetHeadPic, updateSetAddress, updateSetHeadPicName, updateReplaceHeadPic } from "../../ducks/myInfo";
import { Toast  } from 'antd-mobile';
import { CONSTANT } from "../../constants/enumeration";
import { updateToken } from "../../ducks/login"

export const saveUserInfoFunc = (name, info, self) => {
	const {username, token} = window.$getState().login;
	const {setMobile} = window.$getState().myInfo;
    if(!token) {
        return Toast.fail('请先登录', CONSTANT.toastTime);
    }
    if(name === 'sex'){
        info = info.join();
    } else if(name === 'birthday'){
        info = info.format("yyyy-MM-dd");
    } else if(name === "address"){
        info = info[2];
    }
	const data = Object.assign({}, {username: username || setMobile, token, userInfo: { [name]: info } })
	if(!self.startToSubmit){
		self.startToSubmit = true
		axios.post(HTTP_URL.updateUserInfo, data)
        	.then((response) => {
				self.startToSubmit = false
        	    if(response.data.result.response === "modify_success"){
        	        Toast.success('保存成功', CONSTANT.toastTime);
        	        if(name === 'sex'){
        	            window.$dispatch(updateSetSex(info));
        	        } else if(name === 'birthday'){
        	            window.$dispatch(updateSetBirthday(info));
        	        } else if(name === 'address'){
        	            window.$dispatch(updateSetAddress(info));
        	        }
        	    } else {
        	        Toast.fail('设置失败', CONSTANT.toastTime);
        	    }
        	})
        	.catch(err => {
				self.startToSubmit = false
				return networkErr(err, `saveUserInfoFunc updateUserInfo data: ${JSON.stringify(data)}`);
        	})
	}
}

export const getPhotoFunc = (index) => {
	if(window.isCordova){
		navigator.camera.getPicture(
			onPhotoURISuccess,
			function(error){logger.error("取消了上传头像", error)},
			{
				quality: 60,
				destinationType: navigator.camera.DestinationType.NATIVE_URI,
				sourceType: index ? navigator.camera.PictureSourceType.SAVEDPHOTOALBUM : navigator.camera.PictureSourceType.CAMERA,
				allowEdit:true,
				encodingType:Camera.EncodingType.JPEG,
				targetWidth:800,
				targetHeight:600,
				saveToPhotoAlbum: true
			}
		);
	}
}

const onPhotoURISuccess = (imageURI) => {
	const { username } = $getState().login;
	const { setMobile } = $getState().myInfo;
    logger.info('onPhotoURISuccess', imageURI);
    let options = new FileUploadOptions();
    options.chunkedMode = false;
    options.fileKey = "file";
    options.fileName = username || setMobile;
    options.mimeType = "image/jpeg";
    options.httpMethod = "POST";
    let fileTransfer = new FileTransfer();
    let successCallback = function (r) {
        logger.info("onPhotoURISuccess.response", JSON.parse(r.response));
        const result = JSON.parse(r.response).result
        if(result.response === "more_than_10mb"){
            return Toast.fail('图片大小不得超过10MB', CONSTANT.toastTime);
        } else if(result.response === "illegal_filename"){
            return Toast.fail('文件名不得含有%或#', CONSTANT.toastTime);
        } else if(result.response === "illegal_filetype"){
            return Toast.fail('图片不得上传非jpeg或png以外的格式', CONSTANT.toastTime);
        }
		$dispatch(updateSetHeadPic(result.newFilePath));
		$dispatch(updateReplaceHeadPic(true));
		$dispatch(updateToken(result.token));
		saveHeadPicToLocal(result.newFilePath, username || setMobile, 'onPhotoURISuccess');
        Toast.success('上传成功', CONSTANT.toastTime);
    }
    let errorCallback = function (error) {
		Toast.fail("上传失败", CONSTANT.toastTime)
        logger.error("An error has occurred: Code = " + error.code);
        logger.error("upload error source " + error.source);
        logger.error("upload error target " + error.target);
    }
    fileTransfer.upload(
        imageURI, //本地文件路径
        encodeURI(HTTP_URL.uploadPic), //服务器上传的路径
        successCallback, //成功的回调
        errorCallback, //失败的回调
        options //配置项
    );
}

export const searchShellCommand = (self, command) => {
	const { username, token } = $getState().login;
	const { setRole, setMobile } = $getState().myInfo;
	if(!token) return alert("请先登录");
	if(!command) return;
	const data = Object.assign({ username: username||setMobile, token, command, role: setRole })
	logger.info('searchShellCommand data', data)
	self.setState({
		isSearching: true
	})
    return axios.post(HTTP_URL.rpcCall, data)
        .then((response) => {
			switch (response.data.result.response){
				case "no_username_or_token":
					alert("请先登录")
					break;
				case "no_command":
					alert("请输入命令")
					break;
				case "403_forbidden":
					alert("只能输入指定的命令");
					break;
				default:
					self.setState({
						shellResponse: response.data.result.response,
						isSearching: false
					})
			}
        })
        .catch(err => {
			self.setState({
				isSearching: true
			})
			logger.error('err', err)
            return networkErr(err, `rpcCall data: ${data}`);
		})
		.finally(() => {
			self.setState({
				isSearching: false
			})
		})
}

export const showHeadPic = (setHeadPic, headPicAddress, setHeadPicName) => {
	if(setHeadPic){
		if(/^http/.test(setHeadPic)){
			logger.warn("/^http/.test(setHeadPic) userProfile", true)
			headPicAddress = setHeadPic
		} else {
			if(window.isCordova){
				device.platform === "Android"
				?	headPicAddress = "/storage/emulated/0/miXingFeng/avatar/" + setHeadPicName
				: 	headPicAddress = window.serverHost + "/" + setHeadPic
			} else {
				headPicAddress = window.serverHost + "/" + setHeadPic
			}
		}
	}
	return headPicAddress;
}

export const saveHeadPicToLocal = (headPicAddress, username, logInfo="") => {
	const extname = headPicAddress.split(".")[headPicAddress.split(".").length - 1];
	const setHeadPicName = `${username}.${extname}`;
	logger.info(`${logInfo} setHeadPicName`, setHeadPicName)
	window.$dispatch(updateSetHeadPicName(setHeadPicName));
	let headPicAddressFull = window.serverHost + "/" + headPicAddress
	return checkFileWritePriority()
		.then(bool => {
			if(bool){
				saveFileToLocal(setHeadPicName, headPicAddressFull, 'avatar');
			} else {
				return alertDialog("请授予文件读写权限，否则不能下载头像", "", "知道了", requestFileWritePriority)
			}
		})
}
