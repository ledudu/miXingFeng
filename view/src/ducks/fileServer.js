//actionType
const FILE_LIST = "fileServer/fileList";
const MUSIC_LIST = "fileServer/musicList"
const SOUND_PLAYING = "fileServer/soundPlaying"
const SOUND_INSTANCE = "fileServer/soundInstance"
const SOUND_INSTANCE_ID = "fileServer/soundInstanceId"
const CURRENT_PLAYING_SONG = "fileServer/currentPlayingSong"
const CURRENT_SONG_TIME = "fileServer/currentSongTime"
const PAUSE_WHEN_OVER = "fileServer/pauseWhenOver"
const MUSIC_MENU_BADGE = "fileServer/musicMenuBadge"
const PLAY_BY_ORDER = "fileServer/playByOrder"
const MUSIC_COLLECTION = "fileServer/musicCollection"
const FILE_SUBMIT_STATUS = "fileServer/fileSubmitStatus"
const FILE_UPLOAD_PROGRESS = "fileServer/fileUploadProgress"
const MUSIC_SUBMIT_STATUS = "fileServer/musicSubmitStatus"
const MUSIC_UPLOAD_PROGRESS = "fileServer/musicUploadProgress"
const CURRENT_PLAYING_MUSIC_LIST = "fileServer/currentPlayingMusicList"
const PLAY_BY_RANDOM = "fileServer/playByRandom"
const LAST_NET_EASE_CLOUD_SEARCH_RESULT = "fileServer/lastNetEaseCloudSearchResult"
const LAST_QQ_MUSIC_SEARCH_RESULT = "fileServer/lastQQMusicSearchResult"
const LAST_KU_GOU_MUSIC_SEARCH_RESULT = "fileServer/lastKuGouMusicSearchResult"
const LAST_KU_WO_MUSIC_SEARCH_RESULT = "fileServer/lastKuWoMusicSearchResult"
const LAST_ONLINE_MUSIC_SEARCH_STRING = "fileServer/lastOnlineMusicSearchString"
const LAST_FILE_SEARCH_RESULT = "fileServer/lastFileSearchResult"
const LAST_FILE_SEARCH_STRING = "fileServer/lastFileSearchString"
const LAST_MUSIC_SEARCH_RESULT = "fileServer/lastMusicSearchResult"
const LAST_MUSIC_SEARCH_STRING = "fileServer/lastMusicSearchString"
const NO_MORE_NET_EASE_CLOUD_RESULT = "fileServer/noMoreNetEaseCloudResults"
const NO_MORE_QQ_MUSIC_RESULT = "fileServer/noMoreQQMusicResults"
const NO_MORE_KU_GOU_MUSIC_RESULT = "fileServer/noMoreKuGouMusicResults"
const NO_MORE_KU_WO_MUSIC_RESULT = "fileServer/noMoreKuWoMusicResults"
const LAST_SEARCH_ALL_SEARING_STRING = "fileServer/lastSearchAllSearchString"
const LAST_SEARCH_ALL_FILE_RESULT = "fileServer/lastSearchAllFileResult"
const LAST_SEARCH_ALL_MUSIC_RESULT = "fileServer/lastSearchAllMusicResult"
const LAST_SEARCH_ALL_NET_EASE_CLOUD_RESULT = "fileServer/lastSearchAllNetEaseCloudResult"
const LAST_SEARCH_ALL_QQ_MUSIC_SEARCH_RESULT = "fileServer/lastSearchAllQQMusicSearchResult"
const LAST_SEARCH_ALL_KU_GOU_MUSIC_SEARCH_RESULT = "fileServer/lastSearchAllKuGouMusicSearchResult"
const LAST_SEARCH_ALL_KU_WO_MUSIC_SEARCH_RESULT = "fileServer/lastSearchAllKuWoMusicSearchResult"
const NO_MORE_SEARCH_ALL_FILE_RESULTS = "fileServer/noMoreSearchAllFileResults"
const NO_MORE_SEARCH_ALL_MUSIC_RESULTS = "fileServer/noMoreSearchAllMusicResults"
const NO_MORE_SEARCH_ALL_NET_EASE_CLOUD_RESULTS = "fileServer/noMoreSearchAllNetEaseCloudResults"
const NO_MORE_SEARCH_ALL_QQ_MUSIC_SEARCH_RESULTS = "fileServer/noMoreSearchAllQQMusicResults"
const NO_MORE_SEARCH_ALL_KU_GOU_MUSIC_SEARCH_RESULTS = "fileServer/noMoreSearchAllKuGouMusicResults"
const NO_MORE_SEARCH_ALL_KU_WO_MUSIC_SEARCH_RESULTS = "fileServer/noMoreSearchAllKuWoMusicResults"
const DOWNLOADING_MUSIC_ITEMS = "fileServer/downloadingMusicItems"
const DOWNLOADED_MUSIC_LIST = "fileServer/downloadedMusicList"
const CURRENT_PLAYING_SONG_ORIGINAL = "fileServer/currentPlayingSongOriginal"
const CURRENT_PLAYING_SONG_DURATION = "fileServer/currentPlayingSongDuration"
const MUSIC_PAGE_TYPE = "fileServer/musicPageType"
const RECENT_MUSIC_LIST = "fileServer/recentMusicList"
const CURRENT_MUSIC_ITEM_INFO = "fileServer/currentMusicItemInfo"
const IS_HEAD_PHONE_VIEW = "fileServer/isHeadPhoneView"
const DOWNLOADED_FILE_LIST = "fileServer/downloadedFileList"
const DOWNLOADING_FILE_LIST = "fileServer/downloadingFileList"
const SHOW_MUSIC_PLAYING_FROM_MUSIC_CONTROL  = "fileServer/showMusicPlayingFromMusicControl"

