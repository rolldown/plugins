import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
var virtual_entry_default = ({ level = 1 }) => {
	return /* @__PURE__ */ jsxs(`h${level}`, {
		className: "jsx-b6ec9074c87ab384 root",
		children: [/* @__PURE__ */ jsx("p", {
			className: "jsx-b6ec9074c87ab384",
			children: "dynamic element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "b6ec9074c87ab384",
			children: ".root.jsx-b6ec9074c87ab384{background:red}"
		})]
	});
};
const TestLowerCase = ({ level = 1 }) => {
	`${level}`;
	return /* @__PURE__ */ jsxs("element", {
		className: "jsx-b6ec9074c87ab384 root",
		children: [/* @__PURE__ */ jsx("p", {
			className: "jsx-b6ec9074c87ab384",
			children: "dynamic element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "b6ec9074c87ab384",
			children: ".root.jsx-b6ec9074c87ab384{background:red}"
		})]
	});
};
const Element2 = "div";
const Test2 = () => {
	return /* @__PURE__ */ jsxs(Element2, {
		className: "root",
		children: [/* @__PURE__ */ jsx("p", {
			className: "jsx-b6ec9074c87ab384",
			children: "dynamic element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "b6ec9074c87ab384",
			children: ".root.jsx-b6ec9074c87ab384{background:red}"
		})]
	});
};
const Test3 = ({ Component = "div" }) => {
	return /* @__PURE__ */ jsxs(Component, {
		className: "jsx-b6ec9074c87ab384",
		children: [/* @__PURE__ */ jsx("p", {
			className: "jsx-b6ec9074c87ab384",
			children: "dynamic element"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "b6ec9074c87ab384",
			children: ".root.jsx-b6ec9074c87ab384{background:red}"
		})]
	});
};
//#endregion
export { Test2, Test3, TestLowerCase, virtual_entry_default as default };
