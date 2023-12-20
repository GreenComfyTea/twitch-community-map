var data = undefined;

var onDataLoadedCallback = () => {};

function onDataLoaded(callback) {
	onDataLoadedCallback = callback;
}

function loadData() {
	fetch("https://raw.githubusercontent.com/GreenComfyTea/twitch-community-map/main/dataFileList.json")
	.then((response) => response.json())
	.then((json) => processData(json));
}

function processData(json) {
	const dataTemp = {};

	json.forEach(filePathName => {
		const filePathNameSplit = filePathName.split("/");

		const streamer = filePathNameSplit[1];
		const year = filePathNameSplit[2];
		const timeframe = filePathNameSplit[3];
		const fileName = filePathNameSplit[4];
		const type = fileName.split(/[_.]/)[3];

		if(!Object.hasOwn(dataTemp, streamer)) {
			dataTemp[streamer] = {};
		}

		const streamerData = dataTemp[streamer];

		if(!Object.hasOwn(streamerData, year)) {
			streamerData[year] = {};
		}

		const yearData = streamerData[year];

		if(!Object.hasOwn(yearData, timeframe)) {
			yearData[timeframe] = {};
		}

		const timeframeData = yearData[timeframe];

		timeframeData[type] = filePathName;
	});

	data = dataTemp;
	onDataLoadedCallback();
}

export { onDataLoaded, loadData, data };