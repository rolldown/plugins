import _JSXStyle from "styled-jsx/style";
import { jsx } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Home({ fontFamily }) {
	return /* @__PURE__ */ jsx("div", {
		className: _JSXStyle.dynamic([["865a6bd831a74dc6", [fontFamily]]]),
		children: /* @__PURE__ */ jsx(_JSXStyle, {
			id: "865a6bd831a74dc6",
			dynamic: [fontFamily],
			children: `body{font-family:${fontFamily}}code:before,code:after{content:"\`"}`
		})
	});
}
//#endregion
export { Home as default };
