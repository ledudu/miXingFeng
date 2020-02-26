import React from 'react';
import SquareMiddlePageComponent from "./child/squareMiddlePageComponent";

const itemColumns = [
	{
		displayName: "俄罗斯方块",
		routeName: "/package_iframe",
		name: '俄罗斯方块',
		src: "./games/teris/index.html",
		fa: "fa-square"
	},
	{
		displayName: "五子棋",
		routeName: "/package_iframe",
		name: '五子棋',
		src: "./games/gobang/index.html",
		fa: "fa-circle-o"
	},
	{
		displayName: "2048",
		routeName: "/package_iframe",
		name: '2048小游戏',
		src: "./games/js_game_2048/index.html",
		fa: "fa-meetup"
	},
	{
		displayName: "spacecraft",
		routeName: "/package_iframe",
		name: 'spacecraft',
		src: "./games/spacecraft/index.html",
		fa: "fa-deviantart"
	},
	{
		displayName: "RPC",
		routeName: "/type_shell",
		fa: "fa-openid"
	}
]

class SearchColumn extends React.Component {

	render() {
        return (
            <div className="sites-container">
				<SquareMiddlePageComponent
					pageName="游戏"
					itemColumns={itemColumns}
					self={this}
				/>
				<div className="teteris-info">俄罗斯方块开源地址: <br/>
				https://github.com/chvin/react-tetris</div>
            </div>
        );
	}
}

export default SearchColumn;
