import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.js";

// const DEBUG = false;

const DEBUG = true;

const colors = {
	Streamer: {
		color: "#ff5e7e",
		darkerColor: "#7f2f3f",
	},
	Staff: {
		color: "#e52e2e",
		darkerColor: "#721717",
	},
	Moderator: {
		color: "#00ad03",
		darkerColor: "#005601",
	},
	VIP: {
		color: "#e005b9",
		darkerColor: "#70025c",
	},
	Artist: {
		color: "#0ca2f2",
		darkerColor: "#0d577f",
	},
	Partner: {
		color: "#d9ae41",
		darkerColor: "#6c5720",
	},
	Subscriber: {
		color: "#a951fb",
		darkerColor: "#54287d",
	},
	Viewer: {
		color: "#009978",
		darkerColor: "#004c3c",
	},
}

const lastUsersFound = {
	Streamer: "",
	Staff: "",
	Moderator: "",
	VIP: "",
	Artist: "",
	Partner: "",
	Subscriber: "",
	Viewer: "",
}

const dummyAsync = async () => {};

var onMapLoadedCallback = (data) => {};

const nonHighlightedRatio = 0.2;
const linkAlpha = 0.5;

const outlineRatio = 0.15;
const fontSizeRatio = 0.275;
const fontOutlineRatio = 0.15;
const sqrtPI = Math.sqrt(Math.PI);

const nodeRelSize = 4;

var performanceMode = false;

var t0 = 0;
var t1 = 0;
var totalT = 0;
var count = 0;

var data;
var map;

var highlightedNodes = [];
var highlightedLinks = [];

const limit = 1.3;
var bottomLimit = limit * window.innerHeight;
var rightLimit = limit * window.innerWidth;
var topLimit = window.innerHeight - bottomLimit;
var leftLimit = window.innerWidth - rightLimit;

var lastGlobalScale = 1;

const gridSize = 7500;
const minGridValue = -(gridSize / 2);

var cooldownTicks = Infinity;

if(DEBUG) {
	var totalFPS = new Stats();
	totalFPS.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(totalFPS.dom);

	var totalFT = new Stats();
	totalFT.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild(totalFT.dom);
	totalFT.dom.style.left = "90px";
	console.log(totalFT.dom);
}

function populateColors() {
	Object.values(colors).forEach((userTypeColors) => {
		const normalHighlighted = {
			nodeColor:			userTypeColors.color,
			nodeOutlineColor:	userTypeColors.darkerColor,
			textColor:			"#ffffff",
			textOutlineColor:	userTypeColors.color
		};
	
		const normalHighlightedChroma = {
			nodeColorChroma:			chroma(normalHighlighted.nodeColor),
			nodeOutlineColorChroma:		chroma(normalHighlighted.nodeOutlineColor),
			textColorChroma:			chroma(normalHighlighted.textColor),
			textOutlineColorChroma:		chroma(normalHighlighted.textOutlineColor)
		};
	
		const normalNonHighlighted = {
			nodeColor:			normalHighlightedChroma.nodeColorChroma.set("hsl.l", nonHighlightedRatio * normalHighlightedChroma.nodeColorChroma.get("hsl.l")).hex(),
			nodeOutlineColor:	normalHighlightedChroma.nodeOutlineColorChroma.set("hsl.l", nonHighlightedRatio * normalHighlightedChroma.nodeOutlineColorChroma.get("hsl.l")).hex(),
			textColor:			normalHighlightedChroma.textColorChroma.set("hsl.l", nonHighlightedRatio * normalHighlightedChroma.textColorChroma.get("hsl.l")).hex(),
			textOutlineColor:	normalHighlightedChroma.textOutlineColorChroma.set("hsl.l", nonHighlightedRatio * normalHighlightedChroma.textOutlineColorChroma.get("hsl.l")).hex()
		};
	
		const performanceHighlighted = normalHighlighted;
		// const performanceHighlighted = {
		// 	nodeColor: userTypeColors.color,
		// 	nodeOutlineColor: userTypeColors.darkerColor,
		// 	textColor:  "#ffffff",
		// 	textOutlineColor: userTypeColors.color
		// };
	
		const performanceHighlightedChroma = {
			nodeColorChroma:			chroma(performanceHighlighted.nodeColor),
			nodeOutlineColorChroma:		chroma(performanceHighlighted.nodeOutlineColor),
			textColorChroma:			chroma(performanceHighlighted.textColor),
			textOutlineColorChroma:		chroma(performanceHighlighted.textOutlineColor)
		};
	
		const performanceNonHighlighted = {
			nodeColor:			performanceHighlightedChroma.nodeColorChroma.set("hsl.l", nonHighlightedRatio * performanceHighlightedChroma.nodeColorChroma.get("hsl.l")).hex(),
			nodeOutlineColor:	performanceHighlightedChroma.nodeOutlineColorChroma.set("hsl.l", nonHighlightedRatio * performanceHighlightedChroma.nodeOutlineColorChroma.get("hsl.l")).hex(),
			textColor:			performanceHighlightedChroma.textColorChroma.set("hsl.l", nonHighlightedRatio * performanceHighlightedChroma.textColorChroma.get("hsl.l")).hex(),
			textOutlineColor:	performanceHighlightedChroma.textOutlineColorChroma.set("hsl.l", nonHighlightedRatio * performanceHighlightedChroma.textOutlineColorChroma.get("hsl.l")).hex()
		};
	
		userTypeColors.nodeColors = {};
	
		userTypeColors.nodeColors.normalMode = {};
		userTypeColors.nodeColors.performanceMode = {};
	
		userTypeColors.nodeColors.normalMode.highlighted = normalHighlighted;
		userTypeColors.nodeColors.normalMode.nonHighlighted = normalNonHighlighted;
	
		userTypeColors.nodeColors.performanceMode.highlighted = performanceHighlighted;
		userTypeColors.nodeColors.performanceMode.nonHighlighted = performanceNonHighlighted;
	
		userTypeColors.linkColors = {};
	
		userTypeColors.linkColors.normalMode = {};
		userTypeColors.linkColors.performanceMode = {};
	
		userTypeColors.linkColors.normalMode.highlighted = chroma(userTypeColors.color).alpha(linkAlpha).hex();
		userTypeColors.linkColors.normalMode.nonHighlighted = chroma(userTypeColors.color).alpha( nonHighlightedRatio * linkAlpha).hex();
	
		userTypeColors.linkColors.performanceMode.highlighted = userTypeColors.darkerColor;
		const performanceHighlightedLinkChroma = chroma(userTypeColors.linkColors.performanceMode.highlighted);

		userTypeColors.linkColors.performanceMode.nonHighlighted = performanceHighlightedLinkChroma.set("hsl.l", nonHighlightedRatio * performanceHighlightedLinkChroma.get("hsl.l")).hex();
	});
}