let musicCollection= [], fileList=[], musicList=[], downloadedMusicList=[], downloadingMusicItems=[]
try {musicCollection = localStorage.getItem("favoriteSongs") ? JSON.parse(localStorage.getItem("favoriteSongs")) : []} catch(err){ musicCollection = []}
try {fileList = localStorage.getItem("fileList") ? JSON.parse(localStorage.getItem("fileList")) : []} catch(err){fileList=[]}
try {musicList = localStorage.getItem("musicList") ? JSON.parse(localStorage.getItem("musicList")) : []} catch(err){musicList=[]}

// initialSate
const initialState = () => ({
	fileList,
	musicList,
	soundPlaying: false,
	soundInstance: null,
	soundInstanceId: null,
	currentPlayingSong: null,
	currentSongTime: 0,
	pauseWhenOver: true,
	musicMenuBadge: [
		{
			index: 2,
			text: '',
		}, {
			index: 3,
			text: '',
		}, {
			index: 4,
			text: '✔️',
		}, {
			index: 5,
			text: '',
		}
	],
	playByOrder: true,
	musicCollection,
	fileSubmitStatus: "上传",
	fileUploadProgress: "",
	musicSubmitStatus: "上传",
	musicUploadProgress: "",
	currentPlayingMusicList: [],
	playByRandom: false,
	lastNetEaseCloudSearchResult: [],
	lastQQMusicSearchResult: [],
	lastKuGouMusicSearchResult: [],
	lastKuWoMusicSearchResult: [],
	lastOnlineMusicSearchString: "",
	lastFileSearchResult: [],
	lastFileSearchString: "",
	lastMusicSearchResult: [],
	lastMusicSearchString: "",
	noMoreNetEaseCloudResults: false,
	noMoreQQMusicResults: false,
	noMoreKuGouMusicResults: false,
	noMoreKuWoMusicResults: false,
	lastSearchAllSearchString: "",
	lastSearchAllFileResult: [],
	lastSearchAllMusicResult: [],
	lastSearchAllNetEaseCloudResult: [],
	lastSearchAllQQMusicSearchResult: [],
	lastSearchAllKuGouMusicSearchResult: [],
	lastSearchAllKuWoMusicSearchResult: [],
	noMoreSearchAllFileResults: false,
	noMoreSearchAllMusicResults: false,
	noMoreSearchAllNetEaseCloudResults: false,
	noMoreSearchAllQQMusicResults: false,
	noMoreSearchAllKuGouMusicResults: false,
	noMoreSearchAllKuWoMusicResults: false,
	downloadingMusicItems: [],
	downloadedMusicList: [],
	currentPlayingSongOriginal: "",
	currentPlayingSongDuration: "",
	musicPageType: "",
	recentMusicList: [],
	currentMusicItemInfo: {},
	isHeadPhoneView: true,
	downloadedFileList: [],
	downloadingFileList: [],
	showMusicPlayingFromMusicControl: false
});

