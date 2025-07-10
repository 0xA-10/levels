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

			const nodeDraggedOnTopOf = nodes.find(
				(n) =>
					position.x >= n.position.x &&
					position.x <= n.position.x + n.measured.width &&
					position.y >= n.position.y &&
					position.y <= n.position.y + n.measured.height,
			);

			const newNode = {
				id: uuid(),
				type,
				position,
				data: { label: `${type} node` },
				...(nodeDraggedOnTopOf && {
					/**
					 * When we drag on top of another node, place it at the top left of the inside of the parent
					 * todo: autolayout
					 */
					parentId: nodeDraggedOnTopOf!.id,
					position: { x: 0, y: 0 },
				}),
			};

			if (nodeDraggedOnTopOf && nodeDraggedOnTopOf!.type !== "group") {
				// Ensure a parent node is now of type 'group'
				setNodes((nds) => nds.map((n) => (n.id === nodeDraggedOnTopOf.id ? { ...n, type: "group" } : n)));
			}

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
