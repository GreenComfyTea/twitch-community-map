import { getData } from "./data.js";

// Specify the color scale.
const colors = {
	Streamer: "#ff5c81",
	Moderator: "#2e9072",
	VIP: "#d4905c",
	Partner: "#00caff",
	Subscriber: "#5fc613",
	Viewer: "#c686e9",
};

const outlineColors = {
	Streamer: "#b2405a",
	Moderator: "#20644f",
	VIP: "#a35d0e",
	Partner: "#008db2",
	Subscriber: "#428a0d",
	Viewer: "#8a5da3",
};

const dataString = getData();
const data = JSON.parse(dataString);

data.nodes.forEach((node) => {
	node.id = node.name;
	node.label = node.displayName || node.name;
	node.x = Math.round(5000 * Math.random());
	node.y = Math.round(5000 * Math.random());
	node.size = Math.max(20, Math.min(250, node.pingsSent));
	node.color = outlineColors[node.userType]; // Outline Color
	
	// Node Style
	let nodeStyle = node.style;
	if (!nodeStyle) nodeStyle = {};
	node.style = nodeStyle;

	nodeStyle.fill = colors[node.userType];
	nodeStyle.lineWidth = Math.round(Math.max(2, node.size / 30));

	// Label Style
	if (!node.labelCfg) node.labelCfg = {style: {}};
	else if (!node.labelCfg.style) node.labelCfg.style = {};
	let nodeLabelStyle = node.labelCfg.style;

	nodeLabelStyle.fill = "#fff";
	nodeLabelStyle.stroke = colors[node.userType];
	nodeLabelStyle.lineWidth = Math.round(Math.max(2, node.size / 30));
	nodeLabelStyle.fontFamily = "Montserrat";
	nodeLabelStyle.fontSize = Math.round(Math.max(8, node.size / 5));
	

	//.attr("font-size", node => Math.max(8, node.radius / 4))
	//.attr("stroke-width", node => Math.max(4, node.radius / 15))
});

data.edges.forEach((edge) => {
	let edgeStyle = edge.style;
	if (!edgeStyle) edgeStyle = {};
	edge.style = edgeStyle;

	edgeStyle.stroke = colors[edge.userType] + "80";
});

const graph = new G6.Graph({
	container: "map",
	width: window.innerWidth,
	height: window.innerHeight,
	modes: {
		default: [
			{ type: "drag-canvas", enableOptimize: true},
			{ type: "zoom-canvas", enableOptimize: true},
			{ type: "drag-node", enableOptimize: true}
		]
	},
	defaultNode: {
		type: "circle",
		size: [10],
		color: colors.Viewer,
		style: {
			fill: "#9EC9FF",
			lineWidth: 1,
		}
	},
	labelCfg: {
		style: {
			fill: "#fff",
			fontSize: 8,
		}
	},
	defaultEdge: {
		type: "cubic",
		style: {
			stroke: "#e2e2e2",
		}
	}
});

function handleResize(e) {
	graph.width = window.innerWidth;
	graph.height = window.innerHeight;
}

graph.on('edge:dragstart', (event) => {  

	event.target = graph.get('canvas');  
	graph.emit('canvas:dragstart', event);
});

graph.data(data);
graph.render();

window.onresize = handleResize;