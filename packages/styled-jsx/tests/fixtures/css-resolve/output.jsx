import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const { className, styles } = {
	styles: /* @__PURE__ */ jsx(_JSXStyle, {
		id: "c5b67a8868da3d5a",
		children: "a.jsx-c5b67a8868da3d5a{color:green}"
	}),
	className: "jsx-c5b67a8868da3d5a"
};
function App() {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("a", {
		className,
		children: "Link"
	}), styles] });
}
//#endregion
export { App as default };
