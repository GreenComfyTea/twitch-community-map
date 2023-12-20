import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { getData } from "./data.js";

function Graph() {
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

	let dataString = getData();
	let data = JSON.parse(dataString);
  
	// The force simulation mutates links and nodes, so create a copy
	// so that re-evaluating this cell produces the same result.
	const nodes = data.nodes.map(d => ({...d}));
	const links = data.links.map(d => ({...d}));

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
		.force("y", d3.forceY().strength(0.025))
		.on("tick", draw);
  
	// Create the canvas.
	const dpi = 2; // devicePixelRatio; // _e.g._, 2 for retina screens
	const canvas = d3.create("canvas")
		.attr("width", dpi * width)
		.attr("height", dpi * height)
		.attr("style", `width: ${width}px; max-width: 100%; height: auto;`)
		.node();
  
	const context = canvas.getContext("2d");
	context.scale(dpi, dpi);
  
	function draw(transform) {
		context.clearRect(0, 0, width, height);
	
		context.save();
		context.globalAlpha = 0.6;
		context.strokeStyle = "#999";
		context.beginPath();        
		links.forEach(drawLink);
		context.stroke();
		context.restore();
	
		context.save();
		context.strokeStyle = "#fff";
		context.globalAlpha = 1;
		nodes.forEach(node => {
			context.beginPath();
			drawNode(node);
			context.fillStyle = colors[node.userType];
			context.strokeStyle = "#fff";
			context.fill();
			context.stroke();
		});
		context.restore();
	}
  
	function drawLink(link) {
	  context.moveTo(link.source.x, link.source.y);
	  context.lineTo(link.target.x, link.target.y);
	}
  
	function drawNode(node) {
	  context.moveTo(node.x + 5, node.y);
	  context.arc(node.x, node.y, 5, 0, 2 * Math.PI);
	}
  
	// Add a drag behavior. The _subject_ identifies the closest node to the pointer,
	// conditional on the distance being less than 20 pixels.
	d3.select(canvas)
		.call(d3.drag()
			.subject(event => {
				const [px, py] = d3.pointer(event, canvas);
				return d3.least(nodes, ({x, y}) => {
					const dist2 = (x - px) ** 2 + (y - py) ** 2;
					if (dist2 < 400) return dist2;
				});
			})
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));

	d3.select(canvas)
		.call(d3.zoom()
			.scaleExtent([1, 8])
			.on("zoom", ({transform}) => zoomed(transform)));
  
	// Reheat the simulation when drag starts, and fix the subject position.
	function dragstarted(event) {
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
	function dragended(event) {
	  if (!event.active) simulation.alphaTarget(0);
	  event.subject.fx = null;
	  event.subject.fy = null;
	}

	const r = 1.5;

	function zoomed(transform) {
		// context.save();
		// context.clearRect(0, 0, width, height);
		// context.translate(transform.x, transform.y);
		// context.scale(transform.k, transform.k);
		// context.beginPath();
		// //for (const [x, y] of data) {
		//  // context.moveTo(x + r, y);
		//   //context.arc(x, y, r, 0, 2 * Math.PI);
		// //}
		// context.fill();
		// context.restore();

        context.save();
        draw(transform);
        context.restore();
	}
  
	// When this cell is re-run, stop the previous simulation. (This doesn’t
	// really matter since the target alpha is zero and the simulation will
	// stop naturally, but it’s a good practice.)
	// invalidation.then(() => simulation.stop());
  
	return canvas;
}

const mapElement = document.getElementById("map");

let graph = Graph();
mapElement.innerHTML = "";
mapElement.appendChild(graph);