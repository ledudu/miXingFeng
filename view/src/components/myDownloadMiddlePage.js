import React from 'react';
import SquareMiddlePageComponent from "./child/squareMiddlePageComponent";

const itemColumns = [
	{
		displayName: "收藏",
		routeName: "/saved_songs",
		fa: "fa-heart"
	},
	{
		displayName: "下载",
		routeName: "/my_finished_musics",
		fa: "fa-download"
	},
	{
		displayName: "最近播放",
		routeName: "/recent_music_played",
		fa: "fa-play-circle"
	},
	{
		displayName: "正在播放",
		routeName: "/music_playing",
		fa: "fa-bar-chart"
	},
]

class MyDownloadMiddlePage extends React.Component {

	render() {
        return (
            <div className="my-download-outside-container">
				<SquareMiddlePageComponent
					pageName="音乐"
					itemColumns={itemColumns}
					self={this}
				/>
				<div className="music-logo">

				</div>
            </div>
        );
	}
}

export default MyDownloadMiddlePage;
