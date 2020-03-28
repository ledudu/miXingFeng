import React, { useEffect } from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import NavBar from "./child/navbar";
import MusicPlayer from "./musicPlayer"
import { CONSTANT } from "../constants/enumeration"
import { specialBackFunc } from "../services/utils"

const SavedSongs = ({ musicCollection=[] }) => {

	const history = useHistory()

	useEffect(() => {
		document.addEventListener("deviceready", listenBackButton, false);
		return () => {
			document.removeEventListener("deviceready", listenBackButton, false);
			document.removeEventListener("backbutton", handleMusicBackEventFunc, false)
		}
	}, [])

	const listenBackButton = () => {
		document.addEventListener("backbutton", handleMusicBackEventFunc, false)
	}

	const handleMusicBackEventFunc = (isNav) => {
		if(!window.cancelMenuFirst){
			if(isNav !== "nav") specialBackFunc()
			history.push("/my_download_middle_page")
		}
	}
	return (
		<div className="saved-song-container">
			<NavBar centerText="收藏" backToPreviousPage={handleMusicBackEventFunc.bind(null, "nav")} />
			<div className="saved-song-content">
				<MusicPlayer
					musicDataList={musicCollection}
					original={CONSTANT.musicOriginal.savedSongs}
					pageType={CONSTANT.musicOriginal.savedSongs}
				/>
			</div>
		</div>
	);
}

const mapStateToProps = state => {
    return {
		musicCollection: state.fileServer.musicCollection
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SavedSongs);
