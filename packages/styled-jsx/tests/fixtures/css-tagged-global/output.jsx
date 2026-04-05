import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const globalStyles = /* @__PURE__ */ new String("body{margin:0;padding:0}");
globalStyles.__hash = "525d340193bd62ff";
function App() {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: "Hello" }), /* @__PURE__ */ jsx(_JSXStyle, {
		id: globalStyles.__hash,
		children: globalStyles
	})] });
}
//#endregion
export { App as default };
