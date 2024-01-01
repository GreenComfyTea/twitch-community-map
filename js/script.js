import { onDataLoaded, loadData, data } from "./data-loader.js";
import { loadMap, mapData, resizeCanvas, filterNodes, searchNode, searchNextNode, changePerformanceMode, onMapLoaded } from "./map-Force-Graph.js";

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
	"pingsReceived": "🡇 Pings Received",
	"pingsSent": "🡅 Pings Sent"
}

{/* <th><span class="green-text">🡇</span> <span class="text-shadow">Received</span></th>
<th><span class="blue-text">🡅</span> <span class="text-shadow">Sent</span></th> */}

const dummyAsync = async () => {};

var streamer = "HAchubby";
var year = "2022";
var timeframe = "year";
var pingType = "pingsReceived";

var minPings = 2;
var searchUsername = "";
var performanceMode = navigator.userAgent.startsWith("Mozilla") ? true : false;

var isInfoCollapsed = false;
var isLeaderboardCollapsed = false;
var isStatsCollapsed = false;

var isLoading = true;

var uiContainer;

var streamerDropdown;
var yearDropdown;
var timeframeDropdown;
var pingTypeDropdown;
var loadButton;

var minPingsLabel;
var minPingsSlider;
var filterButton;

var searchField;
var searchButton;

var performanceModeCheckbox;

var userCountElement;
var linkCountElement;

var infoContainer;
var infoCollapseArrow;

var leaderboardContainer;
var leaderboardCollapseArrow;
var leaderboardTable;

var statsContainer;
var statsCollapseArrow;

var loadingContainer;

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

	if(isInfoCollapsed === true || isInfoCollapsed === false) {
		localStorage.isInfoCollapsed = isInfoCollapsed;
	}

	if(isLeaderboardCollapsed === true || isLeaderboardCollapsed === false) {
		localStorage.isLeaderboardCollapsed = isLeaderboardCollapsed;
	}

	if(isStatsCollapsed === true || isStatsCollapsed === false) {
		localStorage.isStatsCollapsed = isStatsCollapsed;
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
	const storedIsInfoCollapsed = localStorage.isInfoCollapsed;
	const storedIsLeaderboardCollapsed = localStorage.isLeaderboardCollapsed;
	const storedIsStatsCollapsed = localStorage.isStatsCollapsed;

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

	if(storedIsInfoCollapsed) {
		isInfoCollapsed = JSON.parse(storedIsInfoCollapsed);
		if(isInfoCollapsed) updateInfoCollapse();
	}

	if(storedIsLeaderboardCollapsed) {
		isLeaderboardCollapsed = JSON.parse(storedIsLeaderboardCollapsed);
		if(isLeaderboardCollapsed) updateLeaderboardCollapse();
	}

	if(storedIsStatsCollapsed) {
		isStatsCollapsed = JSON.parse(storedIsStatsCollapsed);
		if(isStatsCollapsed) updateStatsCollapse();
	}
}

window.onStreamerChange = async (selected) => {
	await dummyAsync();
	
	streamer = selected.value;
	saveUserDataToLocalStorage();

	populateYearDropdowns();
	populateTimeframeDropdowns();
	populatePingTypeDropdowns();
};

window.onYearChange = async (selected) => {
	await dummyAsync();

	year = selected.value;
	saveUserDataToLocalStorage();

	populateTimeframeDropdowns();
	populatePingTypeDropdowns();
};

window.onTimeframeChange = async (selected) => {
	await dummyAsync();

	timeframe = selected.value;
	saveUserDataToLocalStorage();

	populatePingTypeDropdowns();
};

window.onPingTypeChange = async (selected) => {
	await dummyAsync();

	pingType = selected.value;
	saveUserDataToLocalStorage();
};

window.onMinPingsInput = async (newValue) => {
	await dummyAsync();

	minPingsLabel.textContent = newValue;
	minPings = newValue;
	saveUserDataToLocalStorage();
};

window.onFilterKeyUp = async (event) => {
	await dummyAsync();

	if(isLoading) return;
	if (event.key !== "Enter") return;
	filter();
};

window.onFilterClick = async () => {
	await dummyAsync();
	filter();
};

