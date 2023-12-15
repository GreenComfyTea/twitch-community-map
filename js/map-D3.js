import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { getData } from "./data.js";

let zoom = d3.zoom().on('zoom', handleZoom);
window.onresize = handleResize;

const textColor = "#e5e5e5";
const backgroundColor = "#2a2a2a";

function handleZoom(e) {
	d3.selectAll('svg g').attr('transform', e.transform);
}

function handleResize(e) {
	d3.selectAll('svg').attr("viewBox", [- window.innerWidth / 2, -window.innerHeight / 2,  window.innerWidth, window.innerHeight]);
}

function initZoom() {
	d3.selectAll('svg');
}

export function loadMap(streamer, year, timeframe, pingType) {
	// var data = {
	// 	nodes: [
	// 		{
	// 			name: "HAchubby",
	// 			userType: "Streamer",
	// 			pingsSent: "1000",
	// 			pingsReceived: "5000"
	// 		},
	// 		{
	// 			name: "GreenComfyTea",
	// 			userType: "Subscriber",
	// 			pingsSent: "200",
	// 			pingsReceived: "50"
	// 		},
	// 		{
	// 			name: "CrippledByte",
	// 			userType: "Viewer",
	// 			pingsSent: "150",
	// 			pingsReceived: "25"
	// 		},
	// 		{
	// 			name: "Lyonzy",
	// 			userType: "Moderator",
	// 			pingsSent: "250",
	// 			pingsReceived: "100"
	// 		},
	// 		{
	// 			name: "39daph",
	// 			userType: "VIP",
	// 			pingsSent: "20",
	// 			pingsReceived: "1000"
	// 		},
	// 		{
	// 			name: "AngelsKimi",
	// 			userType: "VIP",
	// 			pingsSent: "75",
	// 			pingsReceived: "2000"
	// 		},
	// 	],
	
	// 	links: [
	// 		{ 
	// 			source: "HAchubby",
	// 			target: "39daph"
	// 		},
	// 		{ 
	// 			source: "HAchubby",
	// 			target: "AngelsKimi"
	// 		},
	// 		{ 
	// 			source: "GreenComfyTea",
	// 			target: "CrippledByte"
	// 		},
	// 		{ 
	// 			source: "GreenComfyTea",
	// 			target: "Lyonzy"
	// 		},
	// 		{ 
	// 			source: "CrippledByte",
	// 			target: "HAchubby"
	// 		},
	// 		{ 
	// 			source: "CrippledByte",
	// 			target: "Lyonzy"
	// 		},
	// 		{ 
	// 			source: "CrippledByte",
	// 			target: "AngelsKimi"
	// 		},
	// 		{ 
	// 			source: "Lyonzy",
	// 			target: "HAchubby"
	// 		},
	// 		{ 
	// 			source: "Lyonzy",
	// 			target: "39daph"
	// 		},
	// 	]
	// };

	let dataString = getData();
	let data = JSON.parse(dataString);

	/*var graph = ForceGraphDisjoint(data, {
		nodeId: d => d.name,
		nodeGroup: d => d.userType,
		nodeTitle: d => [`${d.name} (${d.userType})`, `${d.pingsReceived}`],
		nodeRadius: d => {
			let radius = 20 + 250 * d.pingsReceived / 850;
			return radius;
		},
		width: window.innerWidth,
		height: window.innerHeight,
		invalidation: null // a promise to stop the simulation when the cell is re-run
	});*/

	var graph = ForceGraphDisjoint2(data);

	mapElement.innerHTML = "";
	mapElement.appendChild(graph);
	initZoom();
}

