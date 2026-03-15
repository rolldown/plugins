import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function App({ color }) {
	const { className, styles } = {
		styles: /* @__PURE__ */ jsx(_JSXStyle, {
			id: "a71ea8d268680cdb",
			dynamic: [color],
			children: `a.__jsx-style-dynamic-selector{color:${color}}`
		}),
		className: _JSXStyle.dynamic([["a71ea8d268680cdb", [color]]])
	};
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("a", {
		className,
		children: "Link"
	}), styles] });
}
//#endregion
export { App as default };