// Reducer
export default function reducer(state = initialState(), action = {}) {
	switch (action.type) {
		case FILE_LIST:
			localStorage.setItem("fileList", JSON.stringify(action.data.slice(0, 50)))
			return Object.assign({}, state, {fileList: action.data});
		case MUSIC_LIST:
			localStorage.setItem("musicList", JSON.stringify(action.data.slice(0, 50)))
			return Object.assign({}, state, {musicList: action.data});
		case SOUND_PLAYING:
			return Object.assign({}, state, {soundPlaying: action.data});
		case SOUND_INSTANCE:
			return Object.assign({}, state, {soundInstance: action.data});
		case SOUND_INSTANCE_ID:
			return Object.assign({}, state, {soundInstanceId: action.data});
		case CURRENT_PLAYING_SONG:
			return Object.assign({}, state, {currentPlayingSong: action.data});
		case CURRENT_SONG_TIME:
			return Object.assign({}, state, {currentSongTime: action.data});
		case PAUSE_WHEN_OVER:
			if(action.data === true){
				localStorage.setItem("pauseWhenOver", 'yes')
			} else if(action.data === false){
				localStorage.setItem("pauseWhenOver", 'no')
			}
			return Object.assign({}, state, {pauseWhenOver: action.data});
		case MUSIC_MENU_BADGE:
			return Object.assign({}, state, {musicMenuBadge: action.data});
		case PLAY_BY_ORDER:
			if(action.data === true){
				localStorage.setItem("playByOrder", 'yes')
			} else if(action.data === false){
				localStorage.setItem("playByOrder", 'no')
			}
			return Object.assign({}, state, {playByOrder: action.data});
		case MUSIC_COLLECTION:
			localStorage.setItem("favoriteSongs", JSON.stringify(action.data))
			return Object.assign({}, state, {musicCollection: action.data});
		case FILE_SUBMIT_STATUS:
			return Object.assign({}, state, {fileSubmitStatus: action.data});
		case FILE_UPLOAD_PROGRESS:
			return Object.assign({}, state, {fileUploadProgress: action.data});
		case MUSIC_SUBMIT_STATUS:
			return Object.assign({}, state, {musicSubmitStatus: action.data});
		case MUSIC_UPLOAD_PROGRESS:
			return Object.assign({}, state, {musicUploadProgress: action.data});
		case DOWNLOADING_MUSIC_ITEMS:
			localStorage.setItem("downloadingMusicItems", JSON.stringify(action.data.slice(0, 50)))
			return Object.assign({}, state, {downloadingMusicItems: action.data});
		case CURRENT_PLAYING_MUSIC_LIST:
			return Object.assign({}, state, {currentPlayingMusicList: action.data});
		case PLAY_BY_RANDOM:
			if(action.data === true){
				localStorage.setItem("playByRandom", 'yes')
			} else if(action.data === false){
				localStorage.setItem("playByRandom", 'no')
			}
			return Object.assign({}, state, {playByRandom: action.data});
		case LAST_NET_EASE_CLOUD_SEARCH_RESULT:
			return Object.assign({}, state, {lastNetEaseCloudSearchResult: action.data});
		case LAST_QQ_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastQQMusicSearchResult: action.data});
		case LAST_KU_GOU_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastKuGouMusicSearchResult: action.data});
		case LAST_KU_WO_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastKuWoMusicSearchResult: action.data});
		case LAST_ONLINE_MUSIC_SEARCH_STRING:
			return Object.assign({}, state, {lastOnlineMusicSearchString: action.data});
		case LAST_FILE_SEARCH_RESULT:
			return Object.assign({}, state, {lastFileSearchResult: action.data});
		case LAST_FILE_SEARCH_STRING:
			return Object.assign({}, state, {lastFileSearchString: action.data});
		case LAST_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastMusicSearchResult: action.data});
		case LAST_MUSIC_SEARCH_STRING:
			return Object.assign({}, state, {lastMusicSearchString: action.data});
		case NO_MORE_NET_EASE_CLOUD_RESULT:
			return Object.assign({}, state, {noMoreNetEaseCloudResults: action.data});
		case NO_MORE_QQ_MUSIC_RESULT:
			return Object.assign({}, state, {noMoreQQMusicResults: action.data});
		case NO_MORE_KU_GOU_MUSIC_RESULT:
			return Object.assign({}, state, {noMoreKuGouMusicResults: action.data});
		case NO_MORE_KU_WO_MUSIC_RESULT:
			return Object.assign({}, state, {noMoreKuWoMusicResults: action.data});
		case LAST_SEARCH_ALL_SEARING_STRING:
			return Object.assign({}, state, {lastSearchAllSearchString: action.data});
		case LAST_SEARCH_ALL_FILE_RESULT:
			return Object.assign({}, state, {lastSearchAllFileResult: action.data});
		case LAST_SEARCH_ALL_MUSIC_RESULT:
			return Object.assign({}, state, {lastSearchAllMusicResult: action.data});
		case LAST_SEARCH_ALL_NET_EASE_CLOUD_RESULT:
			return Object.assign({}, state, {lastSearchAllNetEaseCloudResult: action.data});
		case LAST_SEARCH_ALL_QQ_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastSearchAllQQMusicSearchResult: action.data});
		case LAST_SEARCH_ALL_KU_GOU_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastSearchAllKuGouMusicSearchResult: action.data})
		case LAST_SEARCH_ALL_KU_WO_MUSIC_SEARCH_RESULT:
			return Object.assign({}, state, {lastSearchAllKuWoMusicSearchResult: action.data})
		case NO_MORE_SEARCH_ALL_FILE_RESULTS:
			return Object.assign({}, state, {noMoreSearchAllFileResults: action.data});
		case NO_MORE_SEARCH_ALL_MUSIC_RESULTS:
			return Object.assign({}, state, {noMoreSearchAllMusicResults: action.data});
		case NO_MORE_SEARCH_ALL_NET_EASE_CLOUD_RESULTS:
			return Object.assign({}, state, {noMoreSearchAllNetEaseCloudResults: action.data});
		case NO_MORE_SEARCH_ALL_QQ_MUSIC_SEARCH_RESULTS:
			return Object.assign({}, state, {noMoreSearchAllQQMusicResults: action.data});
		case NO_MORE_SEARCH_ALL_KU_GOU_MUSIC_SEARCH_RESULTS:
			return Object.assign({}, state, {noMoreSearchAllKuGouMusicResults: action.data});
		case NO_MORE_SEARCH_ALL_KU_WO_MUSIC_SEARCH_RESULTS:
			return Object.assign({}, state, {noMoreSearchAllKuWoMusicResults: action.data});
		case DOWNLOADED_MUSIC_LIST:
			localStorage.setItem("downloadedMusicList", JSON.stringify(action.data.slice(0, 50)))
			return Object.assign({}, state, {downloadedMusicList: action.data});
		case CURRENT_PLAYING_SONG_ORIGINAL:
			return Object.assign({}, state, {currentPlayingSongOriginal: action.data});
		case CURRENT_PLAYING_SONG_DURATION:
			return Object.assign({}, state, {currentPlayingSongDuration: action.data});
		case MUSIC_PAGE_TYPE:
			return Object.assign({}, state, {musicPageType: action.data});
		case RECENT_MUSIC_LIST:
			return Object.assign({}, state, {recentMusicList: action.data});
		case CURRENT_MUSIC_ITEM_INFO:
			return Object.assign({}, state, {currentMusicItemInfo: action.data});
		case IS_HEAD_PHONE_VIEW:
			return Object.assign({}, state, {isHeadPhoneView: action.data});
		case DOWNLOADED_FILE_LIST:
			localStorage.setItem("downloadedFileList", JSON.stringify(action.data.slice(0, 50)))
			return Object.assign({}, state, {downloadedFileList: action.data});
		case DOWNLOADING_FILE_LIST:
			localStorage.setItem("downloadingFileList", JSON.stringify(action.data.slice(0, 50)))
			return Object.assign({}, state, {downloadingFileList: action.data});
		case SHOW_MUSIC_PLAYING_FROM_MUSIC_CONTROL:
			return Object.assign({}, state, {showMusicPlayingFromMusicControl: action.data});
		default:
			return state;
	}
}