function ForceGraphDisjoint2(data) {
	// Specify the dimensions of the chart.
	const width = window.innerWidth; // outer width, in pixels
	const height = window.innerHeight; // outer height, in pixels

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

	// The force simulation mutates links and nodes, so create a copy
	// so that re-evaluating this cell produces the same result.
	const nodes = data.nodes.map(node => ({...node}));
	const links = data.links.map(link => ({...link}));

	/*let maxPings = 0;
	nodes.forEach(node => {
		if (node.name != "hachubby" && node.pingsSent > maxPings) {
			maxPings = node.pingsSent;
		}
	});*/

	//maxPings *= 1.25;

	nodes.forEach(node => {
		node.radius = Math.max(10, Math.min(250, node.pingsReceived));
		//node.radius = maxPings * Math.log10(node.pingsSent + 1);
	});


	// Create a simulation with several forces.
	const simulation = d3.forceSimulation(nodes)
		.force("link", d3.forceLink(links).id(node => node.name))
		.force("charge", d3.forceManyBody())
		.force("collision", d3.forceCollide(node => 15 + node.radius).iterations(10))
		.force("x", d3.forceX().strength(0.025))
		.force("y", d3.forceY().strength(0.025));

	// Create the SVG container.
	const graphSvg = d3.create("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("viewBox", [-width / 2, -height / 2, width, height])
		.attr("style", "max-width: 100%; height: auto;")
		.call(zoom);

	// Add a line for each link, and a circle for each node.
	const linkSvg = graphSvg.append("g")
		.attr("stroke-opacity", 0.4)
		.selectAll("line")
		.data(links)
		.join("line")
			.attr("stroke", link => colors[link.userType])
			//.attr("stroke-width", link => Math.sqrt(link.value));
			.attr("stroke-width", 1);

	const nodeSvg = graphSvg.append("g")
		.selectAll("circle")
		.data(nodes)
		.join("circle")
			.attr("r", node => node.radius)
			.attr("fill", node => colors[node.userType])
			.attr("stroke-width", node => Math.max(3, node.radius / 10))
			.attr("stroke", node => outlineColors[node.userType]);

	nodeSvg.append("title")
		.text(node => node.displayName);

	const labelSvg = graphSvg.append("g")
		.attr("font-family", "Montserrat")
		.attr("font-size", 12)
		.attr("font-weight", "bold")
		.attr("fill", "#ffffff")
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.attr("pointer-events", "none")
		.attr("paint-order", "stroke")
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.selectAll("text")
		.data(nodes)
		.join("text")
			.text(node => node.displayName === "" ? node.name : node.displayName)
			.attr("font-size", node => Math.max(8, node.radius / 4))
			.attr("stroke-width", node => Math.max(4, node.radius / 15))
			.attr("stroke", node => outlineColors[node.userType]);
	

	// Reheat the simulation when drag starts, and fix the subject position.
	function dragStarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	// Update the subject (dragged node) position during drag.
	function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	// Restore the target alpha so the simulation cools after dragging ends.
	// Unfix the subject position now that it’s no longer being dragged.
	function dragEnded(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	// Add a drag behavior.
	nodeSvg.call(d3.drag()
		.on("start", dragStarted)
		.on("drag", dragged)
		.on("end", dragEnded));

	// Set the position attributes of links and nodes each time the simulation ticks.
	simulation.on("tick", () => {
		linkSvg
			.attr("x1", link => link.source.x)
			.attr("y1", link => link.source.y)
			.attr("x2", link => link.target.x)
			.attr("y2", link => link.target.y);

		nodeSvg
			.attr("cx", node => node.x)
			.attr("cy", node => node.y);

		labelSvg
			.attr("x", node => node.x)
			.attr("y", node => node.y);
	});

	// When this cell is re-run, stop the previous simulation. (This doesn’t
	// really matter since the target alpha is zero and the simulation will
	// stop naturally, but it’s a good practice.)
	//invalidation.then(() => simulation.stop());

	return graphSvg.node();
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/disjoint-force-directed-graph
function ForceGraphDisjoint({
	nodes, // an iterable of node objects (typically [{id}, …])
	links // an iterable of link objects (typically [{source, target}, …])
  }, {
	nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
	nodeGroup, // given d in nodes, returns an (ordinal) value for color
	nodeGroups, // an array of ordinal values representing the node groups
	nodeTitle, // given d in nodes, a title string
	nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
	nodeStroke = textColor, // node stroke color
	nodeStrokeWidth = 5, // node stroke width, in pixels
	nodeStrokeOpacity = 1, // node stroke opacity
	nodeRadius = 5, // node radius, in pixels
	nodeStrength,
	linkSource = ({source}) => source, // given d in links, returns a node identifier string
	linkTarget = ({target}) => target, // given d in links, returns a node identifier string
	linkStrokeOpacity = 0.6, // link stroke opacity
	linkStrokeWidth = 1, // given d in links, returns a stroke width in pixels
	linkStrokeLinecap = "round", // link stroke linecap
	linkStrength,
	// an array of color strings, for the node groups
	colors = {
		Streamer: "#ff5c81",
		Moderator: "#2e9072",
		VIP: "#d4905c",
		Partner: "#00caff",
		Subscriber: "#5fc613",
		Viewer: "#c686e9",
	},
	outlineColors = {
		Streamer: "#b2405a",
		Moderator: "#20644f",
		VIP: "#a35d0e",
		Partner: "#008db2",
		Subscriber: "#428a0d",
		Viewer: "#8a5da3",
	},
	width = window.innerWidth, // outer width, in pixels
	height =  window.innerHeight, // outer height, in pixels
	invalidation // when this promise resolves, stop the simulation
  } = {}) {
	// Compute values.
	const N = d3.map(nodes, nodeId).map(intern);
	const LS = d3.map(links, linkSource).map(intern);
	const LT = d3.map(links, linkTarget).map(intern);
	if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
	const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
	const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
	const R = nodeRadius == null ? null : d3.map(nodes, nodeRadius);
	const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
	
	// Replace the input nodes and links with mutable objects for the simulation.
	nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
	links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));

	// Compute default domains.
	if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

	// Construct the forces.
	const forceNode = d3.forceManyBody();
	const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
	if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
	if (linkStrength !== undefined) forceLink.strength(linkStrength);
  
	const simulation = d3.forceSimulation(nodes)
	// .force("link", d3.forceLink(links).id(d => d.id))
    //   .force("charge", d3.forceManyBody())
    //   .force("x", d3.forceX())
    //   .force("y", d3.forceY());
	.force("link", forceLink)
	.force("charge", forceNode)
	.force("x", d3.forceX().strength(0.01))
	.force("y", d3.forceY().strength(0.01))
	.force("center",  d3.forceCenter())
	.force("collision", d3.forceCollide(typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => 15 + R[i]).iterations(10))
	.on("tick", ticked);

		// .force("link", forceLink)
		// .force("charge", forceNode)
		// .force("collision",
		// 	d3.forceCollide(typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => 15 + R[i])
		// 	.iterations(30))
		// .force("x", d3.forceX())
		// .force("y", d3.forceY())
		// .force("center",  d3.forceCenter(0.1))
		// .on("tick", ticked);
  
	const svg = d3.create("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("preserveAspectRatio", "xMidYMid meet")
		.attr("viewBox", [-width / 2, -height / 2, width, height])
		.attr("style", "max-width: 100%; height: auto; height: intrinsic;")
		.call(zoom);

	const link = svg.append("g")
		//.attr("stroke", linkStroke)
		.attr("stroke-opacity", linkStrokeOpacity)
		.attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
		.attr("stroke-linecap", linkStrokeLinecap)
	  .selectAll("line")
	  .data(links)
	  .join("line")
	  	.attr("stroke", ({index: i}) => colors[G[i]]);
  
	if (W) link.attr("stroke-width", ({index: i}) => W[i]);
  
	const node = svg.append("g")
		.attr("fill", nodeFill)
		.attr("stroke-opacity", nodeStrokeOpacity)
	  .selectAll("circle")
	  .data(nodes)
	  .join("circle")
	  	.attr("stroke", ({index: i}) => outlineColors[G[i]])
		.attr("r", typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => Math.max(5, R[i]))
		.attr("stroke-width", typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => Math.max(5, R[i] / 10))
		.call(drag(simulation));

	const label = svg.append("g")
		.attr("font-family", "Montserrat")
		//.attr("font-size", typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => R[i])
		.attr("font-weight", "bold")
		.attr("fill", textColor)
		.attr("text-anchor", "middle")
		.attr("dominant-baseline", "middle")
		.attr("pointer-events", "none")
		.attr("paint-order", "stroke")
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
	  .selectAll("text")
	  .data(nodes)
	  .join("text")
	  	.attr("stroke", ({index: i}) => outlineColors[G[i]])
	  	.attr("font-size", typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => Math.max(12, R[i] / 4))
		.attr("stroke-width", typeof nodeRadius !== "function" ? nodeRadius : ({index: i}) => Math.max(5, R[i] / 15));
  
	if (G) node.attr("fill", ({index: i}) => colors[G[i]]);
	if (T) {
		node.append("title").text(({index: i}) => T[i]);
		label.text(({index: i}) => N[i]);
	}
  
	// Handle invalidation.
	if (invalidation != null) invalidation.then(() => simulation.stop());
  
	function intern(value) {
	  return value !== null && typeof value === "object" ? value.valueOf() : value;
	}
  
	function ticked() {
	  link
		.attr("x1", d => d.source.x)
		.attr("y1", d => d.source.y)
		.attr("x2", d => d.target.x)
		.attr("y2", d => d.target.y);
  
	  node
		.attr("cx", d => d.x)
		.attr("cy", d => d.y);

	  label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
	}
  
	function drag(simulation) {    
	  function dragStarted(event) {
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	  }
	  
	  function dragged(event) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	  }
	  
	  function dragEnded(event) {
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	  }
	  
	  return d3.drag()
		.on("start", dragStarted)
		.on("drag", dragged)
		.on("end", dragEnded);
	}
  
	return Object.assign(svg.node());
};

const mapElement = document.getElementById("map");