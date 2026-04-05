import _JSXStyle from "styled-jsx/style";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region virtual:entry.jsx
function Home() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		className: "jsx-c3d7bdab3d70d870 container",
		children: ["container (should be blue)", /* @__PURE__ */ jsx("div", {
			className: "jsx-c3d7bdab3d70d870 child",
			children: "this should be green"
		})]
	}), /* @__PURE__ */ jsx(_JSXStyle, {
		id: "c3d7bdab3d70d870",
		children: ".container.jsx-c3d7bdab3d70d870{color:#00f;padding:3rem}div.child{color:green}"
	})] });
}
//#endregion
export { Home as default };
