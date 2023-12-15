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

var graph = cytoscape({
	container: document.getElementById("map"),
	hideEdgesOnViewport: true,
	showFps: true,
	layout: {
		name: "circle"
	},
	style: [
		{
			selector: "node",
			style: {
				shape: "ellipse",
				width: "data(radius)",
				height: "data(radius)",
				"background-color": "data(color)",
				label: "data(displayName)",
				"border-width": "data(outlineWidth)",
				"border-color": "data(outlineColor)",
			}
		},
		{
			selector: "edge",
			style: {
				"curve-style": "unbundled-bezier",
				"control-point-distances": "-100 110 -100",
				"source-endpoint": "inside-to-node",
				"target-endpoint": "inside-to-node",
				"line-opacity": 0.3,
				width: "data(width)",
				"line-color": "data(color)",
			}
		},
		{
			selector: "node",
			style: {
				color: "white",
				//"font-family": "Montserrat",
				//"font-weight": "bold",
				"text-valign": "center",
				"font-size": "data(labelSize)",
				"text-outline-color": "data(color)",
				"text-outline-width": "data(labelOutlineWidth)",
				"min-zoomed-font-size": "8"
			}
		}
	],
	wheelSensitivity: 0.1,
});

const dataString = getData();
const data = JSON.parse(dataString);

data.nodes.forEach((node) => {
	// if(node.pingsSent <= 1 && node.pingsReceived <= 1) return;

	node.id = node.name;
	node.displayName = node.displayName || node.name;

	node.radius = Math.round(Math.max(20, Math.min(500, node.pingsReceived)));
	node.color = colors[node.userType];

	node.outlineWidth = Math.min(30, Math.max(4, node.radius / 10));
	node.outlineColor = outlineColors[node.userType];

	node.labelSize = Math.max(12, node.radius / 6);
	node.labelOutlineWidth = Math.max(1, node.radius / 20);

    graph.add({
		data: node,
		position: {
			x: Math.random() * 5000,
			y: Math.random() * 5000
		}
	});
});

data.links.forEach((link) => {
	if(link.source === link.target) return;

	link.id = link.source + " -> " + link.target;

	const sourceNode = data.nodes.find((node) => node.name === link.source);
	const targetNode = data.nodes.find((node) =>node.name === link.target);


	link.color = colors[link.userType];
	link.width = Math.max(1, Math.min(sourceNode.radius, Math.min(targetNode.radius, link.pingCount)));
	// node.displayName = node.displayName || node.name;
	// node.radius = Math.round(Math.max(20, Math.min(250, node.pingsSent)));
	// node.color = colors[node.userType];

   graph.add( { data: link } );
});

// graph.layout({
//     name: "cose",
// 	nodeDimensionsIncludeLabels: true,
// }).run();