window.onSearchKeyUp = async (event) => {
	await dummyAsync();

	if(isLoading) return;
	if (event.key !== "Enter") return;
	search();
};

window.onSearchInput = async (newValue) => {
	await dummyAsync();

	searchUsername = newValue;
	saveUserDataToLocalStorage();
};

window.onSearchClick = async () => {
	await dummyAsync();

	search();
};

window.onLoadClick = async (event) => {
	await dummyAsync();

	disableUI();
	loadNewMap();
};

window.onPerformanceModeChange = async (checkbox) => {
	await dummyAsync();

	performanceMode = checkbox.checked === true ? true : false;
	saveUserDataToLocalStorage();

	changePerformanceMode(performanceMode);
};

window.onInfoCollapseClick = async (event) => {
	await dummyAsync();

	isInfoCollapsed = !isInfoCollapsed;
	saveUserDataToLocalStorage();
	updateInfoCollapse();
};

window.onLeaderboardCollapseClick = async (event) => {
	await dummyAsync();

	isLeaderboardCollapsed = !isLeaderboardCollapsed;
	saveUserDataToLocalStorage();
	updateLeaderboardCollapse();
};

window.onStatsCollapseClick = async (event) => {
	await dummyAsync();

	isStatsCollapsed = !isStatsCollapsed;
	saveUserDataToLocalStorage();
	updateStatsCollapse();
};

window.onSearchNextUser = async (userType) => {
	await dummyAsync();

	searchNextUser(userType);
};

function search() {
	if(searchUsername === "" || searchUsername === null || searchUsername === undefined) return;

	const searchUsernameTemp = searchUsername.trim().toLowerCase();

	searchNode(searchUsernameTemp);

	const tableRow = document.getElementById(searchUsernameTemp);

	if (!tableRow) return;

	tableRow.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}

function searchNextUser(userType) {
	const nextUser = searchNextNode(userType);

	const tableRow = document.getElementById(nextUser);

	if (!tableRow) return;

	tableRow.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}

function filter() {
	disableUI();
	leaderboardTable.clear().draw();
	
	setTimeout(() => {
		filterNodes(minPings);
	}, 0);
}

function enableUI() {
	isLoading = false;

	loadButton.classList.remove("disabled");
	filterButton.classList.remove("disabled");
	searchButton.classList.remove("disabled");
	performanceModeCheckbox.classList.remove("disabled");

	loadingContainer.classList.add("hidden");
}

