import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function DynamicGlobal({ bgColor }) {
	return /* @__PURE__ */ jsxs("div", {
		className: _JSXStyle.dynamic([["7d606c04400a9dc6", [bgColor]]]),
		children: [/* @__PURE__ */ jsx("p", {
			className: _JSXStyle.dynamic([["7d606c04400a9dc6", [bgColor]]]),
			children: "Hello"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "7d606c04400a9dc6",
			dynamic: [bgColor],
			children: `body{background:${bgColor}}`
		})]
	});
}
//#endregion
export { DynamicGlobal as default };
