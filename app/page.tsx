// @ts-nocheck

"use client";

import { useState, useCallback, useRef } from "react";
import { ReactFlow, ReactFlowProvider, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";

import "@xyflow/react/dist/style.css";

import FlowToolbar from "@/components/FlowToolbar";
import Sidebar from "@/components/Sidebar";
import { DnDProvider, useDnD } from "@/components/DnDContext";

const initialNodes = [
	{ id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
	{ id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

function DnDFlow() {
	const [nodes, setNodes] = useState(initialNodes);
	const [edges, setEdges] = useState(initialEdges);

	const onNodesChange = useCallback(
		(changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback((params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)), []);

	const reactFlowWrapper = useRef(null);
	const [type, setType] = useDnD();
	const { screenToFlowPosition } = useReactFlow();

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event) => {
			event.preventDefault();

			// check if the dropped element is valid
			if (!type) {
				return;
			}

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});
			const newNode = {
				id: uuid(),
				type,
				position,
				data: { label: `${type} node` },
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[screenToFlowPosition, type],
	);

	const onDragStart = (event, nodeType) => {
		setType(nodeType);
		event.dataTransfer.setData("text/plain", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<>
			<Sidebar />
			<div className="reactflow-wrapper w-screen h-screen" ref={reactFlowWrapper}>
				<ReactFlow {...{ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver }} fitView />
			</div>
		</>
	);
}

export default function Home() {
	return (
		<ReactFlowProvider>
			<DnDProvider>
				<DnDFlow />
			</DnDProvider>
		</ReactFlowProvider>
	);
}
