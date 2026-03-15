import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
var virtual_entry_default = class {
	render() {
		return /* @__PURE__ */ jsxs("div", {
			className: "jsx-fe0ac4ff380779dd root",
			children: [/* @__PURE__ */ jsx("p", {
				className: "jsx-fe0ac4ff380779dd",
				children: "dynamic element"
			}), /* @__PURE__ */ jsx(_JSXStyle, {
				id: "fe0ac4ff380779dd",
				children: ".root.jsx-fe0ac4ff380779dd{background:red}"
			})]
		});
	}
};
const Element2 = "div";
const Test2 = class {
	render() {
		return /* @__PURE__ */ jsxs(Element2, {
			className: "root",
			children: [/* @__PURE__ */ jsx("p", {
				className: "jsx-fe0ac4ff380779dd",
				children: "dynamic element"
			}), /* @__PURE__ */ jsx(_JSXStyle, {
				id: "fe0ac4ff380779dd",
				children: ".root.jsx-fe0ac4ff380779dd{background:red}"
			})]
		});
	}
};
//#endregion
export { Test2, virtual_entry_default as default };
