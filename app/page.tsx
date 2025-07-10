// @ts-nocheck

"use client";

import { useState, useCallback, useRef } from "react";
import { ReactFlow, ReactFlowProvider, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import { useShallow } from "zustand/react/shallow";

import "@xyflow/react/dist/style.css";

import useStore, { AppNode, AppState } from "./store";
import Sidebar from "@/components/Sidebar";
import { DnDProvider, useDnD } from "@/components/DnDContext";
import BaseNode from "@/components/BaseNode";

const nodeTypes = { default: BaseNode, group: BaseNode };

const selector = (state: AppState) => ({
	level: state.level,
	nodes: state.nodes,
	edges: state.edges,
	onNodesChange: state.onNodesChange,
	onEdgesChange: state.onEdgesChange,
	onConnect: state.onConnect,
});

function DnDFlow() {
	const { level, nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(useShallow(selector)) as AppState;
	const setLevel = useStore((state) => state.setLevel);
	const setNodes = useStore((state) => state.setNodes);
	const setEdges = useStore((state) => state.setEdges);

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

			const newNode: AppNode = {
				id: uuid(),
				type: type as unknown as string, // todo provider weird type
				position,
				data: { label: `${type} node` },
				...(nodeDraggedOnTopOf && {
					/**
					 * When we drag on top of another node, place it at the top left of the inside of the parent
					 * todo: autolayout
					 */
					parentId: nodeDraggedOnTopOf!.id,
					expandParent: true, // the parent node will automatically expand if this node is dragged to the edge of the parent node’s bounds
					// extent: "parent", // locks movement to inside of parent
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
				<ReactFlow
					{...{ nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver }}
					fitView
				/>
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
