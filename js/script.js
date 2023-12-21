import { onDataLoaded, loadData, data } from "./data-loader.js";
import { loadMap, mapData, onCanvasResize, onFilterRequested, onSearchRequested, onPerformanceModeChange, onMapLoaded } from "./map-Force-Graph.js";

const timeframeNames = {
	"year": "Year",
	"01": "January",
	"02": "February",
	"03": "March",
	"04": "April",
	"05": "May",
	"06": "June",
	"07": "July",
	"08": "August",
	"09": "September",
	"10": "October",
	"11": "November",
	"12": "December"
}

const pingTypeNames = {
	"pingsReceived": "Pings Received",
	"pingsSent": "Pings Sent"
}

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

var leaderboardTable;

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
		//streamerDropdown.value = storedStreamer;
	}

	if(storedYear) {
		year = storedYear;
		//yearDropdown.value = storedYear;
	}

	if(storedTimeframe) {
		timeframe = storedTimeframe;
		//timeframeDropdown.value = storedTimeframe;
	}

	if(storedPingType) {
		pingType = storedPingType;
		//pingTypeDropdown.value = storedPingType;
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

	populateYearDropdowns();
	populateTimeframeDropdowns();
	populatePingTypeDropdowns();
}

window.onYearChange = function(selected) {
	year = selected.value;
	saveUserDataToLocalStorage();

	populateTimeframeDropdowns();
	populatePingTypeDropdowns();
}

window.onTimeframeChange = function(selected) {
	timeframe = selected.value;
	saveUserDataToLocalStorage();

	populatePingTypeDropdowns();
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
	filter();
}

window.onFilter = function() {
	filter();
}

window.onSearchKeyUp = function(event) {
	if (event.key !== "Enter") return;
	search();
}

window.onSearchInput = function(newValue) {
	searchUsername = newValue;
	saveUserDataToLocalStorage();
}

window.onSearchClick = function() {
	search();
}

window.onApply = function(event) {
	loadNewMap();
}

window.onPerformanceModeChange = function(checkbox) {
	performanceMode = checkbox.checked === true ? true : false;
	saveUserDataToLocalStorage();

	onPerformanceModeChange(performanceMode);
}

function search() {
	if(searchUsername === "" || searchUsername === null || searchUsername === undefined) return;

	const searchUsernameTemp = searchUsername.trim().toLowerCase();

	onSearchRequested(searchUsernameTemp);

	const tableRow = document.getElementById(searchUsernameTemp);

	if (!tableRow) return;

	tableRow.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}

function filter() {
	leaderboardTable.clear().draw();
	onFilterRequested(minPings);
}

function populateStreamerDropdown() {
	const streamers = Object.keys(data)
		.sort((left, right) => left.toLocaleLowerCase().localeCompare(right.toLocaleLowerCase()));


	streamerDropdown.textContent = "";
	streamers.forEach((streamer) => createSelectOption(streamerDropdown, streamer, streamer));

	if(!streamers.includes(streamer)) {
		streamer = streamers[0];
	}
	streamerDropdown.value = streamer;
}

function populateYearDropdowns() {
	const years = Object.keys(data[streamer])
		.map((year) => parseInt(year))
		.sort((left, right) => left - right);

	yearDropdown.textContent = "";
	years.forEach((year) => createSelectOption(yearDropdown, year, year));

	if(!years.includes(parseInt(year))) {
		year = years[0];
	}

	yearDropdown.value = year;
}

function populateTimeframeDropdowns() {
	const timeframes = Object.keys(data[streamer][year])
		.map((timeframe) => { 
			return { value: timeframe, text: timeframeNames[timeframe] };
		})
		.sort((left, right) => left.value.localeCompare(right.value));

	timeframeDropdown.textContent = "";
	timeframes.forEach((timeframe) => createSelectOption(timeframeDropdown, timeframe.text, timeframe.value));

	if (!timeframes.some((dropdownTimeframe) => dropdownTimeframe.value.localeCompare(timeframe))) {
		timeframe = timeframes[0].value;
	}

	timeframeDropdown.value = timeframe;
}

function populatePingTypeDropdowns() {
	const pingTypes = Object.keys(data[streamer][year][timeframe])
		.map((pingType) => {
			return { value: pingType, text: pingTypeNames[pingType] };
		})
		.sort((left, right) => left.text.toLocaleLowerCase().localeCompare(right.text.toLocaleLowerCase()));

	pingTypeDropdown.textContent = "";
	pingTypes.forEach((pingType) => createSelectOption(pingTypeDropdown, pingType.text, pingType.value));

	if (!pingTypes.some((dropdownPingType) => dropdownPingType.value.localeCompare(pingType))) {
		pingType = pingTypes[0].value;
	}

	pingTypeDropdown.value = pingType;
}

function loadNewMap() {
	leaderboardTable.clear().draw();
	loadMap(streamer, year, timeframe, pingType, minPings, performanceMode);
}

function createSelectOption(select, text, value) {
	const option = document.createElement('option');
    option.value = value;
    option.innerHTML = text;
    select.appendChild(option);
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

	leaderboardTable = new DataTable('#leaderboard-table', {
		// options
		deferRender: true,
		lengthChange: true,
		autoWidth: true,
		paging: false,
		processing: true,
		serverSide: false,
		searching: false,
		ordering: true,
		scrollY: "16rem",
		info: false,
		//scroller: true,
		//responsive: true,
		order: [[0, 'asc']],
		width: 0,
		fixedHeader: {
			header: true,
			footer: false
		},
		columns: [
			{ data: "place" },
			{ data: "displayName" },
			{ data: "pingsReceived" },
			{ data: "pingsSent" }
		],
		createdRow: (row, node, index) => {

			row.id = node.name;
		
			switch(node.userType) {
				case "Streamer":
					row.classList.add("streamer-type");
					break;
				case "Moderator":
					row.classList.add("moderator-type");
					break;
				case "VIP":
					row.classList.add("vip-type");
					break;
				case "Partner":
					row.classList.add("partner-type");
					break;
				case "Subscriber":
					row.classList.add("subscriber-type");
					break;
				default:
					row.classList.add("viewer-type");
					
			}

			switch(node.place) {
				case 1: 
					row.classList.add("first-place");
					break;
				case 2:
					row.classList.add("second-place");
					break;
				case 3:
					row.classList.add("third-place");
					break;
			}

			row.classList.add("table-text-shadow");
		}
	});

	leaderboardTable.on('click', 'tbody tr', function() {
		const node = leaderboardTable.row(this).data();
		if(!node) return;

		const clickedUsername = node.name;

		if(!clickedUsername) return;

		onSearchRequested(clickedUsername);
	});

	console.log(leaderboardTable);

	loadUserDataFromLocalStorage();

	performanceModeCheckbox.checked = performanceMode;

	if(data !== undefined) {
		populateStreamerDropdown();
		populateYearDropdowns();
		populateTimeframeDropdowns();
		populatePingTypeDropdowns();

		uiContainer.classList.remove("hidden");
	}
	else {
		onDataLoaded(() => {
			populateStreamerDropdown();
			populateYearDropdowns();
			populateTimeframeDropdowns();
			populatePingTypeDropdowns();

			uiContainer.classList.remove("hidden");
		});
	}

	loadNewMap();
};

onMapLoaded((data) => {
	leaderboardTable.rows.add(data.nodes);
	leaderboardTable.columns.adjust();
	leaderboardTable.draw();
});

onresize = (event) => {
	onCanvasResize();
};

loadData();