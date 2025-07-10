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
} from "@xyflow/react";

export type AppNode = Node;

export type AppState = {
	level: number;
	nodes: AppNode[];
	edges: Edge[];
	onNodesChange: OnNodesChange<AppNode>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	setLevel: (level: number) => void;
	setNodes: (fn: (nodes: AppNode[]) => AppNode[]) => void;
	setEdges: (fn: (edges: Edge[]) => Edge[]) => void;
	updateNodeLabel: (nodeId: string, label: string) => void;
	updateNodeSize: (nodeId: string, size: { width: number } | { height: number }) => void;
	updateNodePosition: (nodeId: string, position: { x: number } | { y: number }) => void;
};

export type InitialAppState = Partial<AppState> & Required<Pick<AppState, "level" | "nodes" | "edges">>;

const initialNodes = [
	{ id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
	{ id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const initialState: InitialAppState = {
	level: 1,
	nodes: initialNodes,
	edges: initialEdges,
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
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					// it's important to create a new object here, to inform React Flow about the cahnges
					return { ...node, data: { ...node.data, label } };
				}

				return node;
			}),
		});
	},

	updateNodeSize: (nodeId, size) => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					// it's important to create a new object here, to inform React Flow about the cahnges
					return { ...node, measured: { ...node.measured, ...size } };
				}

				return node;
			}),
		});
	},

	updateNodePosition: (nodeId, position) => {
		set({
			nodes: get().nodes.map((node) => {
				if (node.id === nodeId) {
					// it's important to create a new object here, to inform React Flow about the cahnges
					return { ...node, position: { ...node.position, ...position } };
				}

				return node;
			}),
		});
	},
}));

export default useStore;
