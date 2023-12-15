import { loadMap, onCanvasResize } from "./js/map-Force-Graph.js";

let streamer = "HAchubby";
let year = "2022";
let timeframe = "year";
let pingType = "pingsReceived";

window.onStreamerChange = function(selected) {
	streamer = selected.value;

	loadMap(streamer, year, timeframe, pingType);
}

window.onYearChange = function(selected) {
	year = selected.value;

	loadMap(streamer, year, timeframe, pingType);
}

window.onTimeframeChange = function(selected) {
	timeframe = selected.value;

	loadMap(streamer, year, timeframe, pingType);
}

window.onPingTypeChange = function(selected) {
	pingType = selected.value;

	loadMap(streamer, year, timeframe, pingType);
}

function getStreamers() {
}

function getYears() {
}

function getTimeframes() {
}


window.onload = (event) => {
	loadMap(streamer, year, timeframe, pingType);
};

onresize = (event) => {
	onCanvasResize();
};