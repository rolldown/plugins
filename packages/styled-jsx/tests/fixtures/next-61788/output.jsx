import _JSXStyle from "styled-jsx/style";
import { jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
const MOBILE_MAX = 767;
function Home() {
	return /* @__PURE__ */ jsxs("div", {
		className: "jsx-1885944453d3ac5f",
		children: [/* @__PURE__ */ jsx("h1", {
			className: "jsx-1885944453d3ac5f header",
			children: "Hello"
		}), /* @__PURE__ */ jsx(_JSXStyle, {
			id: "1885944453d3ac5f",
			children: `.header.jsx-1885944453d3ac5f{font-size:48px}@media screen and (max-width:${MOBILE_MAX}px){.header.jsx-1885944453d3ac5f{font-size:12px}}`
		})]
	});
}
//#endregion
export { Home as default };