// update
export const updateFileList = data => ({
	type: FILE_LIST,
	data
});

export const updateMusicList = data => ({
	type: MUSIC_LIST,
	data
});

export const updateSoundPlaying = data => ({
	type: SOUND_PLAYING,
	data
});

export const updateSoundInstance= data => ({
	type: SOUND_INSTANCE,
	data
});

export const updateSoundInstanceId= data => ({
	type: SOUND_INSTANCE_ID,
	data
});

export const updateCurrentPlayingSong = data => ({
	type: CURRENT_PLAYING_SONG,
	data
});

export const updateCurrentSongTime = data => ({
	type: CURRENT_SONG_TIME,
	data
});

export const updatePauseWhenOver = data => ({
	type: PAUSE_WHEN_OVER,
	data
})

export const updateMusicMenuBadge = data => ({
	type: MUSIC_MENU_BADGE,
	data
})

export const updatePlayByOrder = data => ({
	type: PLAY_BY_ORDER,
	data
})

export const updateMusicCollection = data => ({
	type: MUSIC_COLLECTION,
	data
})

export const updateFileSubmitStatus= data => ({
	type: FILE_SUBMIT_STATUS,
	data
})

export const updateFileUploadProgress = data => ({
	type: FILE_UPLOAD_PROGRESS,
	data
})

