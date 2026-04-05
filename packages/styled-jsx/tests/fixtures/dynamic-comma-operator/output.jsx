import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function CommaOperator({ fallback, color }) {
	return /* @__PURE__ */ jsxs("div", {
		className: _JSXStyle.dynamic([["5754aa843832dc02", [(console.log("debug"), color)]]]),
		children: [/* @__PURE__ */ jsx("p", {
			className: _JSXStyle.dynamic([["5754aa843832dc02", [(console.log("debug"), color)]]]),
			children: "Hello"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "5754aa843832dc02",
			dynamic: [(console.log("debug"), color)],
			children: `p.__jsx-style-dynamic-selector{color:${console.log("debug"), color}}`
		})]
	});
}
//#endregion
export { CommaOperator as default };
