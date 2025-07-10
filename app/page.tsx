"use client";

import { useCallback, useRef, DragEventHandler } from "react";
import { type Node, ReactFlow, ReactFlowProvider, Background, useReactFlow } from "@xyflow/react";
import { v4 as uuid } from "uuid";
import { useShallow } from "zustand/react/shallow";

import useStore, { AppState } from "./store";
import Sidebar from "@/components/Sidebar";
import { DnDProvider, useDnD } from "@/components/DnDContext";
import BaseNode from "@/components/BaseNode";
import GroupNode from "@/components/GroupNode";

import "@xyflow/react/dist/style.css";

const nodeTypes = { default: BaseNode, group: GroupNode };

function DnDFlow() {
	const { level, nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
		useShallow((state: AppState) => ({
			level: state.level,
			nodes: state.nodes,
			edges: state.edges,
			onNodesChange: state.onNodesChange,
			onEdgesChange: state.onEdgesChange,
			onConnect: state.onConnect,
		})),
	) as AppState;
	const setLevel = useStore((state) => state.setLevel);
	const setNodes = useStore((state) => state.setNodes);
	const setEdges = useStore((state) => state.setEdges);

	const reactFlowWrapper = useRef(null);
	const [type, setType] = useDnD();
	const { screenToFlowPosition } = useReactFlow();

	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer!.dropEffect = "move";
	}, []) as unknown as DragEventHandler<HTMLDivElement>;

	const onDrop = useCallback(
		(event: DragEvent) => {
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
					position.x <= n.position.x + n.measured!.width! &&
					position.y >= n.position.y &&
					position.y <= n.position.y + n.measured!.height!,
			);

			const newNode: Node = {
				id: uuid(),
				type: type as unknown as string, // todo provider weird type
				position,
				data: { label: `Node` },
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
	) as unknown as DragEventHandler<HTMLDivElement>;

	const onDragStart = ((event: DragEvent, nodeType: string) => {
		setType?.(nodeType);
		event.dataTransfer!.setData("text/plain", nodeType);
		event.dataTransfer!.effectAllowed = "move";
	}) as unknown as DragEventHandler<HTMLDivElement>;

	return (
		<>
			<Sidebar />
			<div className="reactflow-wrapper w-screen h-screen" ref={reactFlowWrapper}>
				<ReactFlow
					{...{ nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver, onDragStart }}
					fitView
					snapToGrid
					snapGrid={[20, 20]}
					zoomOnScroll={false}
				>
					<Background />
				</ReactFlow>
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
