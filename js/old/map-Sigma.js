fetch("./hachubby_graph.gexf")
.then((result) => result.text())
.then((gexf) => {
	let graph = graphologyLibrary.gexf.parse(graphology.Graph, gexf);

	console.log(graph);

	graph._nodes.forEach((node) => {
		console.log(node);
		node.attributes.size /= 10; 
		//graph.setNodeAttribute(nodeIndex, "size", graph.getNodeAttribute(nodeIndex, "size") / 10);
	});

	graph._edges.forEach((edge) => {
		//graph.setEdgeAttribute(edgeIndex, "color", "rgba(192, 192, 192, 0.1)");
		edge.attributes.color = "rgba(192, 0, 0, 0.1)";
	});

	const sigma = new Sigma(graph, document.getElementById('map'), {
		// Performance
		// hideEdgesOnMove: false,
		// hideLabelsOnMove: false,
		// renderLabels: true,
		renderEdgeLabels: false,
		// enableEdgeClickEvents: false,
		// enableEdgeWheelEvents: false,
		// enableEdgeHoverEvents: false,

		// Component rendering
		// defaultNodeColor: "#999",
		// defaultNodeType: "circle",
		// defaultEdgeColor: "#ccc",
		// defaultEdgeType: "line",
		labelFont: "Montserrat",
		labelSize: 14,
		labelWeight: "bold",
		// labelColor: { color: "#000" },
		// edgeLabelFont: "Arial",
		edgeLabelSize: 0.1,
		// edgeLabelWeight: "normal",
		edgeLabelColor: { attribute: "color" },
		// stagePadding: 30,
		zoomToSizeRatioFunction: (x) => x,
		itemSizesReference: "positions",

		// Labels
		labelDensity: 10,
		// labelGridCellSize: 100,
		labelRenderedSizeThreshold: 10,

		// Reducers
		// nodeReducer: null,
		// edgeReducer: null,

		// Features
		// zIndex: false,
		// minCameraRatio: 0.1,
		// maxCameraRatio: 1,

		// Renderers
		// labelRenderer: label_1.default,
		// hoverRenderer: hover_1.default,
		// edgeLabelRenderer: edge_label_1.default,

		// Lifecycle
		// allowInvalidContainer: false,

		// Program classes
		// nodeProgramClasses: {},
		// nodeHoverProgramClasses: {},
		// edgeProgramClasses: {},
	});

	// State for drag'n'drop
	let draggedNode = null;
	let isDragging = false;

	// On mouse down on a node
	//  - we enable the drag mode
	//  - save in the dragged node in the state
	//  - highlight the node
	//  - disable the camera so its state is not updated
	sigma.on("downNode", (e) => {
	isDragging = true;
	draggedNode = e.node;
	graph.setNodeAttribute(draggedNode, "highlighted", true);
	});

	// On mouse move, if the drag mode is enabled, we change the position of the draggedNode
	sigma.getMouseCaptor().on("mousemovebody", (e) => {
	if (!isDragging || !draggedNode) return;

	// Get new position of node
	const pos = sigma.viewportToGraph(e);

	graph.setNodeAttribute(draggedNode, "x", pos.x);
	graph.setNodeAttribute(draggedNode, "y", pos.y);

	// Prevent sigma to move camera:
	e.preventSigmaDefault();
	e.original.preventDefault();
	e.original.stopPropagation();
	});

	// On mouse up, we reset the autoscale and the dragging mode
	sigma.getMouseCaptor().on("mouseup", () => {
	if (draggedNode) {
		graph.removeNodeAttribute(draggedNode, "highlighted");
	}
	isDragging = false;
	draggedNode = null;
	});

	// Disable the autoscale at the first down interaction
	sigma.getMouseCaptor().on("mousedown", () => {
	if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
	});
});

