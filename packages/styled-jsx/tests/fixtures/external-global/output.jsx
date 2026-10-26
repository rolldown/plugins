import _JSXStyle from "styled-jsx/style";
import { globalStyles } from "./styles";
import { jsx, jsxs } from "react/jsx-runtime";
// virtual:entry.jsx
function App() {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: "Hello" }), /* @__PURE__ */ jsx(_JSXStyle, {
		id: globalStyles.__hash,
		children: globalStyles
	})] });
}
export { App as default };
