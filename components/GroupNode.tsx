import { memo, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";

import useStore from "@/app/store";

export default memo(({ data, id, isConnectable }: NodeProps) => {
	const updateNodeLabel = useStore((state) => state.updateNodeLabel);
	const setNodes = useStore((state) => state.setNodes);
	const [isTextHovered, setIsTextHovered] = useState(false);
	// todo: not persisting when hiding this node, move into node props
	const [isCollapsed, setIsCollasped] = useState(false);

	const expandNode = () => {
		setIsCollasped(false);

		setNodes((nds) =>
			/**
			 * Expand (show) just the immediate children
			 * This way we persist any nested collapsed state
			 */
			nds.map((n) => (n.parentId === id ? { ...n, hidden: false } : n)),
		);
	};

	const collapseNode = () => {
		setIsCollasped(true);

		setNodes((nds) => {
			/**
			 * Collapse (hide) the immediate children AND all descendants
			 */
			const descendantIdMap = new Set(getDescendantIds(nds, id));

			return nds.map((n) => (descendantIdMap.has(n.id) ? { ...n, hidden: true } : n));
		});
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
					<Input
						value={data.label as string}
						onChange={(evt) => updateNodeLabel(id, evt.target.value)}
						className="nodrag"
					/>
				) : (
					(data.label as string)
				)}
			</div>
			<Handle type="source" position={Position.Right} isConnectable={isConnectable} />
		</>
	);
});

function getDescendantIds<Item extends { id: string; parentId?: string }>(items: Item[], targetId: string): string[] {
	const childrenMap: Record<string, string[]> = {};
	for (const { id, parentId } of items) {
		if (parentId != null) {
			if (!childrenMap[parentId]) childrenMap[parentId] = [];
			childrenMap[parentId].push(id);
		}
	}

	const result: string[] = [];
	const queue: string[] = [targetId];

	while (queue.length > 0) {
		const current = queue.shift()!;
		const kids = childrenMap[current];
		if (!kids) continue;

		for (const kid of kids) {
			result.push(kid);
			queue.push(kid);
		}
	}

	return result;
}
