// @ts-nocheck
import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";

export default memo(({ data, isConnectable }) => {
	const [isTextHovered, setIsTextHovered] = useState(false);

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				onConnect={(params) => console.log("handle onConnect", params)}
				isConnectable={isConnectable}
			/>
			<div onMouseEnter={() => setIsTextHovered(true)} onMouseLeave={() => setIsTextHovered(false)}>
				{isTextHovered && "hovered "}
				{data.label}
			</div>
			<Handle type="source" position={Position.Right} isConnectable={isConnectable} />
		</>
	);
});
