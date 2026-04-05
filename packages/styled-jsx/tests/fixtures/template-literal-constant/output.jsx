import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const color = `red`;
const size = `680px`;
function TemplateLiteralConstant() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-3493be51921b5f06",
		children: [
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "663b620258f0353b",
				children: `p.jsx-3493be51921b5f06{color:${color}}`
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "a85f9435f61bf38d",
				children: "p.jsx-3493be51921b5f06{color:#00f}"
			}),
			/* @__PURE__ */ jsx(_JSXStyle, {
				id: "0193725c2d4703e9",
				children: `@media (min-width:${size}){p.jsx-3493be51921b5f06{color:green}}`
			})
		]
	});
}
//#endregion
export { TemplateLiteralConstant as default };
