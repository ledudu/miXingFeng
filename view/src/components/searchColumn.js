import React from 'react';
import SquareMiddlePageComponent from "./child/squareMiddlePageComponent";

const itemColumns = [
	{
		displayName: "历史签到",
		routeName: "/search_user_history"
	},
	{
		displayName: "地理位置",
		routeName: "/search_position"
	},
	{
		displayName: "共享文件",
		routeName: "/search_file"
	},
	{
		displayName: "共享音乐",
		routeName: "/search_music"
	},
	{
		displayName: "在线音乐",
		routeName: "/search_online_music"
	},
	{
		displayName: "全局搜索",
		routeName: "/search_all"
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
