// source: https://reactflow.dev/examples/interaction/drag-and-drop?utm_source=chatgpt.com

import React, { DragEvent } from "react";
import { useDnD } from "./DnDContext";

export default () => {
	const [_, setType] = useDnD();

	const onDragStart = (event: DragEvent, nodeType: string) => {
		setType?.(nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="z-10 fixed">
			<div className="dndnode" onDragStart={(event) => onDragStart(event, "default")} draggable>
				[Node]
			</div>
		</div>
	);
};
