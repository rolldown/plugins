import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
var virtual_entry_default = class {
	render() {
		return /* @__PURE__ */ jsxs("div", {
			className: _JSXStyle.dynamic([["b6bb089eef700632", [a ? "100%" : "200px", b ? "0" : "8px 20px"]]]),
			children: [/* @__PURE__ */ jsx("p", {
				className: _JSXStyle.dynamic([["b6bb089eef700632", [a ? "100%" : "200px", b ? "0" : "8px 20px"]]]),
				children: "test"
			}), /* @__PURE__ */ jsx(_JSXStyle, {
				id: "b6bb089eef700632",
				dynamic: [a ? "100%" : "200px", b ? "0" : "8px 20px"],
				children: `.item.__jsx-style-dynamic-selector{max-width:${a ? "100%" : "200px"};padding:${b ? "0" : "8px 20px"}}`
			})]
		});
	}
};
//#endregion
export { virtual_entry_default as default };
