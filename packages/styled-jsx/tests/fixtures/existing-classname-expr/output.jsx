import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function ExistingClassNameExpr() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-ea672cdc862d9536",
		children: [/* @__PURE__ */ jsx("p", {
			className: "jsx-ea672cdc862d9536 dynamic",
			children: "Hello"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "ea672cdc862d9536",
			children: "p.jsx-ea672cdc862d9536{color:red}"
		})]
	});
}
//#endregion
export { ExistingClassNameExpr as default };
