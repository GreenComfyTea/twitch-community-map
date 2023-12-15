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

var data;
var map;


function loadMap(streamer, year, timeframe, pingType) {
	let fileName = `${streamer}_${year}`;
	if (timeframe !== "year") fileName = `${fileName}_${timeframe}`;
	fileName = `${fileName}_${pingType}`;

	fetch(`./data/${streamer}/${year}/${timeframe}/${fileName}.json`)
    .then((response) => response.json())
    .then((json) => {
		data = json;
		preprocessData(data, pingType);
		createGraph(data);
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
			node.x = nodeAttributes.x || 0;
			node.y = nodeAttributes.y || 0;

			delete node.attributes;
		}
		
		node.displayName = node.displayName || node.name;
	
		node.color = colors[node.userType];
	
		// S = pi * r^2
		node.area = 100 * node[pingType];

		node.radius = Math.max(5, Math.min(250, Math.sqrt(node.area) / sqrtPI));
		node.squaredRadius = node.radius * node.radius;
		node.diameter = 2 * node.radius;
	
		node.outlineColor = outlineColors[node.userType];
		node.outlineWidth = Math.max(8, outlineProportion * node.radius * nodeRelSize);
	
		node.fontSize = Math.max(20, fontSizeProportion * node.radius * nodeRelSize);
		node.fontOutlineWidth = Math.max(10, fontOutlineProportion * node.radius * nodeRelSize);

		node.collisionDistance = 5 + 45 * Math.random() + node.outlineWidth + 2 * node.diameter;
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
	
		const sourceNode = data.nodes.find((node) => node.name === link.source);
		const targetNode = data.nodes.find((node) => node.name === link.target);

		if (sourceNode.diameter < link.width) link.width = sourceNode.diameter;
		if (targetNode.diameter < link.width) link.width = targetNode.diameter;
	});

	delete data.attributes;
}

function createGraph(data) {
	const mapElement = document.getElementById("map");

	if (map !== undefined) map._destructor();

	map = ForceGraph();
	map(mapElement)
		.nodeId("name")
		.nodeRelSize(nodeRelSize)
		.nodeVal("squaredRadius")
		.nodeLabel("displayName")
		.nodeColor("color")
		.nodeCanvasObjectMode(() => "after")
		.nodeCanvasObject((node, context, globalScale) => {
			context.globalCompositeOperation = "source-over";
			// Circle
			// context.beginPath();
			// context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI, false);
			// context.restore(); // restore original state
	
			// context.fillStyle = node.color;
			// context.fill();
	
			// Outline
			context.lineJoin = "round";
			context.lineWidth = node.outlineWidth;
			context.strokeStyle = node.outlineColor;
			context.stroke();
	
			// // Label
		    context.font = `600 ${node.fontSize}px Montserrat`;
		    context.textAlign = "center";
		    context.textBaseline = "middle";
	
			context.strokeStyle = node.color;
			context.lineWidth = node.fontOutlineWidth;
			context.strokeText(node.displayName, node.x, node.y);
	
			context.fillStyle = "white"; 
		    context.fillText(node.displayName, node.x, node.y);
		})
	
		// .nodePointerAreaPaint((node, color, context, globalScale) => {
		// 	// Circle
		// 	context.beginPath();
		// 	context.arc(node.x, node.y, node.radius + node.outlineWidth, 0, 2 * Math.PI, false);
		// 	context.restore(); // restore original state
	
		// 	context.fillStyle = node.color;
		// 	context.fill();
		// })
	
		// .linkCanvasObjectMode("before")
		// .linkCanvasObject((node, context, globalScale) => {
		// 	context.globalCompositeOperation = "screen";
		// })
	
		.linkVisibility(true)
		.linkColor((link) => colors[link.userType] + "30")
		.linkWidth((link) => link.width)
		.linkCurvature(Math.random() < 0.5 ? -0.25 : 0.25)
	
		.d3Force("collide", d3.forceCollide((node) => node.collisionDistance)) 

		.onZoom((transform) => map.linkWidth((link) => link.width * transform.k))
		.onRenderFramePre((context, globalScale) => context.globalCompositeOperation = "screen")
		.onNodeDragEnd((node) => {
		    node.fx = node.x;
		    node.fy = node.y;
		})

		.graphData(data);
}

function onCanvasResize() {
	if (map === undefined) return;
	
	map.width(window.innerWidth);
	map.height(window.innerHeight);
}

export {loadMap, onCanvasResize};