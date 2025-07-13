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

const nodeWidth = 172;
const nodeHeight = 36;
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: Array<WithOptional<Node, "position">>, edges: Array<Edge>, direction = "TB") => {
	const isHorizontal = direction === "LR";
	dagreGraph.setGraph({ rankdir: direction });

	nodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
	});

	edges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	nodes.forEach((node) => {
		const nodeWithPosition = dagreGraph.node(node.id);
		node.targetPosition = isHorizontal ? Position.Left : Position.Top;
		node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

		node.position = {
			x: nodeWithPosition.x - nodeWidth / 2,
			y: nodeWithPosition.y - nodeHeight / 2,
		};
	});

	return { nodes: nodes as Array<Node>, edges };
};

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
		data: { label: "Views account balances, and makes payments using" },
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "InternetBankingSystem",
		target: "MainframeBankingSystem",
		data: { label: "Gets account information from, and makes payments using" },
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "InternetBankingSystem",
		target: "EmailSystem",
		data: { label: "Sends e-mail using" },
	},

	{
		id: `e${e++}`,
		source: "EmailSystem",
		target: "PersonalBankingCustomer",
		data: { label: "Sends e-mails to" },
	},

	/**
	 * Container
	 */

	{
		id: `e${e++}`,
		source: "WebApplication",
		target: "SinglePageApplication",
		data: { label: "Delivers to the customer's web browser" },
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "ApiApplication",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "MobileApp",
		target: "ApiApplication",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferrable
		id: `e${e++}`,
		source: "ApiApplication",
		target: "Database",
		data: { label: "Reads from and writes to" },
	},

	{
		// higher-order inferrable
		// higher-order inferring
		id: `e${e++}`,
		source: "ApiApplication",
		target: "MainframeBankingSystem",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferrable
		// higher-order inferring
		id: `e${e++}`,
		source: "ApiApplication",
		target: "EmailSystem",
		data: { label: "Sends e-mail using" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "WebApplication",
		data: { label: "Visits bigbank.com/ib using" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "SinglePageApplication",
		data: { label: "Views account balances and makes payments using" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "PersonalBankingCustomer",
		target: "MobileApp",
		data: { label: "Views account balances and makes payments using" },
	},

	/**
	 * Component
	 */

	{
		id: `e${e++}`,
		source: "SignInController",
		target: "SecurityComponent",
		data: { label: "Uses" },
	},

	{
		id: `e${e++}`,
		source: "ResetPasswordController",
		target: "EmailComponent",
		data: { label: "Uses" },
	},

	{
		id: `e${e++}`,
		source: "ResetPasswordController",
		target: "EmailComponent",
		data: { label: "Uses" },
	},

	{
		id: `e${e++}`,
		source: "AccountsSummaryController",
		target: "MainframeBankingSystemFacade",
		data: { label: "Uses" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SecurityComponent",
		target: "Database",
		data: { label: "Reads from and writes to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "EmailComponent",
		target: "EmailSystem",
		data: { label: "Sends e-mail using" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MainframeBankingSystemFacade",
		target: "MainframeBankingSystem",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "SignInController",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MobileApp",
		target: "SignInController",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "ResetPasswordController",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MobileApp",
		target: "ResetPasswordController",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "SinglePageApplication",
		target: "AccountsSummaryController",
		data: { label: "Makes API calls to" },
	},

	{
		// higher-order inferring
		id: `e${e++}`,
		source: "MobileApp",
		target: "AccountsSummaryController",
		data: { label: "Makes API calls to" },
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
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		});
	},

	onEdgesChange: (changes) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		});
	},

	onConnect: (connection) => {
		set({
			edges: addEdge(connection, get().edges),
		});
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
