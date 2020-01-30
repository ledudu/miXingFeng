import React from 'react';
import { connect } from "react-redux";
import NavBar from "./child/navbar";

class SignaturePage extends React.Component {

	componentDidMount() {
		document.addEventListener("deviceready", this.listenBackFunc);

		// List of words
		var myWords = ["Hello", "Everybody", "How", "Are", "You", "Today", "It", "Is", "A", "Lovely", "Day", "I", "Love", "Coding", "In", "My", "Van", "Mate"]

		// set the dimensions and margins of the graph
		var margin = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 10
			},
			width = 375 - margin.left - margin.right,
			height = 750 - margin.top - margin.bottom;

		// append the svg object to the body of the page
		var svg = d3.select("#my_dataviz").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		// Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
		var layout = d3.layout.cloud()
			.size([width, height])
			.words(myWords.map(function (d) {
				return {
					text: d
				};
			}))
			.padding(10)
			.fontSize(60)
			.on("end", draw);
		layout.start();

		// This function takes the output of 'layout' above and draw the words
		// Better not to touch it. To change parameters, play with the 'layout' variable above
		function draw(words) {
			svg
				.append("g")
				.attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
				.selectAll("text")
				.data(words)
				.enter().append("text")
				.style("font-size", function (d) {
					return d.size + "px";
				})
				.attr("text-anchor", "middle")
				.attr("transform", function (d) {
					return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				})
				.text(function (d) {
					return d.text;
				});
		}

	}

    componentWillUnmount(){
        document.removeEventListener("deviceready", this.listenBackFunc);
        document.removeEventListener("backbutton", this.backToMainPage);
    }

    listenBackFunc = () => {
        document.addEventListener("backbutton", this.backToMainPage, false);
	}

	backToMainPage = () => {
		window.goRoute(this, "/main/myInfo")
	}

    render() {
		return (
			<div className="signature-page-container">
				<NavBar centerText="签名墙" backToPreviousPage={this.backToMainPage} />
				<div className="signature-page-content">
					<div id="my_dataviz"></div>
				</div>
			</div>
		);
    }
}

const mapStateToProps = state => {
    return {

    };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SignaturePage);
