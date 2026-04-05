import _JSXStyle from "styled-jsx/style";
import "next/app";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const someVar = "--var-1";
function App({ Component, pageProps }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(_JSXStyle, {
		id: "e50f10633835979d",
		children: `:root{${someVar}:red;background-color:var(${someVar})}`
	}), /* @__PURE__ */ jsx(Component, {
		...pageProps,
		className: "jsx-e50f10633835979d " + (pageProps && pageProps.className != null && pageProps.className || "")
	})] });
}
//#endregion
export { App as default };
