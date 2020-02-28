import React from 'react';
import SquareMiddlePageComponent from "./child/squareMiddlePageComponent";

const itemColumns = [
	{
		displayName: "历史签到",
		routeName: "/search_user_history",
		fa: "fa-sign-in"
	},
	{
		displayName: "地理位置",
		routeName: "/search_position",
		fa: "fa-location-arrow"
	},
	{
		displayName: "共享文件",
		routeName: "/search_file",
		fa: "fa-file"
	},
	{
		displayName: "共享音乐",
		routeName: "/search_music",
		fa: "fa-music"
	},
	{
		displayName: "在线音乐",
		routeName: "/search_online_music",
		fa: "fa-maxcdn"
	},
	{
		displayName: "全局搜索",
		routeName: "/search_all",
		fa: "fa-globe"
	},
]

class SearchColumn extends React.Component {

	render() {
        return (
            <div className="sites-container">
				<SquareMiddlePageComponent
					pageName="搜索"
					itemColumns={itemColumns}
					self={this}  //need this due to route so use class component
				/>
            </div>
        );
	}
}

export default SearchColumn;
