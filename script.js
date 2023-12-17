import { loadMap, onCanvasResize, onFilterRequested, onSearchRequested, onPerformanceModeChange } from "./js/map-Force-Graph.js";

var streamer = "HAchubby";
var year = "2022";
var timeframe = "year";
var pingType = "pingsReceived";

var minPings = 2;
var searchUsername = "";
var performanceMode = navigator.userAgent.startsWith("Mozilla") ? true : false;

var uiContainer;

var streamerDropdown;
var yearDropdown;
var timeframeDropdown;
var pingTypeDropdown;

var minPingsLabel;
var minPingsSlider;
var searchField;
var performanceModeCheckbox;

function saveUserDataToLocalStorage() {
	if (!localStorage) {
		return;
	}

	if(streamer) {
		localStorage.streamer = streamer;
	}

	if(year) {
		localStorage.year = year;
	}

	if(timeframe) {
		localStorage.timeframe = timeframe;
	}

	if(pingType) {
		localStorage.pingType = pingType;
	}

	if(minPings) {
		localStorage.minPings = minPings;
	}

	if(searchUsername) {
		localStorage.searchUsername = searchUsername;
	}

	if(performanceMode === true || performanceMode === false) {
		localStorage.performanceMode = performanceMode;
	}
}

function loadUserDataFromLocalStorage() {
	if (!localStorage) {
		return;
	}

	const storedStreamer = localStorage.streamer;
	const storedYear = localStorage.year;
	const storedTimeframe = localStorage.timeframe;
	const storedPingType = localStorage.pingType;
	const storedMinPings = localStorage.minPings;
	const storedSearchUsername = localStorage.searchUsername;
	const storedPerformanceMode = localStorage.performanceMode;

	if(storedStreamer) {
		streamer = storedStreamer;
		streamerDropdown.value = storedStreamer;
	}

	if(storedYear) {
		year = storedYear;
		yearDropdown.value = storedYear;
	}

	if(storedTimeframe) {
		timeframe = storedTimeframe;
		timeframeDropdown.value = storedTimeframe;
	}

	if(storedPingType) {
		pingType = storedPingType;
		pingTypeDropdown.value = storedPingType;
	}

	if(storedMinPings) {
		minPings = storedMinPings;
		minPingsLabel.textContent = storedMinPings;
		minPingsSlider.value = storedMinPings;
	}

	if(storedSearchUsername) {
		searchUsername = storedSearchUsername;
		searchField.value = storedSearchUsername;
	}

	if(storedPerformanceMode) {
		performanceMode = JSON.parse(storedPerformanceMode);
		performanceModeCheckbox.checked = performanceMode;
	}
}

window.onStreamerChange = function(selected) {
	streamer = selected.value;
	saveUserDataToLocalStorage();
}

window.onYearChange = function(selected) {
	year = selected.value;
	saveUserDataToLocalStorage();
}

window.onTimeframeChange = function(selected) {
	timeframe = selected.value;
	saveUserDataToLocalStorage();
}

window.onPingTypeChange = function(selected) {
	pingType = selected.value;
	saveUserDataToLocalStorage();
}

window.onMinPingsInput = function(newValue) {
	minPingsLabel.textContent = newValue;
	minPings = newValue;
	saveUserDataToLocalStorage();
}

window.onFilterKeyUp = function(event) {
	if (event.key !== "Enter") return;

	onFilterRequested(minPings);
}

window.onFilter = function() {
	onFilterRequested(minPings);
}

window.onSearchKeyUp = function(event) {
	if (event.key !== "Enter") return;

	onSearchRequested(searchUsername);
}

window.onSearchInput = function(newValue) {
	searchUsername = newValue;
	saveUserDataToLocalStorage();
}

window.onSearch = function() {
	onSearchRequested(searchUsername);
}

window.onApply = function(event) {
	loadMap(streamer, year, timeframe, pingType, minPings, performanceMode);
}

window.onPerformanceModeChange = function(checkbox) {
	performanceMode = checkbox.checked === true ? true : false;
	saveUserDataToLocalStorage();

	onPerformanceModeChange(performanceMode);
}

function getStreamers() {
}

function getYears() {
}

function getTimeframes() {
}

window.onload = (event) => {
	uiContainer = document.getElementById("ui-container");
	streamerDropdown = document.getElementById("streamer-dropdown");
	yearDropdown = document.getElementById("year-dropdown");
	timeframeDropdown = document.getElementById("timeframe-dropdown");
	pingTypeDropdown = document.getElementById("ping-type-dropdown");

	minPingsLabel = document.getElementById("min-pings-label");
	minPingsSlider = document.getElementById("min-pings-slider");
	searchField = document.getElementById("search-field");
	performanceModeCheckbox = document.getElementById("performance-mode-checkbox");

	loadUserDataFromLocalStorage();

	performanceModeCheckbox.checked = performanceMode;

	uiContainer.classList.remove("hidden");

	loadMap(streamer, year, timeframe, pingType, minPings, performanceMode);
};

onresize = (event) => {
	onCanvasResize();
};