function loadMap(streamer, year, timeframe, pingType, minPings, newPerformanceMode) {
	performanceMode = newPerformanceMode;

	let fileName = `${streamer}_${year}`;
	if (timeframe !== "year") fileName = `${fileName}_${timeframe}`;
	fileName = `${fileName}_${pingType}`;

	fetch(`./data/${streamer}/${year}/${timeframe}/${fileName}.json`)
    .then((response) => response.json())
    .then((json) => {
		data = json;
		preprocessData(data, pingType);
		const dataCopy = structuredClone(data);
		filterData(dataCopy, minPings);
		postprocessData(dataCopy);
		createGraph(dataCopy);
	});
}

function preprocessData(data, pingType) {
	const isGephiGenerated = Object.hasOwn(data, "attributes");

	if(isGephiGenerated) {
		cooldownTicks = 0;
	}

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

			delete node.attributes;
		}
		else {
			node.x = minGridValue + gridSize * Math.random();
			node.y = minGridValue + gridSize * Math.random();
		}

		node.pingCount = node[pingType];

		node.displayName = node.displayName || node.name;
		node.tooltipText = `<span class=" text-shadow">${node.displayName}<br>
			<span class="${node.userType.toLowerCase()}-type">${node.userType}</span><br>
			<span class="green-text">🡇</span> ${node.pingsReceived} <span class="blue-text">🡅</span> ${node.pingsSent}</span>`;

		// S = pi * r^2
		node.area = 12 * node.pingCount;

		node.radius = Math.max(1, Math.min(250, Math.sqrt(node.area) / sqrtPI));
		node.squareRootRadius =  Math.sqrt(Math.max(0, Math.sqrt(node.radius))) * nodeRelSize;
		node.squaredRadius = node.radius * node.radius;
		node.diameter = 2 * node.radius;
	
		node.outlineWidth = Math.max(2, outlineRatio * node.radius * nodeRelSize);
	
		node.fontSize = Math.max(4, fontSizeRatio * node.radius * nodeRelSize);
		node.fontOutlineWidth = Math.max(1, fontOutlineRatio * node.radius * nodeRelSize);
		node.font = `600 ${node.fontSize}px Montserrat`;

		node.collisionDistance = 5 + 95 * Math.random() + node.outlineWidth + 2 * node.diameter;
		
		node.visibilityLimit = 3 * (node.radius + node.outlineWidth);

		node.colors = colors[node.userType].nodeColors;
		switchNodeColors(node);

		node.connectedLinks = [];
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
		link.forceDistance = 1000 / link.pingCount;
	
		link.sourceNode = data.nodes.find((node) => node.name.localeCompare(link.source) === 0);
		link.targetNode = data.nodes.find((node) => node.name.localeCompare(link.target) === 0);

		if (link.sourceNode.diameter < link.width) link.width = link.sourceNode.diameter;
		if (link.targetNode.diameter < link.width) link.width = link.targetNode.diameter;

		link.colors = colors[link.userType].linkColors;
		switchLinkColor(link);
	});

	delete data.attributes;
}

