import React from 'react';
import SquareMiddlePageComponent from "./child/squareMiddlePageComponent";

const itemColumns = [
	{
		displayName: "文件",
		routeName: "/my_finished_files"
	},
	{
		displayName: "音乐",
		routeName: "/my_finished_musics"
	},
	{
		displayName: "最近播放",
		routeName: "/recent_music_played"
	},
]

class MyDownloadMiddlePage extends React.Component {

	render() {
        return (
            <div className="my-download-outside-container">
				<SquareMiddlePageComponent
					pageName="下载"
					itemColumns={itemColumns}
					self={this}
				/>
            </div>
        );
	}
}

export default MyDownloadMiddlePage;
