import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const color = "red";
const otherColor = "green";
const A = () => /* @__PURE__ */ jsxs("div", {
	className: "jsx-36fb8178b420e502",
	children: [/* @__PURE__ */ jsx("p", {
		className: "jsx-36fb8178b420e502",
		children: "test"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "36fb8178b420e502",
		children: `p.jsx-36fb8178b420e502{color:${color}}`
	})]
});
const B = () => /* @__PURE__ */ jsxs("div", {
	className: "jsx-36fb8178b420e502",
	children: [/* @__PURE__ */ jsx("p", {
		className: "jsx-36fb8178b420e502",
		children: "test"
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "36fb8178b420e502",
		children: `p.jsx-36fb8178b420e502{color:${otherColor}}`
	})]
});
var virtual_entry_default = () => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(A, {}), /* @__PURE__ */ jsx(B, {})] });
//#endregion
export { virtual_entry_default as default };
