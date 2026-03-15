import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Component() {
	const dynamicValue = "\"dynamic content\"";
	const color1 = "#FF0000";
	const color2 = "#0000FF";
	const offset = 5;
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-33cde0386ed26aea container",
		children: [/* @__PURE__ */ jsx("div", {
			className: "jsx-33cde0386ed26aea item",
			children: "CSS Variables and Functions"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "33cde0386ed26aea",
			children: `.container.jsx-33cde0386ed26aea{--local-var:${dynamicValue};color:var(--text-color);background:linear-gradient(to right, ${color1}, ${color2})}.container.jsx-33cde0386ed26aea .item.jsx-33cde0386ed26aea{transform:translate(calc(var(--x) + ${offset}px), calc(var(--y) + ${offset}px))}.container.jsx-33cde0386ed26aea div.jsx-33cde0386ed26aea{margin:calc(10px + 10px)}`
		})]
	});
}
//#endregion
export { Component as default };
