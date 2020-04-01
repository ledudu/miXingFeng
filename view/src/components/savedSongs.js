import React from 'react';
import { connect } from "react-redux";
import { useHistory } from "react-router-dom"
import NavBar from "./child/navbar";
import MusicPlayer from "./musicPlayer"
import { CONSTANT } from "../constants/enumeration"

const SavedSongs = ({ musicCollection=[] }) => {

	const history = useHistory()

	const handleMusicBackEventFunc = (isNav) => {
		if(!window.cancelMenuFirst){
			history.push("/my_download_middle_page")
		}
	}
	return (
		<div className="saved-song-container">
			<NavBar centerText="收藏" backToPreviousPage={handleMusicBackEventFunc} />
			<div className="saved-song-content">
				<MusicPlayer
					musicDataList={musicCollection}
					original={CONSTANT.musicOriginal.savedSongs}
					pageType={CONSTANT.musicOriginal.savedSongs}
					myMusicPage={true}
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
