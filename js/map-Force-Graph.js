import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.js";

// const DEBUG = false;

const colors = {
	Streamer: "#ff5c81",
	Moderator: "#00bf03",
	VIP: "#ff00d0",
	Partner: "#00caff",
	Subscriber: "#9147ff",
	Viewer: "#146654",
};

const outlineColors = {
	Streamer: "#7f2e40",
	Moderator: "#005f01",
	VIP: "#7f0068",
	Partner: "#00657f",
	Subscriber: "#48237f",
	Viewer: "#0a332a",
};

const outlineProportion = 0.15;
const fontSizeProportion = 0.275;
const fontOutlineProportion = 0.2;
const sqrtPI = Math.sqrt(Math.PI);

const nodeRelSize = 4;

var performanceMode = false;

// var t0 = 0;
// var t1 = 0;
// var totalT = 0;
// var count = 0;

var data;
var map;

const limit = 1.3;
var bottomLimit = limit * window.innerHeight;
var rightLimit = limit * window.innerWidth;
var topLimit = window.innerHeight - bottomLimit;
var leftLimit = window.innerWidth - rightLimit;

var lastGlobalScale = 1;

const gridSize = 7500;
const minGridValue = -(gridSize / 2);

// if(DEBUG) {
// 	var totalFPS = new Stats();
// 	totalFPS.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
// 	document.body.appendChild(totalFPS.dom);

// 	var totalFT = new Stats();
// 	totalFT.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
// 	document.body.appendChild(totalFT.dom);
// 	totalFT.dom.style.left = "90px";
// 	console.log(totalFT.dom);
// }

function loadMap(streamer, year, timeframe, pingType, minPings, newPerformanceMode) {
	performanceMode = newPerformanceMode;

	let fileName = `${streamer}_${year}`;
	if (timeframe !== "year") fileName = `${fileName}_${timeframe}`;
	fileName = `${fileName}_${pingType}`;

	// console.log(`./data/${streamer}/${year}/${timeframe}/${fileName}.json`);

	fetch(`./data/${streamer}/${year}/${timeframe}/${fileName}.json`)
    .then((response) => response.json())
    .then((json) => {
		data = json;
		preprocessData(data, pingType);
		const dataCopy = structuredClone(data);
		filterData(dataCopy, minPings);
		createGraph(dataCopy);
	});
}

function preprocessData(data, pingType) {
	const isGephiGenerated = Object.hasOwn(data, "attributes");

	data.nodes.forEach((node) => {

		if(isGephiGenerated) {
			const nodeAttributes = node.attributes;

			node.name = node.key;
			delete node.key;

			node.displayName = nodeAttributes.label;
			node.userType = nodeAttributes.usertype || "Viewer";
			node.pingsReceived = nodeAttributes.pingsreceived || 0;
			node.pingsSent = nodeAttributes.pingssent || 0;
			node.x = Math.floor(nodeAttributes.x || 0);
			node.y = Math.floor(nodeAttributes.y || 0);

			// node.x = minGridValue + gridSize * Math.random();
			// node.y = minGridValue + gridSize * Math.random();

			delete node.attributes;
		}
		node.pingCount = node[pingType];
		delete node.pingsReceived;
		delete node.pingsSent;

		node.displayName = node.displayName || node.name;
		node.tooltipText = `${node.displayName} (${node.userType}) - ${node.pingCount}`;

		node.color = colors[node.userType];

		// S = pi * r^2
		node.area = 12 * node.pingCount;

		node.radius = Math.max(1, Math.min(250, Math.sqrt(node.area) / sqrtPI));
		node.squareRootRadius =  Math.sqrt(Math.max(0, Math.sqrt(node.radius))) * nodeRelSize;
		node.squaredRadius = node.radius * node.radius;
		node.diameter = 2 * node.radius;
	
		node.outlineColor = outlineColors[node.userType];
		node.outlineWidth = Math.max(2, outlineProportion * node.radius * nodeRelSize);
	
		node.fontSize = Math.max(4, fontSizeProportion * node.radius * nodeRelSize);
		node.fontOutlineWidth = Math.max(2, fontOutlineProportion * node.radius * nodeRelSize);

		node.collisionDistance = 5 + 95 * Math.random() + node.outlineWidth + 2 * node.diameter;
		
		node.visibilityLimit = 3 * (node.radius + node.outlineWidth);
	});

	if(isGephiGenerated) {
		data.links = data.edges;
		delete data.edges;
	}
	
	data.links.forEach((link) => {

		if(isGephiGenerated) {
			const linkAttributes = link.attributes;

			delete link.key;
			delete link.undirected;

			link.pingCount = linkAttributes.weight;
			link.userType = linkAttributes.usertype;
		
			delete link.attributes;
		}

		link.width = link.pingCount;
	
		link.sourceNode = data.nodes.find((node) => node.name === link.source);
		link.targetNode = data.nodes.find((node) => node.name === link.target);

		if (link.sourceNode.diameter < link.width) link.width = link.sourceNode.diameter;
		if (link.targetNode.diameter < link.width) link.width = link.targetNode.diameter;
	});

	delete data.attributes;
}

