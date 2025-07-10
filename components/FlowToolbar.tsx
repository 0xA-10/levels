import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";

function AddNodeButton() {
	return (
		<Button>
			<PlusIcon />
			<span className="sr-only">Add Node</span>
		</Button>
	);
}

export default function FlowToolbar() {
	return (
		<div className="z-10 fixed flex-col">
			<AddNodeButton />
		</div>
	);
}
