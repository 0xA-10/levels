// @ts-nocheck
import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";

import useStore from "@/app/store";

export default memo(({ data, id, isConnectable }) => {
	const updateNodeLabel = useStore((state) => state.updateNodeLabel);
	const setNodes = useStore((state) => state.setNodes);
	const [isTextHovered, setIsTextHovered] = useState(false);
	const [isCollapsed, setIsCollasped] = useState(false);

	const expandNode = () => {
		setIsCollasped(false);

		setNodes((nds) =>
			/**
			 * Ensure all children of this node are not hidden
			 */
			nds.map((n) => (n.parentId === id ? { ...n, hidden: false } : n)),
		);
	};

	const collapseNode = () => {
		setIsCollasped(true);

		setNodes((nds) =>
			/**
			 * Ensure all children of this node are hidden
			 */
			nds.map((n) => (n.parentId === id ? { ...n, hidden: true } : n)),
		);
	};

	return (
		<>
			<Handle type="target" position={Position.Left} isConnectable={isConnectable} />
			<div className="fixed">
				{isCollapsed ? (
					<Button variant="ghost" onClick={expandNode}>
						<ChevronDown />
					</Button>
				) : (
					<Button variant="ghost" onClick={collapseNode}>
						<ChevronUp />
					</Button>
				)}
			</div>
			<div onMouseEnter={() => setIsTextHovered(true)} onMouseLeave={() => setIsTextHovered(false)}>
				{isTextHovered ? (
					<Input value={data.label} onChange={(evt) => updateNodeLabel(id, evt.target.value)} className="nodrag" />
				) : (
					data.label
				)}
			</div>
			<Handle type="source" position={Position.Right} isConnectable={isConnectable} />
		</>
	);
});
