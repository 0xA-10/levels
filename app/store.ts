import dagre from "dagre";
import { create } from "zustand";
import {
	type Edge,
	type Node,
	type OnNodesChange,
	type OnEdgesChange,
	type OnConnect,
	addEdge,
	applyNodeChanges,
	applyEdgeChanges,
	Position,
} from "@xyflow/react";

const nodeWidth = 172;
const nodeHeight = 36;
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({ rankdir: direction });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		node.targetPosition = isHorizontal ? Position.Left : Position.Top;
		node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

		node.position = {
			x: nodeWithPosition.x - nodeWidth / 2,
			y: nodeWithPosition.y - nodeHeight / 2,
		};
	});

	return { nodes, edges };
};

export type AppState = {
	level: number;
	nodes: Node[];
	edges: Edge[];
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	setLevel: (level: number) => void;
	setNodes: (fn: (nodes: Node[]) => Node[]) => void;
	setEdges: (fn: (edges: Edge[]) => Edge[]) => void;
	updateNodeLabel: (nodeId: string, label: string) => void;
};

export type InitialAppState = Partial<AppState> & Required<Pick<AppState, "level" | "nodes" | "edges">>;

const initialNodes = [
	{ id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" }, type: "group" },
	{ id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
	{ id: "n3", position: { x: 0, y: 100 }, data: { label: "Node 3" }, parentId: "n1" },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const initialState: InitialAppState = {
	level: 1,
	...getLayoutedElements(initialNodes, initialEdges),
};

const useStore = create<AppState>((set, get) => ({
	level: initialState.level,
	nodes: initialState.nodes,
	edges: initialState.edges,

	onNodesChange: (changes) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},

	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},

	onConnect: (connection) => {
		set({
			edges: addEdge(connection, get().edges),
		});
	},

	setLevel: (level) => {
		set({ level });
	},

	setNodes: (fn) => {
		set({ nodes: fn(get().nodes) });
	},

	setEdges: (fn) => {
		set({ edges: fn(get().edges) });
	},

	updateNodeLabel: (nodeId, label) => {
		set({
			nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label } } : n)),
		});
	},
}));

export default useStore;