function filterData(data, minPings) {
	const newNodes = [];

	data.nodes.forEach((node) => {
		if(node.pingCount >= minPings) {
			newNodes.push(node);
			return;
		}

		// if(node.pingCount === 0) {
		// 	data.links = data.links.filter(link => link.sourceNode !== node && link.targetNode !== node);
		// 	return;	
		// }

 		// Remove links attached to node
		data.links = data.links.filter(link => link.sourceNode !== node && link.targetNode !== node);

		// const newLinks = [];
		// let isAnyLinkedNodeQualified = false;

		// data.links.forEach((link) => {

		// 	if(link.source === node.name) {

		// 		// check min pings on link.target
		// 		if(link.targetNode.pingCount >= minPings) {
		// 			newLinks.push(link);
		// 			isAnyLinkedNodeQualified = true;
		// 			return;
		// 		}

		// 		return;
		// 	}

		// 	if(link.target === node.name) {

		// 		// check min pings on link.source
		// 		if(link.sourceNode.pingCount >= minPings) {
		// 			newLinks.push(link);
		// 			isAnyLinkedNodeQualified = true;
		// 			return;
		// 		}

		// 		return;
		// 	}

		// 	newLinks.push(link);
		// });

		// data.links = newLinks;

		// if(isAnyLinkedNodeQualified) {
		// 	newNodes.push(node);
		// }
	});

	data.nodes = newNodes;
}

