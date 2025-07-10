// source: https://reactflow.dev/examples/interaction/drag-and-drop?utm_source=chatgpt.com

import { createContext, PropsWithChildren, useContext, useState } from "react";

const DnDContext = createContext([null, (_: any) => {}]);

export const DnDProvider = ({ children }: PropsWithChildren) => {
	const [type, setType] = useState(null);

	return <DnDContext.Provider value={[type, setType]}>{children}</DnDContext.Provider>;
};

export default DnDContext;

export const useDnD = () => {
	return useContext(DnDContext);
};
