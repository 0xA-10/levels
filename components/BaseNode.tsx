import { memo, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { Input } from "./ui/input";
import useStore from "@/app/store";

export default memo(({ data, id, isConnectable }: NodeProps) => {
	const updateNodeLabel = useStore((state) => state.updateNodeLabel);
	const [isTextHovered, setIsTextHovered] = useState(false);

	return (
		<>
			<Handle type="target" position={Position.Left} isConnectable={isConnectable} />
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
