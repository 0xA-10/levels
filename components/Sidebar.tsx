// @ts-nocheck
// source: https://reactflow.dev/examples/interaction/drag-and-drop?utm_source=chatgpt.com

import React from "react";
import { useDnD } from "./DnDContext";

export default () => {
	const [_, setType] = useDnD();

	const onDragStart = (event, nodeType) => {
		console.log("dragdnd", { event, nodeType });
		setType(nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="z-10 fixed">
			<div className="description">You can drag these nodes to the pane on the right.</div>
			<div className="dndnode input" onDragStart={(event) => onDragStart(event, "input")} draggable>
				Input Node
			</div>
			<div className="dndnode" onDragStart={(event) => onDragStart(event, "default")} draggable>
				Default Node
			</div>
			<div className="dndnode output" onDragStart={(event) => onDragStart(event, "output")} draggable>
				Output Node
			</div>
		</div>
	);
};
