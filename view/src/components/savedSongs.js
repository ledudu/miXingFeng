import React from 'react';
import { connect } from "react-redux";
import NavBar from "./child/navbar";
import MusicPlayer from "./musicPlayer"
import { CONSTANT } from "../constants/enumeration"

class SavedSongs extends React.Component {

	backToMainPage = () => {
		window.goRoute(this, "/my_download_middle_page");
	}

	render() {
		const { musicCollection=[] } = this.props;
		musicCollection.forEach(item => delete item.saved)
        return (
            <div className="saved-song-container">
                <NavBar centerText="收藏" backToPreviousPage={this.backToMainPage} />
                <div className="saved-song-content">
					<MusicPlayer
						musicDataList={musicCollection}
						original={CONSTANT.musicOriginal.savedSongs}
						pageType={CONSTANT.musicOriginal.savedSongs}
						self={this}
					/>
				</div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
		musicCollection: state.fileServer.musicCollection
    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SavedSongs);