function postprocessData(dataCopy) {
	dataCopy.links.forEach((link) => {
		const sourceNode = dataCopy.nodes.find((node) => node.name.localeCompare(link.source) === 0);
		const targetNode = dataCopy.nodes.find((node) => node.name.localeCompare(link.target) === 0);

		sourceNode.connectedLinks.push(link);
		targetNode.connectedLinks.push(link);
	});
}

function switchNodeColors(node) {
	const isHighlighted = node.isHighlighted || highlightedNodes.length === 0;

	//console.log("isHighlighted", isHighlighted);

	const newColors = performanceMode
		? isHighlighted
			? node.colors.performanceMode.highlighted
			: node.colors.performanceMode.nonHighlighted
		: isHighlighted
			? node.colors.normalMode.highlighted
			: node.colors.normalMode.nonHighlighted;
	
	node.nodeColor = newColors.nodeColor;
	node.nodeOutlineColor = newColors.nodeOutlineColor;
	node.textColor = newColors.textColor;
	node.textOutlineColor = newColors.textOutlineColor;

	//console.log("after: " + node.nodeColor);
}

function switchLinkColor(link) {
	const isHighlighted = link.isHighlighted || highlightedNodes.length === 0;

	link.color = performanceMode
		?  isHighlighted
			? link.colors.performanceMode.highlighted
			: link.colors.performanceMode.nonHighlighted
		: isHighlighted
			? link.colors.normalMode.highlighted
			: link.colors.normalMode.nonHighlighted;

	//console.log("after: " + link.color);
}

function filterData(dataCopy, minPings) {
	const newNodes = [];

	dataCopy.nodes.forEach((node) => {
		if(node.pingCount >= minPings
		|| node.userType === "Streamer") {
			newNodes.push(node);
			return;
		}

		// if(node.pingCount === 0) {
		// 	data.links = data.links.filter(link => link.sourceNode !== node && link.targetNode !== node);
		// 	return;	
		// }

 		// Remove links attached to node
		dataCopy.links = dataCopy.links.filter(link => link.sourceNode !== node && link.targetNode !== node);

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

	dataCopy.nodes = newNodes;
	assignPlaces(dataCopy);
	onMapLoadedCallback(dataCopy);
}

function assignPlaces(dataCopy) {
	dataCopy.nodes.sort((left, right) => right.pingCount - left.pingCount);

	let i = 1;
	dataCopy.nodes.forEach((node) => node.place = i++);
}

function createGraph(data) {
	const mapElement = document.getElementById("map");

	if (map !== undefined) map._destructor();

	const linkCurvature = performanceMode ? 0 : 0.25;

	map = ForceGraph();
	map(mapElement)
		.width(window.innerWidth)
		.height(window.innerHeight)

		.nodeRelSize(nodeRelSize)
		.nodeId("name")
		.nodeVal("squaredRadius")
		.nodeLabel("tooltipText")
		.nodeColor("nodeColor")

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
			context.strokeStyle = node.nodeOutlineColor;
			context.stroke();
	
			if (node.fontSize * globalScale < 5) return;

			// Label

		    context.font = node.font;
		    context.textAlign = "center";
		    context.textBaseline = "middle";
	
			if(!performanceMode) {
				context.strokeStyle = node.textOutlineColor;
				context.lineWidth = node.fontOutlineWidth;
				context.strokeText(node.displayName, node.x, node.y);
			}
	
			context.fillStyle = node.textColor; 
		    context.fillText(node.displayName, node.x, node.y);
		})

		.linkWidth("width")
		.linkColor("color")
		.linkCurvature(linkCurvature)

		.linkCanvasObjectMode(() => "after")
		.linkCanvasObject((link, context, globalScale) => {
			if(performanceMode) return;

			const links = map.graphData().links;

			if(links[links.length - 1] === link) {
				context.globalCompositeOperation = "source-over";
				context.save();
			}
		})

		.cooldownTicks(cooldownTicks)
		.d3Force("charge", d3.forceManyBody().strength(-30).theta(1.2))
		.d3Force("center", d3.forceCenter().strength(0.025))
		.d3Force("collide", d3.forceCollide((node) => node.collisionDistance).strength(0.5).iterations(1)) 
		.d3Force("link", d3.forceLink(map.graphData().links).id((link) => link.name).distance((link) => link.forceDistance).strength(0.5))
		
		.onRenderFramePre((context, globalScale) => {
			lastGlobalScale = globalScale;

			//t0 = performance.now();
			//map.autoPauseRedraw(true);

			if(!performanceMode) context.globalCompositeOperation = "lighter";

			// if(count === 10) {
			// 	setTimeout(() => {
			// 		console.log(totalT / count);
			// 	}, 15000);
			// }

			// return;
			if(DEBUG) {
				totalFPS.begin();
				totalFT.begin();
			}
		})
		.onRenderFramePost((context, globalScale) => {
			// t1 = performance.now();
			// totalT += t1 - t0;
			// count++; 
			// return;
			if(DEBUG) {
				totalFPS.end();
				totalFT.end();
			}
		})

		.onNodeHover(((node) => {
			highlightedNodes.forEach((node) => {
				node.isHighlighted = false;
			});

			highlightedLinks.forEach((link) => {
				link.isHighlighted = false;
			});

			highlightedNodes = [];
			highlightedLinks = [];

			//map.autoPauseRedraw(false);

			const graphData = map.graphData();
			const nodes = graphData.nodes;
			const links = graphData.links;

			if(!node) {
				nodes.forEach((node) => {
					switchNodeColors(node);
				});
	
				links.forEach((link) => {
					switchLinkColor(link);
				});

				return;
			}

			highlightedNodes.push(node);
			node.isHighlighted = true;
			
			node.connectedLinks.forEach((link) => {
				highlightedLinks.push(link);
				link.isHighlighted = true;

				const sourceNode = link.sourceNode;
				const targetNode = link.targetNode;
				
				highlightedNodes.push(sourceNode);
				highlightedNodes.push(targetNode);

				sourceNode.isHighlighted = true;
				targetNode.isHighlighted = true;
			});

			nodes.forEach((node) => {
				switchNodeColors(node);
			});

			links.forEach((link) => {
				switchLinkColor(link);
			});
		}))
		.onZoom((transform) => map.linkWidth((link) => link.width * transform.k))
		// .onNodeDragEnd((node) => {
		//     node.fx = node.x;
		//     node.fy = node.y;
		// })

		.autoPauseRedraw(false)

		.graphData(data)
		.zoomToFit(500, -1500, () => true);
}