function createGraph(data) {
	const mapElement = document.getElementById("map");

	if (map !== undefined) map._destructor();

	map = ForceGraph();
	map(mapElement)
		.width(window.innerWidth)
		.height(window.innerHeight)
		.nodeRelSize(nodeRelSize)
		.nodeId("name")
		.nodeVal("squaredRadius")
		.nodeLabel("tooltipText")
		.nodeColor("color")

		.nodeVisibility((node) => {
			const screenCoordinates = map.graph2ScreenCoords(node.x, node.y);
			const visibilityLimit =  lastGlobalScale * node.visibilityLimit;

			if(screenCoordinates.y > visibilityLimit + window.innerHeight) return false;
			if (screenCoordinates.x > visibilityLimit + window.innerWidth) return false;
			if (screenCoordinates.x < -visibilityLimit) return false;
			if (screenCoordinates.y < -visibilityLimit) return false;

			return true;
		})

		.nodeCanvasObjectMode(() => "after")
		.nodeCanvasObject((node, context, globalScale) => {
			//context.globalCompositeOperation = "source-over";
	
			// Outline
			context.lineJoin = "round";
			context.lineWidth = node.outlineWidth;
			context.strokeStyle = node.outlineColor;
			context.stroke();
	
			if (node.fontSize * globalScale < 5) return;

			// Label

		    context.font = `600 ${node.fontSize}px Montserrat`;
		    context.textAlign = "center";
		    context.textBaseline = "middle";
	
			context.strokeStyle = node.color;
			context.lineWidth = node.fontOutlineWidth;
			context.strokeText(node.displayName, node.x, node.y);
	
			context.fillStyle = "white"; 
		    context.fillText(node.displayName, node.x, node.y);
		})

		.linkWidth("width")
		.linkColor((link) => performanceMode ? outlineColors[link.userType] : colors[link.userType] + "80")

		.linkCurvature((link) => performanceMode ? 0 : 0.25)

		//#region 
		// .linkVisibility((link) => {
		// 	return true;
		// 	//if(!performanceMode) return true;

		// 	const sourceNode = link.source;
		// 	const targetNode = link.target;

		// 	const sourceScreenCoordinates = map.graph2ScreenCoords(sourceNode.x, sourceNode.y);
		// 	const targetScreenCoordinates = map.graph2ScreenCoords(targetNode.x, targetNode.y);


		// 	const sourceVisibilityLimit =  lastGlobalScale * sourceNode.visibilityLimit;
		// 	const targetVisibilityLimit =  lastGlobalScale * targetNode.visibilityLimit;

		// 	if(sourceScreenCoordinates.x > sourceVisibilityLimit + window.innerWidth
		// 	&& targetScreenCoordinates.x > targetVisibilityLimit + window.innerWidth)
		// 	{
		// 		return false;
		// 	}

		// 	if(sourceScreenCoordinates.y > sourceVisibilityLimit + window.innerHeight
		// 	&& targetScreenCoordinates.y > targetVisibilityLimit + window.innerHeight)
		// 	{
		// 		return false;
		// 	}
	
		// 	if(sourceScreenCoordinates.x < -sourceVisibilityLimit
		// 	&& targetScreenCoordinates.x < -targetVisibilityLimit)
		// 	{
		// 		return false;
		// 	}

		// 	if(sourceScreenCoordinates.y < -sourceVisibilityLimit
		// 	&& targetScreenCoordinates.y < -targetVisibilityLimit)
		// 	{
		// 		return false;
		// 	}

		// 	return true;
		// })
		//#endregion

		.linkCanvasObjectMode(() => "after")
		.linkCanvasObject((link, context, globalScale) => {
			if(performanceMode) return;

			const links = map.graphData().links;

			if(links[links.length - 1] === link) {
				context.globalCompositeOperation = "source-over";
				context.save();
			}
		})

		//.cooldownTicks(0)
		.d3Force("charge", d3.forceManyBody().strength(-30).theta(1.2))
		.d3Force("center", d3.forceCenter().strength(0.025))
		.d3Force("collide", d3.forceCollide((node) => node.collisionDistance).strength(0.5).iterations(1)) 
		.d3Force("link", d3.forceLink(map.graphData().links).id((link) => link.name).distance((link) => 1000 / link.pingCount).strength(0.5))
		
		.onRenderFramePre((context, globalScale) => {
			lastGlobalScale = globalScale;

			// t0 = performance.now();
			map.autoPauseRedraw(true);

			if(!performanceMode) context.globalCompositeOperation = "lighter";

			// if(count === 10) {
			// 	setTimeout(() => {
			// 		console.log(totalT / count);
			// 	}, 15000);
			// }

			// return;
			// if(DEBUG) {
			// 	totalFPS.begin();
			// 	totalFT.begin();
			// }
		})
		// .onRenderFramePost((context, globalScale) => {
		// 	t1 = performance.now();
		// 	totalT += t1 - t0;
		// 	count++; 
		// 	return;
		// 	if(DEBUG) {
		// 		totalFPS.end();
		// 		totalFT.end();
		// 	}
		// })
		.onZoom((transform) => map.linkWidth((link) => link.width * transform.k))
		// .onNodeDragEnd((node) => {
		//     node.fx = node.x;
		//     node.fy = node.y;
		// })

		.graphData(data)
		//.zoomToFit(500, -1500, () => true);
}

function onFilterRequested(minPings) {
	const dataCopy = structuredClone(data);
	filterData(dataCopy, minPings);
	createGraph(dataCopy);
}

function onSearchRequested(userName) {
	if(userName === "" || userName === null || userName === undefined) return;

	const userNameTemp = userName.trim().toLowerCase();
	const padding = 0.25 * Math.min(window.innerWidth, window.innerHeight);

	map.zoomToFit(1000, padding, (node) => node.name === userNameTemp);
}

function onCanvasResize() {
	if (map === undefined) return;

	bottomLimit = limit * window.innerHeight;
	rightLimit = limit * window.innerWidth;
	topLimit = window.innerHeight - bottomLimit;
	leftLimit = window.innerWidth - rightLimit;

	map.width(window.innerWidth);
	map.height(window.innerHeight);
}

function onPerformanceModeChange(newPerformanceMode) {
	performanceMode = newPerformanceMode;
	map.autoPauseRedraw(false);
}

console.log(d3);

export {loadMap, onCanvasResize, onSearchRequested, onFilterRequested, onPerformanceModeChange};