function disableUI() {
	isLoading = true;

	loadButton.classList.add("disabled");
	filterButton.classList.add("disabled");
	searchButton.classList.add("disabled");
	performanceModeCheckbox.classList.add("disabled");

	loadingContainer.classList.remove("hidden");
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
		year = years[years.length - 1];
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
	
	if (!timeframes.some((dropdownTimeframe) => dropdownTimeframe.value === timeframe)) {
		timeframe = timeframes[timeframes.length - 1].value;

		if (timeframe === "year") {
			timeframe = timeframes[timeframes.length - 2].value;
		}
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

	if (!pingTypes.some((dropdownPingType) => dropdownPingType.value === pingType)) {
		pingType = pingTypes[0].value;
	}

	pingTypeDropdown.value = pingType;
}

function createSelectOption(select, text, value) {
	const option = document.createElement('option');
    option.value = value;
    option.innerHTML = text;
    select.appendChild(option);
}

function updateInfoCollapse() {
	if(isInfoCollapsed) {
		infoContainer.classList.add("collapse-left-animation");
		infoContainer.classList.remove("expand-right-animation");

		infoCollapseArrow.classList.add("flip-arrow");
	}
	else {
		infoContainer.classList.add("expand-right-animation");
		infoContainer.classList.remove("collapse-left-animation");

		infoCollapseArrow.classList.remove("flip-arrow");
	}
}

function updateLeaderboardCollapse() {
	if(isLeaderboardCollapsed) {
		leaderboardContainer.classList.add("collapse-to-right-animation");
		leaderboardContainer.classList.remove("expand-to-left-animation");

		leaderboardCollapseArrow.classList.remove("flip-arrow");
	}
	else {
		leaderboardContainer.classList.add("expand-to-left-animation");
		leaderboardContainer.classList.remove("collapse-to-right-animation");

		leaderboardCollapseArrow.classList.add("flip-arrow");
	}
}

function updateStatsCollapse() {
	if(isStatsCollapsed) {
		statsContainer.classList.add("collapse-down-animation");
		statsContainer.classList.remove("expand-up-animation");

		statsCollapseArrow.classList.add("rotate-up-arrow");
		statsCollapseArrow.classList.remove("rotate-down-arrow");
	}
	else {
		statsContainer.classList.add("expand-up-animation");
		statsContainer.classList.remove("collapse-down-animation");

		statsCollapseArrow.classList.add("rotate-down-arrow");
		statsCollapseArrow.classList.remove("rotate-up-arrow");
	}
}

function loadNewMap() {
	leaderboardTable.clear().draw();
	loadMap(streamer, year, timeframe, pingType, minPings, performanceMode);
}

async function loadNewData() {
	await dummyAsync();

	loadData();
}

onload = async (event) => {
	await dummyAsync();

	uiContainer = document.getElementById("ui-container");

	streamerDropdown = document.getElementById("streamer-dropdown");
	yearDropdown = document.getElementById("year-dropdown");
	timeframeDropdown = document.getElementById("timeframe-dropdown");
	pingTypeDropdown = document.getElementById("ping-type-dropdown");

	loadButton = document.getElementById("load-button");

	minPingsLabel = document.getElementById("min-pings-label");
	minPingsSlider = document.getElementById("min-pings-slider");
	filterButton = document.getElementById("filter-button");

	searchField = document.getElementById("search-field");
	searchButton = document.getElementById("search-button");

	performanceModeCheckbox = document.getElementById("performance-mode-checkbox");

	userCountElement = document.getElementById("user-count");
	linkCountElement = document.getElementById("link-count");

	infoContainer = document.getElementById("info-container");
	infoCollapseArrow = document.getElementById("info-collapse-arrow");

	leaderboardContainer = document.getElementById("leaderboard-container");
	leaderboardCollapseArrow = document.getElementById("leaderboard-collapse-arrow");

	statsContainer = document.getElementById("stats-container");
	statsCollapseArrow = document.getElementById("stats-collapse-arrow");

	loadingContainer = document.getElementById("loading-container");

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
		createdRow: async (row, node, index) => {
			await dummyAsync();

			row.id = node.name;
		
			switch(node.userType) {
				case "Streamer":
					row.classList.add("streamer-type");
					break;
				case "Staff":
					row.classList.add("staff-type");
					break;
				case "Moderator":
					row.classList.add("moderator-type");
					break;
				case "VIP":
					row.classList.add("vip-type");
					break;
				case "Artist":
					row.classList.add("artist-type");
					break;
				case "Partner":
					row.classList.add("partner-type");
					break;
				case "Subscriber":
					row.classList.add("subscriber-type");
					break;
				case "Viewer":
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
			row.classList.add("table-text");
		}
	});

	leaderboardTable.on("click", "tbody tr", async (event) => {
		await dummyAsync();

		if(!event) return;
		if(!event.currentTarget) return;

		const clickedUsername = event.currentTarget.id;

		if(!clickedUsername) return;

		searchNode(clickedUsername);
	});
	
	loadUserDataFromLocalStorage();

	performanceModeCheckbox.checked = performanceMode;

	if(data !== undefined) {
		populateStreamerDropdown();
		populateYearDropdowns();
		populateTimeframeDropdowns();
		populatePingTypeDropdowns();

		uiContainer.classList.remove("hidden");

		loadNewMap();
	}
	else {
		onDataLoaded(() => {
			populateStreamerDropdown();
			populateYearDropdowns();
			populateTimeframeDropdowns();
			populatePingTypeDropdowns();

			uiContainer.classList.remove("hidden");

			loadNewMap();
		});
	}
};

onresize = async (event) => {
	await dummyAsync();

	resizeCanvas();
};

onMapLoaded((data) => {
	leaderboardTable.rows.add(data.nodes);
	leaderboardTable.columns.adjust();
	leaderboardTable.draw();

	userCountElement.textContent = data.nodes.length;
	linkCountElement.textContent = data.links.length;

	enableUI();
});

loadNewData();