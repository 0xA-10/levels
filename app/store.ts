import dagre from "dagre";
import { create } from "zustand";
import {
	type Edge,
	type Node,
	type OnNodesChange,
	type OnEdgesChange,
	type OnConnect,
	addEdge,
	applyNodeChanges,
	applyEdgeChanges,
	Position,
} from "@xyflow/react";
import { WithOptional } from "@/lib/utils";
// Enhanced Dagre auto-layout with support for nested subflows and parent sizing

interface LayoutNode extends WithOptional<Node, "position"> {
	// Allow dynamic sizing via style
	style?: { width?: number; height?: number; [key: string]: any };
	parentId?: string;
}

const DEFAULT_NODE_WIDTH = 172;
const DEFAULT_NODE_HEIGHT = 36;

export function getLayoutedElements(
	nodes: LayoutNode[],
	edges: Edge[],
	direction: "TB" | "LR" = "TB",
): { nodes: Node[]; edges: Edge[] } {
	const isHorizontal = direction === "LR";
	const nodeMap = new Map(nodes.map((n) => [n.id, n]));

	// Group children by parentId (null for root)
	const childMap = new Map<string | null, string[]>();
	nodes.forEach((node) => {
		const parent = node.parentId || null;
		if (!childMap.has(parent)) childMap.set(parent, []);
		childMap.get(parent)!.push(node.id);
	});

	// Recursive layout of each group
	function layoutGroup(parentId: string | null) {
		const groupIds = childMap.get(parentId) || [];
		if (!groupIds.length) return;

		// First layout nested subflows
		groupIds.forEach((id) => layoutGroup(id));

		// Build a fresh Dagre graph for this group
		const g = new dagre.graphlib.Graph();
		g.setDefaultEdgeLabel(() => ({}));
		g.setGraph({ rankdir: direction });

		// Add nodes with their current or default size
		groupIds.forEach((id) => {
			const n = nodeMap.get(id)!;
			const width = n.style?.width ?? DEFAULT_NODE_WIDTH;
			const height = n.style?.height ?? DEFAULT_NODE_HEIGHT;
			g.setNode(id, { width, height });
		});

		// Add edges internal to this group
		edges.forEach((e) => {
			if (groupIds.includes(e.source) && groupIds.includes(e.target)) {
				g.setEdge(e.source, e.target);
			}
		});

		// Perform Dagre layout
		dagre.layout(g);

		// Track bounds for children
		let minX = Infinity,
			minY = Infinity,
			maxX = -Infinity,
			maxY = -Infinity;
		groupIds.forEach((id) => {
			const pos = g.node(id);
			const node = nodeMap.get(id)!;
			const nodeW = node.style?.width ?? DEFAULT_NODE_WIDTH;
			const nodeH = node.style?.height ?? DEFAULT_NODE_HEIGHT;

			// Assign position
			node.position = {
				x: pos.x - nodeW / 2,
				y: pos.y - nodeH / 2,
			};
			node.targetPosition = isHorizontal ? Position.Left : Position.Top;
			node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

			// Expand bounding box
			minX = Math.min(minX, node.position.x);
			minY = Math.min(minY, node.position.y);
			maxX = Math.max(maxX, node.position.x + nodeW);
			maxY = Math.max(maxY, node.position.y + nodeH);
		});

		if (parentId) {
			// Resize and position parent to cover children + margin
			const margin = 20;
			const parent = nodeMap.get(parentId)!;
			const width = maxX - minX + margin * 2;
			const height = maxY - minY + margin * 2;

			parent.style = { ...parent.style, width, height };
			parent.position = { x: minX - margin, y: minY - margin };
			parent.targetPosition = isHorizontal ? Position.Left : Position.Top;
			parent.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
		}
	}

	// Start from root group
	layoutGroup(null);

	return {
		nodes: nodes as Node[],
		edges,
	};
}

export type AppState = {
	level: number;
	nodes: Node[];
	edges: Edge[];
	onNodesChange: OnNodesChange<Node>;
	onEdgesChange: OnEdgesChange;
	onConnect: OnConnect;
	setLevel: (level: number) => void;
	setNodes: (fn: (nodes: Node[]) => Node[]) => void;
	setEdges: (fn: (edges: Edge[]) => Edge[]) => void;
	updateNodeLabel: (nodeId: string, label: string) => void;
};

export type InitialAppState = Partial<AppState> & Required<Pick<AppState, "level" | "nodes" | "edges">>;

