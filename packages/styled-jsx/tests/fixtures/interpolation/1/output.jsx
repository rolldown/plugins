import _JSXStyle from "styled-jsx/style";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Home() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		className: "jsx-09fa9c9dc1745d5d container",
		children: ["container (should be blue)", /* @__PURE__ */ jsx("div", {
			className: "jsx-09fa9c9dc1745d5d responsive",
			children: "responsive (purple on mobile, orange on desktop)"
		})]
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "09fa9c9dc1745d5d",
		children: `.container.jsx-09fa9c9dc1745d5d{color:#00f;padding:3rem}@media (max-width:500px){.container.jsx-09fa9c9dc1745d5d .responsive.jsx-09fa9c9dc1745d5d{color:purple}}`
	})] });
}
//#endregion
export { Home as default };
