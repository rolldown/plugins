import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const { className, styles } = {
	styles: /* @__PURE__ */ jsx(_JSXStyle, {
		id: "8de549733b2cb141",
		children: `a.jsx-8de549733b2cb141{color:green}`
	}),
	className: "jsx-8de549733b2cb141"
};
function App() {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("a", {
		className,
		children: "Link"
	}), styles] });
}
//#endregion
export { App as default };