export const updateMusicSubmitStatus= data => ({
	type: MUSIC_SUBMIT_STATUS,
	data
})

export const updateMusicUploadProgress = data => ({
	type: MUSIC_UPLOAD_PROGRESS,
	data
})

export const updateDownloadingMusicItems = data => ({
	type: DOWNLOADING_MUSIC_ITEMS,
	data
})

export const updateCurrentPlayingMusicList = data => ({
	type: CURRENT_PLAYING_MUSIC_LIST,
	data
})

export const updatePlayByRandom = data => ({
	type: PLAY_BY_RANDOM,
	data
})

export const updateLastNetEaseCloudSearchResult = data => ({
	type: LAST_NET_EASE_CLOUD_SEARCH_RESULT,
	data
})

export const updateLastQQMusicSearchResult = data => ({
	type: LAST_QQ_MUSIC_SEARCH_RESULT,
	data
})

export const updateLastKuGouMusicSearchResult = data => ({
	type: LAST_KU_GOU_MUSIC_SEARCH_RESULT,
	data
})

export const updateLastKuWoMusicSearchResult = data => ({
	type: LAST_KU_WO_MUSIC_SEARCH_RESULT,
	data
})

export const updateLastOnlineMusicSearchString= data => ({
	type: LAST_ONLINE_MUSIC_SEARCH_STRING,
	data
})

export const updateLastFileSearchResult = data => ({
	type: LAST_FILE_SEARCH_RESULT,
	data
})

export const updateLastFileSearchString = data => ({
	type: LAST_FILE_SEARCH_STRING,
	data
})

export const updateLastMusicSearchResult = data => ({
	type: LAST_MUSIC_SEARCH_RESULT,
	data
})

export const updateLastMusicSearchString = data => ({
	type: LAST_MUSIC_SEARCH_STRING,
	data
})

