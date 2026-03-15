import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const darken = (c) => c;
const color = "red";
const otherColor = "green";
const mediumScreen = "680px";
const animationDuration = "200ms";
const animationName = "my-cool-animation";
const obj = { display: "block" };
var virtual_entry_default = ({ display }) => /* @__PURE__ */ jsxs("div", {
	className: "jsx-b5a60d046a505099 " + _JSXStyle.dynamic([
		["a8c0e9cb38b038f1", [display ? "block" : "none"]],
		["70c162d9bdbb7b8e", [display ? "block" : "none"]],
		["2e46f682acc01c04", [darken(color) + 2]],
		["2e46f682acc01c04", [darken(color)]],
		["e50c5346a5c0bca6", [
			color,
			otherColor,
			obj.display
		]]
	]),
	children: [
		/* @__PURE__ */ jsx("p", {
			className: "jsx-b5a60d046a505099 " + _JSXStyle.dynamic([
				["a8c0e9cb38b038f1", [display ? "block" : "none"]],
				["70c162d9bdbb7b8e", [display ? "block" : "none"]],
				["2e46f682acc01c04", [darken(color) + 2]],
				["2e46f682acc01c04", [darken(color)]],
				["e50c5346a5c0bca6", [
					color,
					otherColor,
					obj.display
				]]
			]),
			children: "test"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "e50c5346a5c0bca6",
			dynamic: [
				color,
				otherColor,
				obj.display
			],
			children: `p.${color}.__jsx-style-dynamic-selector{color:${otherColor};display:${obj.display}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "ea672cdc862d9536",
			children: "p.jsx-b5a60d046a505099{color:red}"
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "9fd59fed37bc02b4",
			children: `body{background:${color}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "9fd59fed37bc02b4",
			children: `body{background:${color}}`
		}),
		"// the next two should have the same hash",
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "2e46f682acc01c04",
			children: `p.jsx-b5a60d046a505099{color:${color}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "2e46f682acc01c04",
			children: `p.jsx-b5a60d046a505099{color:${color}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "2e46f682acc01c04",
			dynamic: [darken(color)],
			children: `p.__jsx-style-dynamic-selector{color:${darken(color)}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "2e46f682acc01c04",
			dynamic: [darken(color) + 2],
			children: `p.__jsx-style-dynamic-selector{color:${darken(color) + 2}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "492127a8d0b2d5a3",
			children: `@media (min-width:${mediumScreen}){p.jsx-b5a60d046a505099{color:red}}p.jsx-b5a60d046a505099{color:red}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "af7fff6435df3daa",
			children: `p.jsx-b5a60d046a505099{animation-duration:${animationDuration}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "e7d5c5776a260392",
			children: `p.jsx-b5a60d046a505099{animation:forwards ${animationDuration};animation-timeline:${animationName}}div.jsx-b5a60d046a505099{background:${color}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "70c162d9bdbb7b8e",
			dynamic: [display ? "block" : "none"],
			children: `span.__jsx-style-dynamic-selector{display:${display ? "block" : "none"}}`
		}),
		/* @__PURE__ */ jsx(_JSXStyle, {
			id: "a8c0e9cb38b038f1",
			dynamic: [display ? "block" : "none"],
			children: `span.__jsx-style-dynamic-selector:before{display:${display ? "block" : "none"};content:"\`"}`
		})
	]
});
//#endregion
export { virtual_entry_default as default };
