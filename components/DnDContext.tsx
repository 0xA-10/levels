// @ts-nocheck
// source: https://reactflow.dev/examples/interaction/drag-and-drop?utm_source=chatgpt.com

import { createContext, useContext, useState } from "react";

const DnDContext = createContext([null, (_) => {}]);

export const DnDProvider = ({ children }) => {
	const [type, setType] = useState(null);

	return <DnDContext.Provider value={[type, setType]}>{children}</DnDContext.Provider>;
};

export default DnDContext;

export const useDnD = () => {
	return useContext(DnDContext);
};