export const updateNoMoreNetEaseCloudResults = data => ({
	type: NO_MORE_NET_EASE_CLOUD_RESULT,
	data
})

export const updateNoMoreQQMusicResults = data => ({
	type: NO_MORE_QQ_MUSIC_RESULT,
	data
})

export const updateNoMoreKuGouMusicResults = data => ({
	type: NO_MORE_KU_GOU_MUSIC_RESULT,
	data
})

export const updateNoMoreKuWoMusicResults = data => ({
	type: NO_MORE_KU_WO_MUSIC_RESULT,
	data
})

export const updateLastSearchAllSearchString = data => ({
	type: LAST_SEARCH_ALL_SEARING_STRING,
	data
})

export const updateLastSearchAllFileResult = data => ({
	type: LAST_SEARCH_ALL_FILE_RESULT,
	data
})

export const updateLastSearchAllMusicResult = data => ({
	type: LAST_SEARCH_ALL_MUSIC_RESULT,
	data
})

export const updateLastSearchAllNetEaseCloudResult = data => ({
	type: LAST_SEARCH_ALL_NET_EASE_CLOUD_RESULT,
	data
})

export const updateLastSearchAllQQMusicSearchResult = data => ({
	type: LAST_SEARCH_ALL_QQ_MUSIC_SEARCH_RESULT,
	data
})

export const updateLastSearchAllKuGouMusicSearchResult = data => ({
	type: LAST_SEARCH_ALL_KU_GOU_MUSIC_SEARCH_RESULT,
	data
})

export const updateLastSearchAllKuWoMusicSearchResult = data => ({
	type: LAST_SEARCH_ALL_KU_WO_MUSIC_SEARCH_RESULT,
	data
})

export const updateNoMoreSearchAllFileResults = data => ({
	type: NO_MORE_SEARCH_ALL_FILE_RESULTS,
	data
})

export const updateNoMoreSearchAllMusicSearchResult = data => ({
	type: NO_MORE_SEARCH_ALL_MUSIC_RESULTS,
	data
})

export const updateNoMoreSearchAllNetEaseCloudResults = data => ({
	type: NO_MORE_SEARCH_ALL_NET_EASE_CLOUD_RESULTS,
	data
})

export const updateNoMoreSearchAllQQMusicResults = data => ({
	type: NO_MORE_SEARCH_ALL_QQ_MUSIC_SEARCH_RESULTS,
	data
})

export const updateNoMoreSearchAllKuGouMusicResults = data => ({
	type: NO_MORE_SEARCH_ALL_KU_GOU_MUSIC_SEARCH_RESULTS,
	data
})

export const updateNoMoreSearchAllKuWoMusicResults = data => ({
	type: NO_MORE_SEARCH_ALL_KU_WO_MUSIC_SEARCH_RESULTS,
	data
})

export const updateDownloadedMusicList = data => ({
	type: DOWNLOADED_MUSIC_LIST,
	data
})

export const updateCurrentPlayingSongOriginal = data => ({
	type: CURRENT_PLAYING_SONG_ORIGINAL,
	data
})

export const updateCurrentPlayingSongDuration = data => ({
	type: CURRENT_PLAYING_SONG_DURATION,
	data
})

export const updateMusicPageType = data => ({
	type: MUSIC_PAGE_TYPE,
	data
})

export const updateRecentMusicList = data => ({
	type: RECENT_MUSIC_LIST,
	data
})

export const updateCurrentMusicItemInfo = data => ({
	type: CURRENT_MUSIC_ITEM_INFO,
	data
})

export const updateIsHeadPhoneView = data => ({
	type: IS_HEAD_PHONE_VIEW,
	data
})

export const updateDownloadedFileList = data => ({
	type: DOWNLOADED_FILE_LIST,
	data
})

export const updateDownloadingFileList = data => ({
	type: DOWNLOADING_FILE_LIST,
	data
})

export const updateShowMusicPlayingFromMusicControl = data => ({
	type: SHOW_MUSIC_PLAYING_FROM_MUSIC_CONTROL,
	data
})
