import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function DynamicMultiple({ color, size }) {
	return /* @__PURE__ */ jsxs("div", {
		className: _JSXStyle.dynamic([["88dd35d5da83dde7", [color, size]]]),
		children: [/* @__PURE__ */ jsx("p", {
			className: _JSXStyle.dynamic([["88dd35d5da83dde7", [color, size]]]),
			children: "Hello"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "88dd35d5da83dde7",
			dynamic: [color, size],
			children: `p.__jsx-style-dynamic-selector{color:${color};font-size:${size}px}`
		})]
	});
}
//#endregion
export { DynamicMultiple as default };