const initialNodes = [
	/**
	 * Context
	 */

	{
		id: `PersonalBankingCustomer`,
		data: { label: "Personal Banking Customer", description: "A customer of the bank, with personal banking accounts" },
	},

	{
		id: `InternetBankingSystem`,
		data: {
			label: "Internet Banking System",
			description: "Allows customers to view information about their bank accounts, and make payments",
		},
		type: "group",
	},

	{ id: `EmailSystem`, data: { label: "E-mail System", description: "The internal Microsft Exchange e-mail system." } },

	{
		id: `MainframeBankingSystem`,
		data: {
			label: "Mainframe Banking System",
			description: "Stores all of the core banking information about customers, accounts, transactions, etc.",
		},
	},

	/**
	 * Container
	 */

	{
		id: `WebApplication`,
		data: {
			label: "Web Application",
			description: "Delivers the static content and the Internet banking single page application.",
		},
		parentId: "InternetBankingSystem",
	},

	{
		id: `SinglePageApplication`,
		data: {
			label: "Single Page Application",
			description: "Provides all of the Internet banking functionality to customers via their web browser.",
		},
		parentId: "InternetBankingSystem",
	},

	{
		id: `MobileApp`,
		data: {
			label: "Mobile App",
			description:
				"Provides a limited subset of the Internet banking functionality to customers via their mobile device.",
		},
		parentId: "InternetBankingSystem",
	},

	{
		id: `Database`,
		data: {
			label: "Database",
			description: "Stores user registration information, hashed authentication credentials, access logs, etc.",
		},
		parentId: "InternetBankingSystem",
	},

	{
		id: `ApiApplication`,
		data: {
			label: "API Application",
			description: "Provides Internet banking functionality via a JSON/HTTPS API.",
		},
		type: "group",
		parentId: "InternetBankingSystem",
	},

	/**
	 * Component
	 */

	{
		id: `SignInController`,
		data: {
			label: "Sign In Controller",
			description: "Allows users to sign in to the Internet Banking System.",
		},
		parentId: "ApiApplication",
	},

	{
		id: `ResetPasswordController`,
		data: {
			label: "Reset Password Controller",
			description: "Allows users to reset their password with a single use URL.",
		},
		parentId: "ApiApplication",
	},

	{
		id: `AccountsSummaryController`,
		data: {
			label: "Accounts Summary Controller",
			description: "Provides customers with a summary of their bank accounts.",
		},
		parentId: "ApiApplication",
	},

	{
		id: `SecurityComponent`,
		data: {
			label: "Security Component",
			description: "Provides functionality related to signing in, changing passwords, etc.",
		},
		parentId: "ApiApplication",
	},

	{
		id: `EmailComponent`,
		data: {
			label: "E-mail Component",
			description: "Sends e-mails to users.",
		},
		parentId: "ApiApplication",
	},

	{
		id: `MainframeBankingSystemFacade`,
		data: {
			label: "Mainframe Banking System Facade",
			description: "A facade onto the mainframe banking system.",
		},
		parentId: "ApiApplication",
	},
];

let e = 0;
const initialEdges = [
	/**
	 * Context
	 */

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "InternetBankingSystem",
		label: "Views account balances, and makes payments using",
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "InternetBankingSystem",
		target: "MainframeBankingSystem",
		label: "Gets account information from, and makes payments using",
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "InternetBankingSystem",
		target: "EmailSystem",
		label: "Sends e-mail using",
	},

	{
		id: `e${e++}`,
		source: "EmailSystem",
		target: "PersonalBankingCustomer",
		label: "Sends e-mails to",
	},

	/**
	 * Container
	 */

	{
		id: `e${e++}`,
		source: "WebApplication",
		target: "SinglePageApplication",
		label: "Delivers to the customer's web browser",
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "ApiApplication",
		label: "Makes API calls to",
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "MobileApp",
		target: "ApiApplication",
		label: "Makes API calls to",
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "ApiApplication",
		target: "Database",
		label: "Reads from and writes to",
	},

	{
		// higher-order inferrable
		// higher-order inferring
		id: `e${e++}`,
		source: "ApiApplication",
		target: "MainframeBankingSystem",
		label: "Makes API calls to",
	},

	{
		// higher-order inferrable
		// higher-order inferring
		id: `e${e++}`,
		source: "ApiApplication",
		target: "EmailSystem",
		label: "Sends e-mail using",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "WebApplication",
		label: "Visits bigbank.com/ib using",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "SinglePageApplication",
		label: "Views account balances and makes payments using",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "MobileApp",
		label: "Views account balances and makes payments using",
	},

	/**
	 * Component
	 */

	{
		id: `e${e++}`,
		source: "SignInController",
		target: "SecurityComponent",
		label: "Uses",
	},

	{
		id: `e${e++}`,
		source: "ResetPasswordController",
		target: "EmailComponent",
		label: "Uses",
	},

	{
		id: `e${e++}`,
		source: "ResetPasswordController",
		target: "EmailComponent",
		label: "Uses",
	},

	{
		id: `e${e++}`,
		source: "AccountsSummaryController",
		target: "MainframeBankingSystemFacade",
		label: "Uses",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SecurityComponent",
		target: "Database",
		label: "Reads from and writes to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "EmailComponent",
		target: "EmailSystem",
		label: "Sends e-mail using",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MainframeBankingSystemFacade",
		target: "MainframeBankingSystem",
		label: "Makes API calls to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "SignInController",
		label: "Makes API calls to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MobileApp",
		target: "SignInController",
		label: "Makes API calls to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "ResetPasswordController",
		label: "Makes API calls to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MobileApp",
		target: "ResetPasswordController",
		label: "Makes API calls to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "AccountsSummaryController",
		label: "Makes API calls to",
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MobileApp",
		target: "AccountsSummaryController",
		label: "Makes API calls to",
	},
];

const initialState: InitialAppState = {
	level: 1,
	...getLayoutedElements(initialNodes, initialEdges),
};

const useStore = create<AppState>((set, get) => ({
	level: initialState.level,
	nodes: initialState.nodes,
	edges: initialState.edges,

	onNodesChange: (changes) => {
		set({ nodes: applyNodeChanges(changes, get().nodes) });
	},

	onEdgesChange: (changes) => {
		set({ edges: applyEdgeChanges(changes, get().edges) });
	},

	onConnect: (connection) => {
		set({ edges: addEdge(connection, get().edges) });
	},

	setLevel: (level) => {
		set({ level });
	},

	setNodes: (fn) => {
		set({ nodes: fn(get().nodes) });
	},

	setEdges: (fn) => {
		set({ edges: fn(get().edges) });
	},

	updateNodeLabel: (nodeId, label) => {
		set({
			nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label } } : n)),
		});
	},
}));

export default useStore;