function filterNodes(minPings) {
	const dataCopy = structuredClone(data);
	filterData(dataCopy, minPings);
	createGraph(dataCopy);
}

function searchNextNode(userType) {
	let firstUser;
	const lastUser = lastUsersFound[userType];

	let isLastUserFound = false;

	let nextUser;

	for (const node of map.graphData().nodes) {
		if(node.userType !== userType) continue;

		if(!firstUser) {
			firstUser = node.name;
		}

		if(!lastUser) {
			nextUser = node.name;
			lastUsersFound[userType] = nextUser;
			break;
		}

		if(node.name.localeCompare(lastUser) === 0) {
			isLastUserFound = true;
			continue;
		}

		if(isLastUserFound) {
			nextUser = node.name;
			lastUsersFound[userType] = nextUser;
			break;
		}
	}

	if(!nextUser) {
		if(!firstUser) return;

		searchNode(firstUser);
		return;
	}

	searchNode(nextUser);
	return nextUser;
}

function searchNode(userName) {
	const padding = 0.25 * Math.min(window.innerWidth, window.innerHeight);

	const node = map.graphData().nodes.find((node) => node.name.localeCompare(userName) === 0);
	if(node) lastUsersFound[node.userType] = userName;

	map.zoomToFit(1000, padding, (node) => node.name.localeCompare(userName) === 0);
}

function resizeCanvas() {
	if (map === undefined) return;

	bottomLimit = limit * window.innerHeight;
	rightLimit = limit * window.innerWidth;
	topLimit = window.innerHeight - bottomLimit;
	leftLimit = window.innerWidth - rightLimit;

	map.width(window.innerWidth);
	map.height(window.innerHeight);
}

function changePerformanceMode(newPerformanceMode) {
	performanceMode = newPerformanceMode;

	map.graphData().nodes.forEach((node) => {
		switchNodeColors(node);
	});

	//map.autoPauseRedraw(false);
}

function onMapLoaded(callback) {
	onMapLoadedCallback = callback;
}

populateColors();

export {loadMap, data as mapData, resizeCanvas, filterNodes, searchNode, searchNextNode, changePerformanceMode, onMapLoaded};